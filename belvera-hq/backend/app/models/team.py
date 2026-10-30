from sqlalchemy import Column, String, Float, DateTime, Boolean, Text
from sqlalchemy.sql import func
from..core.database import Base
import uuid
def gen_id(): return str(uuid.uuid4())

class Staff(Base):
    __tablename__ = "staff"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    role = Column(String, default="staff") # founder, manager, staff, trainee
    email = Column(String)
    phone = Column(String)
    wage_per_hour = Column(Float, default=15)
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FranchiseChecklist(Base):
    __tablename__ = "franchise_checklist"
    id = Column(String, primary_key=True, default=gen_id)
    category = Column(String, default="legal") # legal, operations, branding, training, finance
    task = Column(String, nullable=False)
    description = Column(Text)
    is_completed = Column(Boolean, default=False)
    priority = Column(String, default="medium")
    created_at = Column(DateTime(timezone=True), server_default=func.now())