from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ....core.database import get_db
from ....models.note import Note

router = APIRouter()

@router.get("/notes")
def list_notes(db: Session = Depends(get_db)):
    return db.query(Note).order_by(Note.updated_at.desc()).all()

@router.post("/notes")
def create_note(data: dict, db: Session = Depends(get_db)):
    n = Note(**data)
    db.add(n); db.commit(); db.refresh(n)
    return n

@router.put("/notes/{note_id}")
def update_note(note_id: str, data: dict, db: Session = Depends(get_db)):
    n = db.query(Note).filter_by(id=note_id).first()
    if not n: raise HTTPException(404, "Not found")
    for k,v in data.items():
        if hasattr(n,k):
            setattr(n,k,v)
    db.commit(); db.refresh(n)
    return n

@router.delete("/notes/{note_id}")
def delete_note(note_id: str, db: Session = Depends(get_db)):
    n = db.query(Note).filter_by(id=note_id).first()
    if not n: raise HTTPException(404, "Not found")
    db.delete(n); db.commit()
    return {"deleted": True}