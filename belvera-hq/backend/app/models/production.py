
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..core.database import Base
import uuid
def gen_id():
    return str(uuid.uuid4())

class Batch(Base):
    __tablename__ = "batches"
    id = Column(String, primary_key=True, default=gen_id)
    batch_number = Column(String, unique=True)
    product_id = Column(String, ForeignKey("products.id"))
    product_version_id = Column(String, ForeignKey("product_versions.id"))
    status = Column(String, default="planned")
    quantity_tubs = Column(Float, default=0)
    tub_size_grams = Column(Float, default=500)
    total_grams = Column(Float, default=0)
    ingredient_cost_total = Column(Float, default=0)
    packaging_cost_total = Column(Float, default=0)
    labor_cost = Column(Float, default=0)
    total_cost = Column(Float, default=0)
    cost_per_tub = Column(Float, default=0)
    suggested_retail_per_tub = Column(Float, default=0)
    profit_per_tub = Column(Float, default=0)
    margin_percent = Column(Float, default=0)
    notes = Column(Text)
    produced_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

class BatchIngredientUsage(Base):
    __tablename__ = "batch_ingredient_usage"
    id = Column(String, primary_key=True, default=gen_id)
    batch_id = Column(String, ForeignKey("batches.id"))
    ingredient_id = Column(String, ForeignKey("ingredients.id"))
    planned_grams = Column(Float, default=0)
    actual_grams = Column(Float, default=0)
    cost_per_kg = Column(Float, default=0)
    cost_total = Column(Float, default=0)
