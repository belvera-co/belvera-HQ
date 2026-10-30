from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from....core.database import get_db
from....models.finance import Expense
from....models.orders import Order
from....models.production import Batch
from datetime import datetime

router = APIRouter()

@router.get("/expenses")
def list_expenses(db: Session = Depends(get_db)):
    return db.query(Expense).order_by(Expense.date.desc()).all()

@router.post("/expenses")
def create_expense(data: dict, db: Session = Depends(get_db)):
    e = Expense(**data)
    db.add(e); db.commit(); db.refresh(e)
    return e

@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str, db: Session = Depends(get_db)):
    e = db.query(Expense).filter_by(id=expense_id).first()
    if not e: raise HTTPException(404, "Not found")
    db.delete(e); db.commit()
    return {"deleted": True}

@router.get("/pnl/summary")
def pnl_summary(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    revenue = sum([o.total or 0 for o in orders])
    batches = db.query(Batch).all()
    cogs = sum([o.total_cost or 0 for o in batches]) # total production cost
    expenses = db.query(Expense).all()
    total_expenses = sum([e.amount or 0 for e in expenses])
    gross_profit = revenue - cogs
    net_profit = gross_profit - total_expenses
    # by expense category
    by_category = {}
    for e in expenses:
        by_category[e.category] = by_category.get(e.category,0) + (e.amount or 0)
    return {
        "revenue": round(revenue,2),
        "cogs": round(cogs,2),
        "gross_profit": round(gross_profit,2),
        "total_expenses": round(total_expenses,2),
        "net_profit": round(net_profit,2),
        "margin_percent": round((net_profit/revenue*100) if revenue else 0,1),
        "by_category": by_category,
        "orders_count": len(orders),
        "batches_count": len(batches)
    }