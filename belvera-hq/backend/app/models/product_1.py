from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import uuid
import enum

def gen_id():
    return str(uuid.uuid4())

class CollectionEnum(str, enum.Enum):
    classic = "classic"
    exotic = "exotic"
    functional = "functional"

class ProductStatus(str, enum.Enum):
    idea = "idea"
    testing = "testing"
    approved = "approved"
    production = "production"
    retired = "retired"

class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, default=gen_id)
    organization_id = Column(String, default="belvera_corp")
    location_id = Column(String, default="hq_lab")
    product_code = Column(String, unique=True)  # e.g. BV-STR-COL-001
    name = Column(String, nullable=False)
    collection = Column(String, nullable=False)  # classic/exotic/functional
    description = Column(Text)
    status = Column(String, default="idea")
    current_version = Column(String, default="1.0")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    versions = relationship("ProductVersion", back_populates="product", cascade="all, delete-orphan")

class ProductVersion(Base):
    __tablename__ = "product_versions"
    id = Column(String, primary_key=True, default=gen_id)
    product_id = Column(String, ForeignKey("products.id"))
    version_number = Column(String, nullable=False)  # 1.3
    status = Column(String, default="testing")
    taste_score = Column(Float, default=0)
    texture_score = Column(Float, default=0)
    appearance_score = Column(Float, default=0)
    testing_notes = Column(Text)
    customer_feedback = Column(Text)
    recipe_instructions = Column(Text)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    product = relationship("Product", back_populates="versions")
    ingredients = relationship("RecipeIngredient", back_populates="version", cascade="all, delete-orphan")

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    id = Column(String, primary_key=True, default=gen_id)
    product_version_id = Column(String, ForeignKey("product_versions.id"))
    ingredient_id = Column(String, ForeignKey("ingredients.id"))
    quantity_grams = Column(Float, nullable=False)
    cost_snapshot = Column(Float, default=0)

    version = relationship("ProductVersion", back_populates="ingredients")
