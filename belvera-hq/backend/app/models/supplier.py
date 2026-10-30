from sqlalchemy import Column, String, Float, Integer, Text, DateTime, Boolean
from sqlalchemy.sql import func
from ..core.database import Base
import uuid

def gen_id():
    return str(uuid.uuid4())

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    category = Column(String)
    contact_name = Column(String)
    email = Column(String)
    phone = Column(String)
    website = Column(String)
    moq = Column(String)
    shipping_days = Column(Integer, default=7)
    rating = Column(Integer, default=5)
    notes = Column(Text)
    is_approved = Column(String, default="true")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    category = Column(String)
    supplier_id = Column(String)
    unit = Column(String, default="kg")
    cost_per_unit = Column(Float, default=0)
    stock_quantity = Column(Float, default=0)
    reorder_point = Column(Float, default=10)
    sku = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # OPEN LOOP - ADDED FOR CHARGE CART LINK
    sell_price = Column(Float, default=0)  # price to charge customer
    is_sellable = Column(Boolean, default=False)  # if True -> shows in charge cart
    is_chargeable = Column(Boolean, default=False) # alias
    location = Column(String, default="Freezer A")
    barcode = Column(String, nullable=True)

class PackagingItem(Base):
    __tablename__ = "packaging_items"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    type = Column(String, nullable=True)
    category = Column(String)  # FROM FILE #2 - KEPT
    supplier_id = Column(String)
    cost_per_unit = Column(Float, default=0)
    stock_quantity = Column(Float, default=0)
    reorder_point = Column(Float, default=100)
    unit = Column(String, default="pcs")
    sku = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # FROM FILE #1 - KEPT
    # OPEN LOOP
    sell_price = Column(Float, default=0)
    is_sellable = Column(Boolean, default=False)

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id = Column(String, primary_key=True, default=gen_id)
    ingredient_id = Column(String)
    location_id = Column(String, default="hq_lab")
    quantity_on_hand = Column(Float, default=0)
    lot_number = Column(String)
    expiration_date = Column(DateTime(timezone=True), nullable=True)
    last_counted_at = Column(DateTime(timezone=True), server_default=func.now())
    # OPEN LOOP
    is_sellable = Column(Boolean, default=False)
    sell_price = Column(Float, default=0)

class SOP(Base):
    __tablename__ = "sops"
    id = Column(String, primary_key=True, default=gen_id)
    title = Column(String, nullable=False)
    category = Column(String)
    version = Column(String, default="1.0")
    content_markdown = Column(Text)
    content = Column(Text)  # ADDED - so your sops router with 'content' works
    is_required = Column(String, default="true")
    last_reviewed_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # OPEN LOOP + YOUR ALTER TABLE FIELDS
    station = Column(String, default="blender")
    tools = Column(String, default="")
    location = Column(String, default="")
    supplier = Column(String, default="")
    source = Column(String, default="")

class ProductCost(Base):
    __tablename__ = "product_costs"
    id = Column(String, primary_key=True, default=gen_id)
    product_version_id = Column(String)
    ingredient_cost = Column(Float, default=0)
    packaging_cost = Column(Float, default=0)
    labor_cost = Column(Float, default=0.5)
    total_cost = Column(Float, default=0)
    cost_per_serving = Column(Float, default=0)
    suggested_retail = Column(Float, default=0)
    wholesale_price = Column(Float, default=0)
    profit_margin_percent = Column(Float, default=0)