from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from..core.database import Base
import uuid
def gen_id(): return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_id)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    password = Column(String, default="admin123")
    role = Column(String, default="manager")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())