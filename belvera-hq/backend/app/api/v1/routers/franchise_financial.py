from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from....core.database import get_db
from....models.franchise import FranchiseFinancial

router = APIRouter()

@router.get("/franchise/financial")
def list_financials(db: Session = Depends(get_db)):
    items = db.query(FranchiseFinancial).all()
    if not items:
        default = FranchiseFinancial()
        db.add(default); db.commit(); db.refresh(default)
        items = [default]
    return items

@router.post("/franchise/financial")
def create_financial(data: dict, db: Session = Depends(get_db)):
    f = FranchiseFinancial(**data)
    db.add(f); db.commit(); db.refresh(f)
    return f

@router.put("/franchise/financial/{fid}")
def update_financial(fid: str, data: dict, db: Session = Depends(get_db)):
    f = db.query(FranchiseFinancial).filter_by(id=fid).first()
    if not f: return {"error":"not found"}
    for k,v in data.items():
        if hasattr(f,k): setattr(f,k,v)
    db.commit(); db.refresh(f)
    return f

@router.get("/franchise/financial/{fid}/projection")
def get_projection(fid: str, db: Session = Depends(get_db)):
    f = db.query(FranchiseFinancial).filter_by(id=fid).first()
    if not f: return {"error":"not found"}
    # calculation
    monthly_orders = (f.orders_per_day or 80) * 30
    monthly_revenue = monthly_orders * (f.avg_order_value or 14.5)
    monthly_cogs = monthly_revenue * (f.cogs_percent or 28)/100
    royalty = monthly_revenue * (f.royalty_percent or 6)/100
    marketing = monthly_revenue * (f.marketing_percent or 2)/100
    total_monthly_costs = monthly_cogs + royalty + marketing + (f.monthly_rent or 3000) + (f.monthly_staff_cost or 8000)
    monthly_profit = monthly_revenue - total_monthly_costs
    yearly_profit = monthly_profit * 12
    initial_investment = (f.franchise_fee or 25000) + (f.initial_equipment or 45000) + (f.initial_inventory or 5000)
    roi_months = initial_investment / monthly_profit if monthly_profit>0 else 0

    return {
        "monthly_revenue": round(monthly_revenue,2),
        "monthly_cogs": round(monthly_cogs,2),
        "royalty": round(royalty,2),
        "marketing_fee": round(marketing,2),
        "rent": f.monthly_rent,
        "staff": f.monthly_staff_cost,
        "total_costs": round(total_monthly_costs,2),
        "monthly_profit": round(monthly_profit,2),
        "yearly_profit": round(yearly_profit,2),
        "initial_investment": round(initial_investment,2),
        "roi_months": round(roi_months,1),
        "profit_margin": round(monthly_profit/monthly_revenue*100,1) if monthly_revenue>0 else 0
    }