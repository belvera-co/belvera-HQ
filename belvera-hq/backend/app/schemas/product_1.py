from pydantic import BaseModel
from typing import Optional, List

class RecipeIngredientCreate(BaseModel):
    ingredient_id: str
    quantity_grams: float

class ProductVersionCreate(BaseModel):
    version_number: str
    taste_score: float = 0
    texture_score: float = 0
    appearance_score: float = 0
    testing_notes: Optional[str] = None
    customer_feedback: Optional[str] = None
    recipe_instructions: Optional[str] = None
    ingredients: List[RecipeIngredientCreate] = []

class ProductCreate(BaseModel):
    product_code: str
    name: str
    collection: str
    description: Optional[str] = None
    status: str = "idea"
    current_version: str = "1.0"

class ProductOut(BaseModel):
    id: str
    product_code: str
    name: str
    collection: str
    status: str
    current_version: str
    class Config:
        from_attributes = True
