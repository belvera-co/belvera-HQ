from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import Base, engine
from .models.product import Product, ProductVersion, RecipeIngredient
from .models.supplier import Supplier, Ingredient, PackagingItem, InventoryItem, SOP, ProductCost
from .models.production import Batch, BatchIngredientUsage
from .models.orders import Order, OrderItem, Customer
from .models.finance import Expense
from .models.team import Staff, FranchiseChecklist
from .models.franchise import FranchiseFinancial
from .models.user import User
from .models.note import Note
from .api.v1.routers import products, suppliers, production, orders, finance, team, sops, dashboard, reports, franchise_financial, labels, auth
from .api.v1.routers.notes import router as notes_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BELVERA HQ API", version="10.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api/v1/products", tags=["R&D Lab"])
app.include_router(suppliers.router, prefix="/api/v1", tags=["Operations"])
app.include_router(production.router, prefix="/api/v1", tags=["Production"])
app.include_router(orders.router, prefix="/api/v1", tags=["Sales"])
app.include_router(finance.router, prefix="/api/v1", tags=["Finance"])
app.include_router(team.router, prefix="/api/v1", tags=["Team & Franchise"])
app.include_router(sops.router, prefix="/api/v1", tags=["SOPs"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])
app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])
app.include_router(franchise_financial.router, prefix="/api/v1", tags=["Franchise Financial"])
app.include_router(labels.router, prefix="/api/v1", tags=["Labels & Packaging"])
app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(notes_router, prefix="/api/v1", tags=["Notes"])

@app.get("/")
def root():
    return {"message": "BELVERA HQ API running", "version": "10.0.0 - FINAL HQ", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}