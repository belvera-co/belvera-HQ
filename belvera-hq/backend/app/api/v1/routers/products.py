from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ....core.database import get_db
from ....models.product import Product, ProductVersion, RecipeIngredient
from ....models.supplier import Ingredient
from ....models.production import Batch, BatchIngredientUsage

router = APIRouter()

@router.get("/")
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.created_at.desc()).all()

@router.post("/")
def create_product(data: dict, db: Session = Depends(get_db)):
    p = Product(**data)
    db.add(p); db.commit(); db.refresh(p)
    try:
        v = ProductVersion(product_id=p.id, version_number="1.0", testing_notes="Initial version")
        db.add(v); db.commit()
        if hasattr(p, 'current_version'):
            p.current_version = "1.0"
            db.commit(); db.refresh(p)
    except Exception as e:
        print(f"Version skipped: {e}")
    return p

@router.get("/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    p = db.query(Product).filter_by(id=product_id).first()
    if not p: raise HTTPException(404, "Not found")
    return p

@router.put("/{product_id}")
def update_product(product_id: str, data: dict, db: Session = Depends(get_db)):
    p = db.query(Product).filter_by(id=product_id).first()
    if not p: raise HTTPException(404, "Not found")
    for k,v in data.items():
        if hasattr(p,k): setattr(p,k,v)
    db.commit(); db.refresh(p)
    return p

@router.delete("/{product_id}")
def delete_product(product_id: str, db: Session = Depends(get_db)):
    p = db.query(Product).filter_by(id=product_id).first()
    if not p: raise HTTPException(404, "Not found")
    
    # FIX FK ERROR: delete in correct order
    # 1. Get all versions for this product
    versions = db.query(ProductVersion).filter_by(product_id=product_id).all()
    version_ids = [v.id for v in versions]
    
    # 2. Delete BatchIngredientUsage + Batches that point to those versions OR this product_id
    if version_ids:
        batches = db.query(Batch).filter(Batch.product_version_id.in_(version_ids)).all()
        # also catch batches that only have product_id
        extra_batches = db.query(Batch).filter_by(product_id=product_id).all()
        all_batch_ids = list(set([b.id for b in batches + extra_batches]))
        if all_batch_ids:
            db.query(BatchIngredientUsage).filter(BatchIngredientUsage.batch_id.in_(all_batch_ids)).delete(synchronize_session=False)
            db.query(Batch).filter(Batch.id.in_(all_batch_ids)).delete(synchronize_session=False)
    else:
        # no versions, but still check batches by product_id
        bbs = db.query(Batch).filter_by(product_id=product_id).all()
        b_ids = [b.id for b in bbs]
        if b_ids:
            db.query(BatchIngredientUsage).filter(BatchIngredientUsage.batch_id.in_(b_ids)).delete(synchronize_session=False)
            db.query(Batch).filter(Batch.id.in_(b_ids)).delete(synchronize_session=False)

    # 3. Delete RecipeIngredients
    for v in versions:
        db.query(RecipeIngredient).filter_by(product_version_id=v.id).delete(synchronize_session=False)
    
    # 4. Delete Versions
    for v in versions:
        db.delete(v)
    
    # 5. Delete Product
    db.delete(p)
    db.commit()
    return {"deleted": True, "product_id": product_id}

@router.get("/{product_id}/versions")
def list_versions(product_id: str, db: Session = Depends(get_db)):
    return db.query(ProductVersion).filter_by(product_id=product_id).order_by(ProductVersion.created_at.desc()).all()

@router.post("/{product_id}/versions")
def create_version(product_id: str, data: dict, db: Session = Depends(get_db)):
    clean = {k:v for k,v in data.items() if k not in ['is_current']}
    v = ProductVersion(product_id=product_id, **clean)
    db.add(v); db.commit(); db.refresh(v)
    p = db.query(Product).filter_by(id=product_id).first()
    if p and hasattr(p, 'current_version'):
        p.current_version = data.get("version_number", v.version_number)
        db.commit()
    return v

@router.put("/versions/{version_id}")
def update_version(version_id: str, data: dict, db: Session = Depends(get_db)):
    v = db.query(ProductVersion).filter_by(id=version_id).first()
    if not v: raise HTTPException(404, "Not found")
    for k,val in data.items():
        if hasattr(v,k): setattr(v,k,val)
    db.commit(); db.refresh(v)
    return v

@router.delete("/versions/{version_id}")
def delete_version(version_id: str, db: Session = Depends(get_db)):
    v = db.query(ProductVersion).filter_by(id=version_id).first()
    if not v: raise HTTPException(404, "Not found")
    # FIX: delete batches that use this version first
    bbs = db.query(Batch).filter_by(product_version_id=version_id).all()
    b_ids = [b.id for b in bbs]
    if b_ids:
        db.query(BatchIngredientUsage).filter(BatchIngredientUsage.batch_id.in_(b_ids)).delete(synchronize_session=False)
        db.query(Batch).filter(Batch.id.in_(b_ids)).delete(synchronize_session=False)
    db.query(RecipeIngredient).filter_by(product_version_id=version_id).delete(synchronize_session=False)
    db.delete(v); db.commit()
    return {"deleted": True}

@router.get("/versions/{version_id}/recipe")
def get_recipe(version_id: str, db: Session = Depends(get_db)):
    items = db.query(RecipeIngredient).filter_by(product_version_id=version_id).all()
    result = []
    for ri in items:
        ing = db.query(Ingredient).filter_by(id=ri.ingredient_id).first()
        result.append({"id": ri.id, "ingredient_id": ri.ingredient_id, "ingredient_name": ing.name if ing else "Unknown", "quantity": getattr(ri, 'quantity', 0) or getattr(ri, 'quantity_grams', 0), "unit": getattr(ri, 'unit', 'g'), "cost": ing.cost_per_unit if ing else 0})
    return result

@router.post("/versions/{version_id}/recipe")
def add_recipe_item(version_id: str, data: dict, db: Session = Depends(get_db)):
    ri = RecipeIngredient(product_version_id=version_id, **data)
    db.add(ri); db.commit(); db.refresh(ri)
    return ri

@router.delete("/recipe/{recipe_item_id}")
def delete_recipe_item(recipe_item_id: str, db: Session = Depends(get_db)):
    ri = db.query(RecipeIngredient).filter_by(id=recipe_item_id).first()
    if not ri: raise HTTPException(404, "Not found")
    db.delete(ri); db.commit()
    return {"deleted": True}