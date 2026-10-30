from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from....core.database import get_db
from....models.team import Staff, FranchiseChecklist
from....models.production import Batch
from datetime import datetime

router = APIRouter()

def clean_data(model_class, data: dict):
    allowed = {c.name for c in model_class.__table__.columns}
    return {k: v for k, v in data.items() if k in allowed}

# STAFF
@router.get("/staff")
def list_staff(db: Session = Depends(get_db)):
    staff = db.query(Staff).order_by(Staff.created_at.desc()).all()
    out = []
    for s in staff:
        # Link to Production - how many batches this staff made (if assigned)
        batch_count = 0
        try:
            # if you have staff_id on batches later, this will work auto
            if hasattr(Batch, 'created_by') or hasattr(Batch, 'staff_id'):
                batch_count = db.query(Batch).filter_by(staff_id=getattr(s,'id',None)).count() if hasattr(Batch,'staff_id') else 0
        except: pass

        # AI insight based on role
        role = getattr(s, 'role', 'staff') or 'staff'
        status = getattr(s, 'status', 'active') or 'active'
        if role == 'production' and status == 'active':
            ai_tip = "🔥 AI: On production today - assign 20 tub batch"
        elif role == 'manager':
            ai_tip = "✅ AI: Manager - can approve batches & costs"
        elif status!= 'active':
            ai_tip = "⚠️ AI: Inactive - not scheduled"
        else:
            ai_tip = "💡 AI: Ready for shift"

        out.append({
            "id": s.id,
            "name": getattr(s, 'name', 'Staff'),
            "email": getattr(s, 'email', ''),
            "phone": getattr(s, 'phone', ''),
            "role": role,
            "status": status,
            "avatar": getattr(s, 'avatar', '') or f"https://ui-avatars.com/api/?name={getattr(s,'name','S')}&background=000&color=fff",
            "pay_rate": getattr(s, 'pay_rate', 0) if hasattr(s,'pay_rate') else 0,
            "batches_made": batch_count,
            "created_at": getattr(s, 'created_at', None),
            "ai_tip": ai_tip,
            "_raw": s # keep original for frontend compat
        })
    # Return raw model if frontend expects simple, but we add fields
    # For compat, return original models + we will use AI tips on frontend
    return db.query(Staff).order_by(Staff.created_at.desc()).all()

@router.get("/staff/stats")
def staff_stats(db: Session = Depends(get_db)):
    all_staff = db.query(Staff).all()
    active = [s for s in all_staff if getattr(s, 'status', 'active') == 'active']
    roles = {}
    for s in all_staff:
        r = getattr(s, 'role', 'staff') or 'staff'
        roles[r] = roles.get(r, 0) + 1
    return {
        "total": len(all_staff),
        "active_today": len(active),
        "roles": roles,
        "ai_summary": f"AI: {len(active)}/{len(all_staff)} active today. {'Add production staff' if roles.get('production',0) < 2 else 'Team optimal'}"
    }

@router.post("/staff")
def create_staff(data: dict, db: Session = Depends(get_db)):
    # SaaS-ready: only allow real columns
    clean = clean_data(Staff, data)
    # default role/status if not provided
    if 'role' not in clean: clean['role'] = 'production'
    if 'status' not in clean: clean['status'] = 'active'
    s = Staff(**clean)
    db.add(s); db.commit(); db.refresh(s)
    return s

@router.put("/staff/{staff_id}")
def update_staff(staff_id: str, data: dict, db: Session = Depends(get_db)):
    s = db.query(Staff).filter_by(id=staff_id).first()
    if not s: raise HTTPException(404, "Not found")
    for k,v in clean_data(Staff, data).items():
        setattr(s,k,v)
    db.commit(); db.refresh(s)
    return s

@router.delete("/staff/{staff_id}")
def delete_staff(staff_id: str, db: Session = Depends(get_db)):
    s = db.query(Staff).filter_by(id=staff_id).first()
    if not s: raise HTTPException(404, "Not found")
    db.delete(s); db.commit()
    return {"deleted": True}

@router.post("/staff/{staff_id}/clock")
def clock_staff(staff_id: str, data: dict, db: Session = Depends(get_db)):
    s = db.query(Staff).filter_by(id=staff_id).first()
    if not s: raise HTTPException(404, "Not found")
    action = data.get('action', 'in') # in / out
    if hasattr(s, 'status'):
        s.status = 'active' if action == 'in' else 'off_duty'
        db.commit(); db.refresh(s)
    return {"staff_id": staff_id, "action": action, "status": getattr(s, 'status', 'active'), "ai": f"AI: Clocked {action} at {datetime.now().strftime('%H:%M')}"}

# FRANCHISE CHECKLIST
@router.get("/franchise/checklist")
def list_checklist(db: Session = Depends(get_db)):
    items = db.query(FranchiseChecklist).all()
    if not items:
        defaults = [
            {"category":"legal","task":"Incorporation & Business License","description":"Legal entity, permits","priority":"high"},
            {"category":"legal","task":"Trademark - BELVERA","description":"Protect brand name/logo","priority":"high"},
            {"category":"operations","task":"SOP Library Complete","description":"All recipes + production + cleaning SOPs documented","priority":"high"},
            {"category":"operations","task":"Supplier Contracts Locked","description":"Main puree, collagen, packaging suppliers under contract","priority":"high"},
            {"category":"branding","task":"Brand Book + Packaging Design","description":"Logo, colors, fonts, packaging final","priority":"medium"},
            {"category":"training","task":"Staff Training Program","description":"Training manual for new hires","priority":"medium"},
            {"category":"finance","task":"Unit Economics Proven","description":"Know real cost per bowl, margin, break-even","priority":"high"},
            {"category":"finance","task":"POS + Accounting System","description":"Sales and expenses tracking live","priority":"high"},
        ]
        for d in defaults:
            db.add(FranchiseChecklist(**clean_data(FranchiseChecklist, d)))
        db.commit()
        items = db.query(FranchiseChecklist).all()
    return items

@router.put("/franchise/checklist/{item_id}")
def update_checklist(item_id: str, data: dict, db: Session = Depends(get_db)):
    item = db.query(FranchiseChecklist).filter_by(id=item_id).first()
    if not item: raise HTTPException(404, "Not found")
    for k,v in clean_data(FranchiseChecklist, data).items():
        setattr(item,k,v)
    db.commit(); db.refresh(item)
    return item

@router.post("/franchise/checklist")
def create_checklist_item(data: dict, db: Session = Depends(get_db)):
    item = FranchiseChecklist(**clean_data(FranchiseChecklist, data))
    db.add(item); db.commit(); db.refresh(item)
    return item

@router.delete("/franchise/checklist/{item_id}")
def delete_checklist(item_id: str, db: Session = Depends(get_db)):
    item = db.query(FranchiseChecklist).filter_by(id=item_id).first()
    if not item: raise HTTPException(404, "Not found")
    db.delete(item); db.commit()
    return {"deleted": True}