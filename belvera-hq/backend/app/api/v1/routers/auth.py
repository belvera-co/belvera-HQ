from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from....core.database import get_db
from....models.user import User

router = APIRouter()

def ensure_seed(db: Session):
    users = db.query(User).count()
    if users == 0:
        founder = User(email="founder@belvera.com", name="Founder", password="belvera123", role="founder")
        manager = User(email="manager@belvera.com", name="Manager", password="manager123", role="manager")
        db.add(founder)
        db.add(manager)
        db.commit()

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    ensure_seed(db)
    return db.query(User).all()

@router.post("/auth/login")
def login(data: dict, db: Session = Depends(get_db)):
    ensure_seed(db)
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    user = db.query(User).filter_by(email=email, password=password).first()
    # also try case-insensitive email search
    if not user:
        user = db.query(User).filter(User.email.ilike(email)).filter_by(password=password).first()
    if not user:
        # debug: list what we have
        all_users = db.query(User).all()
        print(f"LOGIN FAILED: tried {email}/{password}, users in DB: {[(u.email, u.password) for u in all_users]}")
        raise HTTPException(401, f"Invalid login. Users in DB: {[u.email for u in all_users]} - Use founder@belvera.com / belvera123")
    return {"id": user.id, "email": user.email, "name": user.name, "role": user.role, "token": f"fake-token-{user.id}"}

@router.post("/users")
def create_user(data: dict, db: Session = Depends(get_db)):
    u = User(**data)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u

@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    u = db.query(User).filter_by(id=user_id).first()
    if not u:
        raise HTTPException(404, "Not found")
    if u.role=="founder":
        founders = db.query(User).filter_by(role="founder").count()
        if founders<=1:
            raise HTTPException(400, "Cannot delete last founder")
    db.delete(u)
    db.commit()
    return {"deleted": True}