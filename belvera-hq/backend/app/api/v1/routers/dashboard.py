from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from....core.database import get_db
from....models.product import Product
from....models.supplier import Ingredient
from....models.production import Batch
from....models.orders import Order
from....models.finance import Expense
from....models.team import Staff, FranchiseChecklist

router = APIRouter()

@router.get("/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    products = db.query(Product).count()
    batches = db.query(Batch).count()
    orders = db.query(Order).all()
    ingredients = db.query(Ingredient).all()
    expenses = db.query(Expense).all()
    staff = db.query(Staff).count()
    checklist = db.query(FranchiseChecklist).all()
    
    revenue = sum([o.total or 0 for o in orders])
    cogs = sum([b.total_cost or 0 for b in db.query(Batch).all()])
    total_expenses = sum([e.amount or 0 for e in expenses])
    net_profit = revenue - cogs - total_expenses
    
    low_stock = [i for i in ingredients if (i.stock_quantity or 0) <= (i.reorder_point or 5)]
    
    completed_tasks = len([c for c in checklist if c.is_completed])
    franchise_percent = int(completed_tasks / len(checklist) * 100) if checklist else 0
    
    return {
        "products_count": products,
        "batches_count": batches,
        "orders_count": len(orders),
        "staff_count": staff,
        "revenue": round(revenue,2),
        "cogs": round(cogs,2),
        "expenses": round(total_expenses,2),
        "net_profit": round(net_profit,2),
        "low_stock": [{"id": i.id, "name": i.name, "stock": i.stock_quantity, "reorder": i.reorder_point} for i in low_stock],
        "low_stock_count": len(low_stock),
        "franchise_percent": franchise_percent,
        "franchise_completed": completed_tasks,
        "franchise_total": len(checklist)
    }