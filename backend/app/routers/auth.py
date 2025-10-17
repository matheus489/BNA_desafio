from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

# Modelos e esquemas de entrada/saída
from .. import models, schemas
# Sessão de banco por request
from ..database import get_db
# Funções auxiliares de segurança (hash, verificação, JWT)
from ..security import verify_password, get_password_hash, create_access_token
from ..security import get_current_user_payload


router = APIRouter()


@router.post("/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Cria um novo usuário com email e senha.
    - Falha se email já estiver cadastrado.
    """
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(email=user_in.email, hashed_password=get_password_hash(user_in.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Autentica o usuário (OAuth2 form) e retorna token JWT."""
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=str(user.id), role=user.role)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def me(db: Session = Depends(get_db), payload=Depends(get_current_user_payload)):
    """Retorna dados do usuário autenticado a partir do token."""
    user = db.query(models.User).filter(models.User.id == int(payload.get("sub"))).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/refresh-token", response_model=schemas.Token)
def refresh_token(db: Session = Depends(get_db), payload=Depends(get_current_user_payload)):
    """Força a geração de um novo token com a role atual do banco."""
    user = db.query(models.User).filter(models.User.id == int(payload.get("sub"))).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Gera novo token com a role atual do banco
    token = create_access_token(subject=str(user.id), role=user.role)
    return {"access_token": token, "token_type": "bearer"}


