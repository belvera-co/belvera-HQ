import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import SessionLocal
from app.models.product import Product
from app.models.supplier import Ingredient, Supplier
from app.models.production import Batch
from app.models.orders import Order

db = SessionLocal()

# Delete ALL products (your request - blank slate for your real implementation)
all_products = db.query(Product).all()
for p in all_products:
    print(f"Deleting: {p.name} - {p.product_code}")
    db.delete(p)

db.commit()
print(f"Cleanup done")
print(f"Remaining products: {db.query(Product).count()}")
print(f"Remaining ingredients: {db.query(Ingredient).count()}")
db.close()