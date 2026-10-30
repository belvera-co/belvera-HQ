from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid, datetime
from app.core.database import get_db
from app.models.supplier import SOP

router = APIRouter()

@router.get("/sops")
def list_sops(db: Session = Depends(get_db)):
    return db.query(SOP).order_by(SOP.created_at.desc()).all()

@router.post("/sops")
def create_sop(data: dict, db: Session = Depends(get_db)):
    try:
        allowed = {c.name for c in SOP.__table__.columns}
        filtered = {k: v for k, v in data.items() if k in allowed}
        if "id" in allowed:
            filtered["id"] = str(uuid.uuid4())
        if "created_at" in allowed:
            filtered["created_at"] = datetime.datetime.utcnow()
        if not filtered.get("title"):
            filtered["title"] = "Untitled"
        if not filtered.get("content"):
            filtered["content"] = "Auto"
        if "category" in allowed and not filtered.get("category"):
            filtered["category"] = "production"
        s = SOP(**filtered)
        db.add(s)
        db.commit()
        db.refresh(s)
        return s
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/sops/{sop_id}")
def update_sop(sop_id: str, data: dict, db: Session = Depends(get_db)):
    s = db.query(SOP).filter_by(id=sop_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    for k,v in data.items():
        if hasattr(s,k):
            setattr(s,k,v)
    db.commit()
    db.refresh(s)
    return s

@router.delete("/sops/{sop_id}")
def delete_sop(sop_id: str, db: Session = Depends(get_db)):
    s = db.query(SOP).filter_by(id=sop_id).first()
    if s:
        db.delete(s)
        db.commit()
    return {"deleted": True}