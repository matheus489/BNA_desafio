from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Modelos e dependências de banco/segurança
from .. import models, schemas
from ..database import get_db
from ..security import get_current_user_payload
from ..services.text_formatter import format_title, format_summary, format_key_points


router = APIRouter()


def _ensure_admin(user_payload):
    """Garante que o usuário do token é admin."""
    if not user_payload or user_payload.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")


@router.get("/users", response_model=List[schemas.UserOut])
def list_users(db: Session = Depends(get_db), user=Depends(get_current_user_payload)):
    _ensure_admin(user)
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


class UpdateRole(schemas.BaseModel):
    # Novo papel para o usuário: 'user' ou 'admin'
    role: str


@router.patch("/users/{user_id}/role", response_model=schemas.UserOut)
def update_role(user_id: int, body: UpdateRole, db: Session = Depends(get_db), user=Depends(get_current_user_payload)):
    _ensure_admin(user)
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    target.role = body.role
    db.add(target)
    db.commit()
    db.refresh(target)
    return target


@router.get("/analyses", response_model=List[schemas.HistoryItem])
def list_all_analyses(db: Session = Depends(get_db), user=Depends(get_current_user_payload)):
    _ensure_admin(user)
    rows = db.query(models.PageAnalysis).order_by(models.PageAnalysis.created_at.desc()).limit(200).all()
    import json
    return [
        schemas.HistoryItem(
            id=r.id,
            url=r.url,
            title=format_title(r.title),
            summary=format_summary(r.summary),
            key_points=format_key_points(json.loads(r.key_points) if r.key_points else []),
            entities=json.loads(r.entities) if r.entities else None,
            created_at=r.created_at,
        )
        for r in rows
    ]


