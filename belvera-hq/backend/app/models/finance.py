from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.sql import func
from..core.database import Base
import uuid
def gen_id(): return str(uuid.uuid4())

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(String, primary_key=True, default=gen_id)
    category = Column(String, default="other") # rent, labor, utilities, marketing, ingredients, other
    description = Column(String, nullable=False)
    amount = Column(Float, default=0)
    date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())