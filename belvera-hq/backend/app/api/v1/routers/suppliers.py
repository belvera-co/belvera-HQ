from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ....core.database import get_db
from ....models.supplier import Supplier, Ingredient, PackagingItem, InventoryItem, SOP, ProductCost
from ....models.product import RecipeIngredient
from ....models.production import BatchIngredientUsage

router = APIRouter()

def clean_data(model_class, data: dict):
    """Only keep fields that actually exist on the model - makes it SaaS-ready and crash-proof"""
    allowed = {c.name for c in model_class.__table__.columns}
    return {k: v for k, v in data.items() if k in allowed}

# --- SUPPLIERS ---
@router.get("/suppliers")
def list_suppliers(db: Session = Depends(get_db)):
    return db.query(Supplier).all()

@router.post("/suppliers")
def create_supplier(data: dict, db: Session = Depends(get_db)):
    s = Supplier(**clean_data(Supplier, data))
    db.add(s); db.commit(); db.refresh(s)
    return s

@router.put("/suppliers/{supplier_id}")
def update_supplier(supplier_id: str, data: dict, db: Session = Depends(get_db)):
    s = db.query(Supplier).filter_by(id=supplier_id).first()
    if not s: raise HTTPException(404, "Not found")
    for k,v in clean_data(Supplier, data).items():
        setattr(s,k,v)
    db.commit(); db.refresh(s)
    return s

@router.delete("/suppliers/{supplier_id}")
def delete_supplier(supplier_id: str, db: Session = Depends(get_db)):
    s = db.query(Supplier).filter_by(id=supplier_id).first()
    if not s: raise HTTPException(404, "Not found")
    db.delete(s); db.commit()
    return {"deleted": True}

# --- INGREDIENTS - OPEN LOOP ---
@router.get("/ingredients")
def list_ingredients(db: Session = Depends(get_db)):
    return db.query(Ingredient).order_by(Ingredient.name).all()

@router.get("/ingredients/sellable")
def list_sellable_ingredients(db: Session = Depends(get_db)):
    """FOR CHARGE CART - returns anything marked as sellable"""
    return db.query(Ingredient).filter(Ingredient.is_sellable == True).all()

@router.post("/ingredients")
def create_ingredient(data: dict, db: Session = Depends(get_db)):
    ing = Ingredient(**clean_data(Ingredient, data))
    db.add(ing); db.commit(); db.refresh(ing)
    return ing

@router.put("/ingredients/{ingredient_id}")
def update_ingredient(ingredient_id: str, data: dict, db: Session = Depends(get_db)):
    ing = db.query(Ingredient).filter_by(id=ingredient_id).first()
    if not ing: raise HTTPException(404, "Not found")
    for k,v in clean_data(Ingredient, data).items():
        setattr(ing, k, v)
    db.commit(); db.refresh(ing)
    return ing

@router.delete("/ingredients/{ingredient_id}")
def delete_ingredient(ingredient_id: str, db: Session = Depends(get_db)):
    ing = db.query(Ingredient).filter_by(id=ingredient_id).first()
    if not ing: raise HTTPException(404, "Not found")
    db.query(RecipeIngredient).filter_by(ingredient_id=ingredient_id).delete()
    db.query(BatchIngredientUsage).filter_by(ingredient_id=ingredient_id).delete()
    db.delete(ing); db.commit()
    return {"deleted": True}

@router.post("/ingredients/{ingredient_id}/adjust")
def adjust_ingredient(ingredient_id: str, data: dict, db: Session = Depends(get_db)):
    ing = db.query(Ingredient).filter_by(id=ingredient_id).first()
    if not ing: raise HTTPException(404, "Not found")
    qty = float(data.get('quantity', 0))
    ing.stock_quantity = (ing.stock_quantity or 0) + qty
    db.commit(); db.refresh(ing)
    return ing

@router.post("/ingredients/{ingredient_id}/toggle-sellable")
def toggle_sellable(ingredient_id: str, data: dict, db: Session = Depends(get_db)):
    """Make inventory item available in charge cart WHENEVER you want"""
    ing = db.query(Ingredient).filter_by(id=ingredient_id).first()
    if not ing: raise HTTPException(404, "Not found")
    ing.is_sellable = data.get('is_sellable', not ing.is_sellable)
    if 'sell_price' in data:
        ing.sell_price = float(data['sell_price'])
    db.commit(); db.refresh(ing)
    return ing

@router.post("/ingredients/{ingredient_id}/charge")
def charge_ingredient(ingredient_id: str, data: dict, db: Session = Depends(get_db)):
    """Add inventory item ON TOP of order + auto deduct - OPEN LOOP"""
    ing = db.query(Ingredient).filter_by(id=ingredient_id).first()
    if not ing: raise HTTPException(404, "Not found")
    qty = float(data.get('quantity', 1))
    # Deduct stock - fully modifiable, you can put it back anytime
    ing.stock_quantity = (ing.stock_quantity or 0) - qty
    db.commit(); db.refresh(ing)
    return {
        "charged": True,
        "name": ing.name,
        "quantity": qty,
        "price": ing.sell_price or ing.cost_per_unit,
        "remaining_stock": ing.stock_quantity,
        "is_sellable": ing.is_sellable
    }

# --- INVENTORY ---
@router.get("/inventory")
def list_inventory(db: Session = Depends(get_db)):
    return db.query(InventoryItem).all()

@router.post("/inventory")
def create_inventory(data: dict, db: Session = Depends(get_db)):
    item = InventoryItem(**clean_data(InventoryItem, data))
    db.add(item); db.commit(); db.refresh(item)
    return item

@router.put("/inventory/{item_id}")
def update_inventory_item(item_id: str, data: dict, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter_by(id=item_id).first()
    if not item: raise HTTPException(404, "Not found")
    for k,v in clean_data(InventoryItem, data).items():
        setattr(item, k, v)
    db.commit(); db.refresh(item)
    return item

@router.delete("/inventory/{item_id}")
def delete_inventory_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter_by(id=item_id).first()
    if not item: raise HTTPException(404, "Not found")
    db.delete(item); db.commit()
    return {"deleted": True}

@router.post("/inventory/{item_id}/adjust")
def adjust_inventory(item_id: str, data: dict, db: Session = Depends(get_db)):
    # try ingredient first
    ing = db.query(Ingredient).filter_by(id=item_id).first()
    if ing:
        qty = float(data.get('quantity', 0))
        ing.stock_quantity = (ing.stock_quantity or 0) + qty
        db.commit(); db.refresh(ing)
        return ing
    item = db.query(InventoryItem).filter_by(id=item_id).first()
    if not item: raise HTTPException(404, "Not found")
    qty = float(data.get('quantity', 0))
    # FIX: was item.quantity (crash) -> now quantity_on_hand
    item.quantity_on_hand = (item.quantity_on_hand or 0) + qty
    db.commit(); db.refresh(item)
    return item

# --- PACKAGING ---
@router.get("/packaging")
def list_packaging(db: Session = Depends(get_db)):
    return db.query(PackagingItem).all()

@router.post("/packaging")
def create_packaging(data: dict, db: Session = Depends(get_db)):
    p = PackagingItem(**clean_data(PackagingItem, data))
    db.add(p); db.commit(); db.refresh(p)
    return p

@router.put("/packaging/{item_id}")
def update_packaging(item_id: str, data: dict, db: Session = Depends(get_db)):
    p = db.query(PackagingItem).filter_by(id=item_id).first()
    if not p: raise HTTPException(404, "Not found")
    for k,v in clean_data(PackagingItem, data).items():
        setattr(p,k,v)
    db.commit(); db.refresh(p)
    return p

@router.delete("/packaging/{item_id}")
def delete_packaging(item_id: str, db: Session = Depends(get_db)):
    p = db.query(PackagingItem).filter_by(id=item_id).first()
    if not p: raise HTTPException(404, "Not found")
    db.delete(p); db.commit()
    return {"deleted": True}

@router.get("/costs")
def list_costs(db: Session = Depends(get_db)):
    return db.query(ProductCost).all()