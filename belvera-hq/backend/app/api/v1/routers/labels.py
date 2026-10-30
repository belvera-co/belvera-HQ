from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ....core.database import get_db
from ....models.production import Batch
from ....models.product import Product, ProductVersion, RecipeIngredient
from ....models.supplier import Ingredient, PackagingItem
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/labels/batch/{batch_id}")
def get_batch_label(batch_id: str, db: Session = Depends(get_db), company_name: str = "BELVERA", tagline: str = ""):
    # SMART FIND: by id OR batch_number like BV-600588
    batch = db.query(Batch).filter_by(id=batch_id).first()
    if not batch:
        batch = db.query(Batch).filter_by(batch_number=batch_id).first()
    if not batch:
        raise HTTPException(404, "Batch not found")
    
    product = db.query(Product).filter_by(id=batch.product_id).first() if batch.product_id else None
    version = db.query(ProductVersion).filter_by(id=batch.product_version_id).first() if batch.product_version_id else None
    
    recipe = []
    if batch.product_version_id:
        recipe = db.query(RecipeIngredient).filter_by(product_version_id=batch.product_version_id).all()
    
    ingredients_list = []
    total_cost = 0
    for ri in recipe:
        ing = db.query(Ingredient).filter_by(id=ri.ingredient_id).first()
        if ing:
            # FIX: your model uses quantity_grams or quantity
            qty = getattr(ri, 'quantity_grams', 0) or getattr(ri, 'quantity', 0) or 0
            unit = getattr(ri, 'unit', 'g') or 'g'
            ingredients_list.append(f"{ing.name}")
            total_cost += (getattr(ing, 'cost_per_unit', 0) or 0) * (qty/1000.0)
    
    prod_date = getattr(batch, 'created_at', None) or datetime.now()
    expiry_date = prod_date + timedelta(days=7)
    
    # FIX: YOUR BUG - 0 tubs because you read batch_size/quantity but model is quantity_tubs
    qty_tubs = getattr(batch, 'quantity_tubs', 0) or getattr(batch, 'batch_size', 0) or getattr(batch, 'quantity', 0) or 0
    tub_grams = getattr(batch, 'tub_size_grams', 500) or 500

    # AI INSIGHTS
    cost_per_tub = getattr(batch, 'cost_per_tub', 0) or (total_cost + 0.8 + 15/qty_tubs if qty_tubs else 0)
    margin = getattr(batch, 'margin_percent', 0) or 0
    if margin > 60:
        ai_flag = "🔥 AI: High Margin - Scale"
    elif margin < 30:
        ai_flag = "⚠️ AI: Low Margin - Raise price"
    else:
        ai_flag = "✅ AI: Good Margin"

    return {
        "company_name": company_name,  # CUSTOMIZABLE: just BELVERA by default, no more PREMIUM ACAI hardcoded
        "tagline": tagline,  # CUSTOMIZABLE: empty = hidden. Add ?tagline=PREMIUM ACAI & SMOOTHIE BOWLS if you want
        "batch_number": getattr(batch, 'batch_number', None) or str(batch.id)[:8].upper(),
        "product_name": getattr(product, 'name', 'Unknown Product') if product else "Unknown Product",
        "product_code": getattr(product, 'product_code', '') if product else "",
        "version": getattr(version, 'version_number', '1.0') if version else "1.0",
        # FIXED: now shows 20, 10, whatever you chose - adjusts automatically
        "batch_size": qty_tubs,
        "quantity_tubs": qty_tubs,
        "tub_size_grams": tub_grams,
        "total_display": f"{int(qty_tubs)} tubs x {int(tub_grams)}g = {int(qty_tubs*tub_grams)}g total",
        "production_date": prod_date,
        "expiry_date": expiry_date,
        "ingredients": ", ".join(ingredients_list) if ingredients_list else "See recipe in R&D Lab",
        "storage": "Keep frozen at -18°C. Thaw before use.",
        "cost_per_unit": round(total_cost,2),
        "cost_per_tub": round(cost_per_tub,2),
        "margin_percent": margin,
        "ai_flag": ai_flag,
        "ai_insight": f"AI: {qty_tubs} tubs @ ${cost_per_tub:.2f}/tub - {ai_flag}",
        "qr_data": f"BELVERA|{getattr(batch, 'batch_number', '')}|{getattr(product, 'name', '') if product else ''}|{int(qty_tubs)} tubs|{expiry_date.strftime('%Y-%m-%d')}"
    }

@router.get("/packaging/cost-analysis")
def packaging_cost_analysis(db: Session = Depends(get_db)):
    try:
        items = db.query(PackagingItem).all()
        result = []
        for p in items:
            cost = getattr(p, 'cost_per_unit', 0) or 0
            stock = getattr(p, 'stock_quantity', 0) or getattr(p, 'quantity', 0) or 0
            name = getattr(p, 'name', None) or getattr(p, 'type', 'Packaging') or 'Packaging'
            result.append({
                "id": getattr(p, 'id', ''),
                "name": name,
                "type": getattr(p, 'type', ''),
                "cost_per_unit": cost,
                "stock": stock,
                "total_value": cost * stock,
                "ai_tip": f"AI: {'Low stock - reorder' if stock<100 else 'Stock OK'}"
            })
        return result
    except Exception as e:
        return []