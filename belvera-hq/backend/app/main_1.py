from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import Base, engine
from .models.product import Product, ProductVersion, RecipeIngredient
from .models.supplier import Supplier, Ingredient, PackagingItem, InventoryItem, SOP, ProductCost
from .api.v1.routers import products, suppliers

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BELVERA HQ API", version="1.0.0", description="Operating System for Belvera Premium Italian Ice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api/v1/products", tags=["R&D Lab"])
app.include_router(suppliers.router, prefix="/api/v1", tags=["Operations"])

@app.get("/")
def root():
    return {"message": "BELVERA HQ API is running", "version": "1.0.0", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}

# Seed data endpoint for V1 demo
@app.post("/seed")
def seed_demo():
    from .core.database import SessionLocal
    db = SessionLocal()
    if db.query(Product).first():
        db.close()
        return {"message": "Already seeded"}
    
    # Ingredients
    ing1 = Ingredient(name="Strawberry Puree - Premium", category="fruit_puree", cost_per_unit=12.5, stock_quantity=25, reorder_point=5, sku="FR-PUR-STR-001")
    ing2 = Ingredient(name="Collagen Peptides - Bovine", category="collagen", cost_per_unit=45.0, stock_quantity=10, reorder_point=2, sku="FUN-COL-001")
    ing3 = Ingredient(name="Cane Sugar Organic", category="syrups", cost_per_unit=3.2, stock_quantity=50, reorder_point=10, sku="SWEET-CANE-001")
    ing4 = Ingredient(name="Whey Protein Isolate", category="protein", cost_per_unit=38.0, stock_quantity=8, reorder_point=3, sku="FUN-PRO-001")
    db.add_all([ing1, ing2, ing3, ing4])
    db.commit()

    # Supplier
    sup = Supplier(name="Italian Fruit Co.", category="fruit_puree", contact_name="Marco Rossi", email="marco@italianfruit.co", phone="+39 02 1234 5678", shipping_days=7, rating=5, notes="Premium Sicilian fruits")
    db.add(sup)
    db.commit()

    # Product
    prod = Product(product_code="BV-STR-COL-001", name="Strawberry Collagen Italian Ice", collection="functional", description="Premium strawberry with collagen - beauty + refreshment", status="testing", current_version="1.3")
    db.add(prod)
    db.commit()

    ver = ProductVersion(product_id=prod.id, version_number="1.3", taste_score=9, texture_score=8, appearance_score=9, testing_notes="Needs stronger strawberry flavor - increase puree by 15%", recipe_instructions="1. Blend strawberry puree 500g\n2. Dissolve collagen 20g in water\n3. Mix sugar syrup\n4. Freeze and churn")
    db.add(ver)
    db.commit()

    ri = RecipeIngredient(product_version_id=ver.id, ingredient_id=ing1.id, quantity_grams=500)
    ri2 = RecipeIngredient(product_version_id=ver.id, ingredient_id=ing2.id, quantity_grams=20)
    ri3 = RecipeIngredient(product_version_id=ver.id, ingredient_id=ing3.id, quantity_grams=200)
    db.add_all([ri, ri2, ri3])
    
    # SOPs
    sop1 = SOP(title="Opening Checklist - Daily", category="opening", version="1.0", content_markdown="# Opening Checklist\n1. Sanitize all surfaces\n2. Check freezer temp (-18C)\n3. Inventory quick count\n4. Prep station setup")
    sop2 = SOP(title="Italian Ice Production - Standard Process", category="production", version="1.2", content_markdown="# Production SOP\n## Quality Standards\n- Taste must be 8/10 minimum\n- Texture: smooth, no ice crystals\n- Temp: serve at -5C")
    db.add_all([sop1, sop2])
    db.commit()
    db.close()
    return {"message": "Seeded with Strawberry Collagen Italian Ice v1.3 + 4 ingredients + 2 SOPs"}
