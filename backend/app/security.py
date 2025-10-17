from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
import hashlib
import secrets
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from .config import settings


# Define o esquema OAuth2 para extrair o token Bearer do cabeçalho Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Valida senha em texto plano contra o hash armazenado."""
    try:
        # Formato: salt$hash
        salt, hash_part = hashed_password.split('$', 1)
        # Gera hash da senha com o salt
        password_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return password_hash.hex() == hash_part
    except:
        return False


def get_password_hash(password: str) -> str:
    """Gera hash seguro para senha do usuário."""
    # Gera um salt aleatório
    salt = secrets.token_hex(32)
    # Gera hash da senha com o salt
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${password_hash.hex()}"


def create_access_token(subject: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Cria JWT com subject (id do usuário), role e expiração."""
    expires_delta = expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str):
    """Decodifica e valida token JWT, levanta 401 se inválido."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_current_user_payload(token: str = Depends(oauth2_scheme)):
    """Dependency que retorna o payload do usuário autenticado a partir do token Bearer."""
    return decode_token(token)


