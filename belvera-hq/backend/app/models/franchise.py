from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.sql import func
from..core.database import Base
import uuid
def gen_id(): return str(uuid.uuid4())

class FranchiseFinancial(Base):
    __tablename__ = "franchise_financials"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, default="Standard Model")
    franchise_fee = Column(Float, default=25000)
    royalty_percent = Column(Float, default=6.0)
    marketing_percent = Column(Float, default=2.0)
    initial_equipment = Column(Float, default=45000)
    initial_inventory = Column(Float, default=5000)
    monthly_rent = Column(Float, default=3000)
    monthly_staff_cost = Column(Float, default=8000)
    avg_order_value = Column(Float, default=14.5)
    orders_per_day = Column(Float, default=80)
    cogs_percent = Column(Float, default=28.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())