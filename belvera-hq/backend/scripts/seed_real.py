import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import SessionLocal
from app.models.product import Product

db = SessionLocal()

print("Product columns:", [c.name for c in Product.__table__.columns])

real_products = [
    {"name": "Original Acai Bowl", "product_code": "BV-001", "description": "Organic acai, banana, granola, honey", "collection": "signature_bowls", "status": "approved"},
    {"name": "Protein Power Bowl", "product_code": "BV-002", "description": "Acai + peanut butter + protein + banana", "collection": "signature_bowls", "status": "approved"},
    {"name": "Tropical Mango Bowl", "product_code": "BV-003", "description": "Mango, pineapple, coconut, acai", "collection": "seasonal_bowls", "status": "approved"},
    {"name": "Green Detox Bowl", "product_code": "BV-004", "description": "Spinach, kale, acai, banana", "collection": "wellness_bowls", "status": "approved"},
]

for rp in real_products:
    exists = db.query(Product).filter_by(product_code=rp["product_code"]).first()
    if exists:
        print(f"Exists: {rp['name']} - deleting to recreate")
        db.delete(exists)
        db.commit()
    
    try:
        p = Product(**rp)
        db.add(p)
        db.commit()
        db.refresh(p)
        print(f"✅ Created: {rp['name']} - {p.id}")
    except Exception as e:
        db.rollback()
        print(f"❌ FAILED {rp['name']}: {e}")
        import traceback; traceback.print_exc()

print(f"Total products now: {db.query(Product).count()}")
db.close()