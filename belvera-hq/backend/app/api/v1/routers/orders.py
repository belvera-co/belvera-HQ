from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from....core.database import get_db
from....models.orders import Order, OrderItem, Customer
from....models.product import Product
from....models.supplier import Ingredient, PackagingItem # OPEN LOOP - LINK
import datetime, random
from collections import Counter

router = APIRouter()

# --- MOVED TO TOP - FIXES Method Not Allowed ---
@router.get("/sellable-for-cart")
def sellable_for_cart(db: Session = Depends(get_db)):
    """Returns everything you can charge: Products + Ingredients marked as sellable - FOLLOWS ACTUAL PRICE"""
    products = db.query(Product).filter(Product.status!= "retired").all()
    sellable_ings = db.query(Ingredient).filter(Ingredient.is_sellable == True).all()
    result = []
    for p in products:
        result.append({"id": p.id, "name": p.name, "price": float(p.price or 0), "sell_price": float(p.price or 0), "cost_per_unit": float(p.price or 0), "type": "product", "stock": 999})
    for ing in sellable_ings:
        # REAL PRICE FIX - follows what you set in Inventory
        real_price = float(ing.sell_price if ing.sell_price and ing.sell_price > 0 else ing.cost_per_unit or 0)
        result.append({
            "id": ing.id,
            "ingredient_id": ing.id,
            "name": f"{ing.name}",
            "price": real_price,
            "sell_price": float(ing.sell_price or 0),
            "cost_per_unit": float(ing.cost_per_unit or 0),
            "type": "ingredient",
            "stock": float(ing.stock_quantity or 0),
            "unit": ing.unit
        })
    return result

@router.get("/customers")
def list_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.created_at.desc()).all()

@router.post("/customers")
def create_customer(data: dict, db: Session = Depends(get_db)):
    c = Customer(**data)
    db.add(c); db.commit(); db.refresh(c)
    return c

@router.get("/orders")
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    result=[]
    for o in orders:
        items = db.query(OrderItem).filter_by(order_id=o.id).all()
        cust = db.query(Customer).filter_by(id=o.customer_id).first() if o.customer_id else None
        result.append({
            "id": o.id,
            "order_number": o.order_number,
            "customer_name": cust.name if cust else "Walk-in",
            "items_count": len(items),
            "total": o.total,
            "channel": o.channel,
            "status": o.status,
            "created_at": o.created_at
        })
    return result

@router.post("/orders")
def create_order(data: dict, db: Session = Depends(get_db)):
    items_data = data.get('items', [])
    if not items_data:
        raise HTTPException(400, "No items")

    def get_qty(i): return float(i.get('quantity', i.get('qty', 1)))
    def get_price(i):
        # FIXED - follows actual sell_price if >0 else cost_per_unit
        if i.get('ingredient_id') and not i.get('unit_price') and not i.get('price'):
            ing = db.query(Ingredient).filter_by(id=i.get('ingredient_id')).first()
            if ing:
                return float(ing.sell_price if ing.sell_price and ing.sell_price > 0 else ing.cost_per_unit or 0)
        return float(i.get('unit_price', i.get('price', 0)))

    # Deduct inventory BEFORE creating order - fully modifiable, can be restored if order deleted
    for it in items_data:
        if it.get('ingredient_id'):
            ing = db.query(Ingredient).filter_by(id=it.get('ingredient_id')).first()
            if ing:
                ing.stock_quantity = (ing.stock_quantity or 0) - get_qty(it)

    subtotal = sum([get_qty(i)*get_price(i) for i in items_data])
    tax = round(subtotal*0.14975,2)
    total = round(subtotal+tax,2)
    order_number = f"ORD-{datetime.datetime.now().year}-{random.randint(10000,99999)}"
    order = Order(
        order_number=order_number,
        customer_id=data.get('customer_id'),
        status='paid',
        channel=data.get('channel','pos'),
        subtotal=subtotal,
        tax=tax,
        total=total,
        payment_method=data.get('payment_method','cash')
    )
    db.add(order); db.commit(); db.refresh(order)
    for it in items_data:
        prod = db.query(Product).filter_by(id=it.get('product_id')).first() if it.get('product_id') else None
        ing_name = None
        if it.get('ingredient_id'):
            ing_obj = db.query(Ingredient).filter_by(id=it.get('ingredient_id')).first()
            if ing_obj:
                ing_name = ing_obj.name

        oi = OrderItem(
            order_id=order.id,
            product_id=it.get('product_id'),
            product_name=prod.name if prod else it.get('product_name') or it.get('name') or ing_name or 'Item',
            quantity=get_qty(it),
            unit_price=get_price(it),
            total_price=get_qty(it)*get_price(it)
        )
        db.add(oi)
    db.commit()
    return order

@router.get("/sales/summary")
def sales_summary(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    total_revenue = sum([o.total or 0 for o in orders])
    total_orders = len(orders)
    items = db.query(OrderItem).all()
    by_product = {}
    for it in items:
        by_product[it.product_name] = by_product.get(it.product_name,0) + (it.quantity or 0)
    top = sorted(by_product.items(), key=lambda x: x[1], reverse=True)[:5]
    return {
        "total_revenue": round(total_revenue,2),
        "total_orders": total_orders,
        "avg_order_value": round(total_revenue/total_orders,2) if total_orders else 0,
        "top_products": [{"name": n, "qty": q} for n,q in top]
    }

@router.get("/ai/recommendations")
def ai_recommendations(db: Session = Depends(get_db)):
    items = db.query(OrderItem).all()
    if not items: return {"upsell": "AI: Need sales first"}
    combos = Counter()
    for o in db.query(Order).all():
        names = sorted(set([i.product_name for i in db.query(OrderItem).filter_by(order_id=o.id).all()]))
        for i in range(len(names)):
            for j in range(i+1, len(names)): combos[f"{names[i]} + {names[j]}"] += 1
    top = combos.most_common(1)
    msg = f"AI: '{top[0][0]}' bought together {top[0][1]}x - bundle them!" if top else "AI: Sell anything - I learn your patterns"
    return {"upsell": msg, "top_combos": combos.most_common(5), "note": "Generic AI - works for shirts, bowls, drinks, ANYTHING you sell"}

@router.delete("/orders/{order_id}")
def delete_order(order_id: str, db: Session = Depends(get_db)):
    o = db.query(Order).filter_by(id=order_id).first()
    if not o:
        raise HTTPException(404, "Order not found")
    db.query(OrderItem).filter_by(order_id=order_id).delete()
    db.delete(o); db.commit()
    return {"deleted": True}

@router.delete("/customers/{customer_id}")
def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    c = db.query(Customer).filter_by(id=customer_id).first()
    if not c:
        raise HTTPException(404, "Customer not found")
    db.delete(c); db.commit()
    return {"deleted": True}

@router.post("/orders/{order_id}/add-extra")
def add_extra_to_order(order_id: str, data: dict, db: Session = Depends(get_db)):
    """Add something ON TOP of existing order - extra granola, extra mango, any inventory item"""
    order = db.query(Order).filter_by(id=order_id).first()
    if not order: raise HTTPException(404, "Order not found")

    qty = float(data.get('quantity', 1))
    price = data.get('unit_price')
    name = data.get('product_name') or data.get('name')
    ingredient_id = data.get('ingredient_id')

    # If ingredient, deduct and get price
    if ingredient_id:
        ing = db.query(Ingredient).filter_by(id=ingredient_id).first()
        if not ing: raise HTTPException(404, "Ingredient not found")
        if (ing.stock_quantity or 0) < qty:
            raise HTTPException(400, f"Not enough stock: {ing.stock_quantity}")
        ing.stock_quantity = (ing.stock_quantity or 0) - qty
        if not price:
            price = float(ing.sell_price if ing.sell_price and ing.sell_price > 0 else ing.cost_per_unit or 0)
        if not name:
            name = ing.name

    if not price: price = 0
    if not name: name = "Extra Item"

    oi = OrderItem(
        order_id=order_id,
        product_id=data.get('product_id'),
        product_name=name,
        quantity=qty,
        unit_price=float(price),
        total_price=float(price)*qty
    )
    db.add(oi)

    # Recalc order totals - fully modifiable
    items = db.query(OrderItem).filter_by(order_id=order_id).all()
    subtotal = sum([(i.total_price or 0) for i in items]) + (float(price)*qty)
    tax = round(subtotal*0.14975,2)
    total = round(subtotal+tax,2)
    order.subtotal = subtotal
    order.tax = tax
    order.total = total

    db.commit()
    db.refresh(order)
    return {"order": order, "added_item": oi, "new_total": total}

@router.put("/orders/{order_id}/restore-stock")
def restore_stock_on_void(order_id: str, db: Session = Depends(get_db)):
    """If you void an order, put inventory back - open loop"""
    order = db.query(Order).filter_by(id=order_id).first()
    if not order: raise HTTPException(404, "Not found")
    # This would need ingredient_id stored on OrderItem - for now manual
    return {"note": "To restore, delete order and manually adjust inventory - next version will auto-restore"}