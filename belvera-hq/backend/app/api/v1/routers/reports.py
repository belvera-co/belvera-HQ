from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from....core.database import get_db
from....models.orders import Order
from....models.finance import Expense
from....models.production import Batch
from....models.supplier import Ingredient
import csv, io

router = APIRouter()

@router.get("/reports/sales-csv")
def export_sales_csv(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["order_number","customer","total","channel","status","date"])
    for o in orders:
        writer.writerow([o.order_number, o.customer_name, o.total, o.channel, o.status, o.created_at])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=sales_report.csv"})

@router.get("/reports/expenses-csv")
def export_expenses_csv(db: Session = Depends(get_db)):
    expenses = db.query(Expense).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["date","category","amount","description"])
    for e in expenses:
        writer.writerow([e.date, e.category, e.amount, e.description])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=expenses_report.csv"})

@router.get("/reports/inventory-csv")
def export_inventory_csv(db: Session = Depends(get_db)):
    items = db.query(Ingredient).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["name","sku","stock_quantity","cost_per_unit","total_value","reorder_point"])
    for i in items:
        writer.writerow([i.name, i.sku, i.stock_quantity, i.cost_per_unit, (i.stock_quantity or 0)*(i.cost_per_unit or 0), i.reorder_point])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=inventory_report.csv"})

@router.get("/reports/monthly-pnl")
def monthly_pnl(db: Session = Depends(get_db)):
    from sqlalchemy import extract
    orders = db.query(Order).all()
    expenses = db.query(Expense).all()
    # group by month 1-12
    months = {}
    for o in orders:
        if not o.created_at: continue
        m = o.created_at.month
        months.setdefault(m, {"revenue":0,"expenses":0})
        months[m]["revenue"] += o.total or 0
    for e in expenses:
        if not e.date: continue
        try:
            m = int(str(e.date).split("-")[1]) if "-" in str(e.date) else 1
        except: m=1
        months.setdefault(m, {"revenue":0,"expenses":0})
        months[m]["expenses"] += e.amount or 0
    result = []
    for month in range(1,13):
        data = months.get(month, {"revenue":0,"expenses":0})
        result.append({"month":month, "revenue":data["revenue"], "expenses":data["expenses"], "profit": data["revenue"]-data["expenses"]})
    return result