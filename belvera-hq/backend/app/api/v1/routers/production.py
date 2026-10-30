from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from....core.database import get_db
from....models.production import Batch, BatchIngredientUsage
from....models.product import Product, ProductVersion, RecipeIngredient
from....models.supplier import Ingredient
import datetime, random
from collections import defaultdict

router = APIRouter()

def find_product(db, pid_or_name):
    p = db.query(Product).filter_by(id=pid_or_name).first()
    if p: return p
    return db.query(Product).filter(Product.name.ilike(f"%{pid_or_name}%")).first()

# --- AI ENGINE GENERIC ---
def ai_analyze_recipe_cost(db, product_id):
    version=db.query(ProductVersion).filter_by(product_id=product_id).order_by(ProductVersion.created_at.desc()).first()
    if not version: return {"cost_per_tub":0,"ingredients":0}
    recipe=db.query(RecipeIngredient).filter_by(product_version_id=version.id).all()
    cost=0
    for ri in recipe:
        ing=db.query(Ingredient).filter_by(id=ri.ingredient_id).first()
        if ing:
            qty=float(getattr(ri,'quantity_grams',0) or getattr(ri,'quantity',0) or 0)
            cost+=(qty/1000.0)*float(ing.cost_per_unit or 0)
    return {"cost_per_tub": round(cost,2), "ingredients": len(recipe), "recipe_id": version.id}

@router.get("/batches")
def list_batches(db: Session = Depends(get_db)):
    batches=db.query(Batch).order_by(Batch.created_at.desc()).all()
    out=[]
    for b in batches:
        prod=db.query(Product).filter_by(id=b.product_id).first()
        # AI flag
        margin=b.margin_percent or 0
        if margin>60: flag="🔥 AI: Scale this - High Margin"
        elif margin<30: flag="⚠️ AI: Low Margin - Raise Price"
        elif b.quantity_tubs and b.quantity_tubs<10: flag="💡 AI: Make 20+ tubs for 15% cheaper"
        else: flag="✅ AI: Good"
        out.append({
            "id":b.id,"batch_number":b.batch_number,"product_name":prod.name if prod else "Unknown",
            "product_id":b.product_id,"status":b.status,"quantity_tubs":b.quantity_tubs,
            "batch_size":b.quantity_tubs,"tub_size_grams":b.tub_size_grams,"total_cost":b.total_cost,
            "cost_per_tub":b.cost_per_tub,"suggested_retail_per_tub":b.suggested_retail_per_tub,
            "profit_per_tub":b.profit_per_tub,"margin_percent":b.margin_percent,"created_at":b.created_at,
            "ai_flag":flag
        })
    return out

@router.post("/batches")
def create_batch(data: dict, db: Session = Depends(get_db)):
    raw=data.get('product_id') or data.get('product_name')
    product=find_product(db, raw)
    if not product: raise HTTPException(404, f"Product '{raw}' not found")

    version=db.query(ProductVersion).filter_by(product_id=product.id).order_by(ProductVersion.created_at.desc()).first()
    if not version:
        version=ProductVersion(product_id=product.id, version_number="1.0", testing_notes="Auto")
        db.add(version); db.commit(); db.refresh(version)

    recipe=db.query(RecipeIngredient).filter_by(product_version_id=version.id).all()
    qty=float(data.get('quantity_tubs') or data.get('batch_size') or 10)
    tub=float(data.get('tub_size_grams') or 500)

    # AI COST
    usages=[]; ing_cost=0
    for ri in recipe:
        ing=db.query(Ingredient).filter_by(id=ri.ingredient_id).first()
        if not ing: continue
        per=float(getattr(ri,'quantity_grams',0) or getattr(ri,'quantity',0) or 10)
        batch_g=per*qty
        c=(batch_g/1000.0)*float(ing.cost_per_unit or 0)
        ing_cost+=c
        usages.append({"id":ing.id,"grams":batch_g,"cost_per_kg":float(ing.cost_per_unit or 0),"cost":c})

    # AI OPTIMIZATION: bulk discount
    ai_bulk_discount = 0.85 if qty>=20 else 0.92 if qty>=15 else 1.0
    pack=float(data.get('packaging_cost_per_tub',0.8))*qty
    labor=float(data.get('labor_cost',15.0))
    total=(ing_cost+pack)*ai_bulk_discount + labor
    cpu=total/qty if qty else 0
    retail=float(data.get('suggested_retail_per_tub') or round(cpu*2.5,2))
    profit=retail-cpu
    margin=(profit/retail*100) if retail else 0

    bn=data.get('batch_number') or f"B-{datetime.datetime.now().year}-{random.randint(1000,9999)}"
    b=Batch(batch_number=bn, product_id=product.id, product_version_id=version.id,
            quantity_tubs=qty, tub_size_grams=tub, total_grams=qty*tub,
            ingredient_cost_total=round(ing_cost,2), packaging_cost_total=round(pack,2),
            labor_cost=labor, total_cost=round(total,2), cost_per_tub=round(cpu,2),
            suggested_retail_per_tub=retail, profit_per_tub=round(profit,2),
            margin_percent=round(margin,1), status=data.get('status','planned'), notes=data.get('notes',''))
    db.add(b); db.commit(); db.refresh(b)
    for u in usages:
        db.add(BatchIngredientUsage(batch_id=b.id, ingredient_id=u["id"], planned_grams=u["grams"], actual_grams=u["grams"], cost_per_kg=u["cost_per_kg"], cost_total=round(u["cost"],2)))
    db.commit()
    # DEDUCT REAL
    for u in usages:
        ing=db.query(Ingredient).filter_by(id=u["id"]).first()
        if ing: ing.stock_quantity=max(0,(ing.stock_quantity or 0)-u["grams"]/1000.0)
    db.commit()

    ai_msg = f"AI: Cost ${cpu:.2f}/tub | Margin {margin:.1f}% | {'🔥 SCALE: 20 tubs = $'+str(round(cpu*0.85,2))+'/tub' if qty<20 else '✅ Optimal batch size'} | Profit ${profit*qty:.2f} total"
    return {**b.__dict__, "ai_insight": ai_msg, "ai_bulk_saved": round(ing_cost*(1-ai_bulk_discount),2)}

@router.get("/ai/insights/{product_id}")
def ai_insights(product_id: str, db: Session = Depends(get_db)):
    product=find_product(db, product_id)
    if not product: raise HTTPException(404,"Product not found")
    batches=db.query(Batch).filter_by(product_id=product.id).all()
    analysis=ai_analyze_recipe_cost(db, product.id)
    if not batches:
        return {"product":product.name,"ai":f"AI: No batches yet. Recipe cost ${analysis['cost_per_tub']}/tub - make first batch of 20 tubs for best COGS","cost_per_tub":analysis['cost_per_tub']}
    avg_cost=sum([b.cost_per_tub or 0 for b in batches])/len(batches)
    avg_margin=sum([b.margin_percent or 0 for b in batches])/len(batches)
    total_profit=sum([(b.profit_per_tub or 0)*(b.quantity_tubs or 0) for b in batches])
    best=max(batches, key=lambda x: x.margin_percent or 0) if batches else None
    return {
        "product":product.name,
        "total_batches":len(batches),
        "avg_cost_per_tub": round(avg_cost,2),
        "avg_margin": round(avg_margin,1),
        "total_profit": round(total_profit,2),
        "ai_recommendations": [
            f"AI: Avg cost ${avg_cost:.2f}/tub - Bulk 20+ tubs saves 15%",
            f"AI: Avg margin {avg_margin:.1f}% - {'Raise price to $'+str(round(avg_cost*2.8,2)) if avg_margin<40 else 'Pricing optimal'}",
            f"AI: Best batch {best.batch_number if best else 'N/A'} with {best.margin_percent if best else 0}% margin - replicate it",
            f"AI: Total profit ${total_profit:.2f} from {len(batches)} batches",
            f"AI: Suggested retail ${round(avg_cost*2.5,2)} for 60% margin"
        ]
    }

@router.get("/ai/optimize")
def ai_optimize_all(db: Session = Depends(get_db)):
    products=db.query(Product).all()
    out=[]
    for p in products:
        batches=db.query(Batch).filter_by(product_id=p.id).all()
        if not batches: continue
        avg_c=sum([b.cost_per_tub or 0 for b in batches])/len(batches)
        avg_m=sum([b.margin_percent or 0 for b in batches])/len(batches)
        out.append({"product":p.name,"id":p.id,"batches":len(batches),"avg_cost":round(avg_c,2),"avg_margin":round(avg_m,1),"ai_tip":f"{'🔥 Scale' if avg_m>60 else '💡 Improve'} - Make 20 tubs -> ${round(avg_c*0.85,2)}/tub"})
    return {"ai_summary": f"AI Analyzed {len(out)} products", "suggestions": out}

@router.post("/batches/{batch_id}/complete")
def complete_batch(batch_id: str, db: Session = Depends(get_db)):
    b=db.query(Batch).filter_by(id=batch_id).first()
    if not b: raise HTTPException(404,"Not found")
    b.status="completed"; b.completed_at=datetime.datetime.utcnow(); db.commit(); db.refresh(b)
    return {"batch":b.__dict__,"ai":"AI: Ready for POS - List at $"+str(b.suggested_retail_per_tub)}

@router.delete("/batches/{batch_id}")
def delete_batch(batch_id: str, db: Session = Depends(get_db)):
    b=db.query(Batch).filter_by(id=batch_id).first()
    if not b: raise HTTPException(404,"Not found")
    db.query(BatchIngredientUsage).filter_by(batch_id=batch_id).delete()
    db.delete(b); db.commit()
    return {"deleted":True}

@router.get("/cogs-analysis")
def cogs_analysis(db: Session = Depends(get_db)):
    batches=db.query(Batch).all()
    d={}
    for b in batches:
        prod=db.query(Product).filter_by(id=b.product_id).first()
        n=prod.name if prod else "Unknown"
        d.setdefault(n,{"total_batches":0,"total_tubs":0,"total_profit":0,"batches":[]})
        d[n]["total_batches"]+=1; d[n]["total_tubs"]+=b.quantity_tubs or 0
        d[n]["total_profit"]+=(b.profit_per_tub or 0)*(b.quantity_tubs or 0)
        d[n]["batches"].append(b)
    for k,v in d.items():
        if v["batches"]:
            v["avg_cost"]=round(sum([x.cost_per_tub or 0 for x in v["batches"]])/len(v["batches"]),2)
            v["avg_margin"]=round(sum([x.margin_percent or 0 for x in v["batches"]])/len(v["batches"]),1)
            v["total_profit"]=round(v["total_profit"],2)
            v["ai"]=f"AI: {k} - {v['avg_margin']}% avg - make 20 tubs batch"
            del v["batches"]
    return d