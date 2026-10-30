from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.sql import func
from..core.database import Base
import uuid
def gen_id():
    return str(uuid.uuid4())

class Customer(Base):
    __tablename__ = "customers"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    type = Column(String, default="retail")
    total_orders = Column(Integer, default=0)
    total_spent = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, default=gen_id)
    order_number = Column(String, unique=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=True)
    status = Column(String, default="paid")
    channel = Column(String, default="pos")
    subtotal = Column(Float, default=0)
    tax = Column(Float, default=0)
    total = Column(Float, default=0)
    payment_method = Column(String, default="cash")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(String, primary_key=True, default=gen_id)
    order_id = Column(String, ForeignKey("orders.id"))
    product_id = Column(String, ForeignKey("products.id"))
    product_name = Column(String)
    quantity = Column(Float, default=1)
    unit_price = Column(Float, default=0)
    total_price = Column(Float, default=0)