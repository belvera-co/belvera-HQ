from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from ..core.database import Base
import uuid
def gen_id(): return str(uuid.uuid4())

class Note(Base):
    __tablename__ = "notes"
    id = Column(String, primary_key=True, default=gen_id)
    title = Column(String, nullable=False)
    content = Column(Text, default="")
    category = Column(String, default="general")  # recipe, supplier, idea, todo, etc
    color = Column(String, default="yellow")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())