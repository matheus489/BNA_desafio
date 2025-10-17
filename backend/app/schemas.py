from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, AnyHttpUrl
from datetime import datetime


class Token(BaseModel):
    """Resposta de autenticação com token de acesso."""
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Conteúdo do JWT decodificado."""
    sub: str
    role: str
    exp: int


class UserBase(BaseModel):
    email: EmailStr
    role: str = "user"


class UserCreate(BaseModel):
    """Entrada para criação de usuário."""
    email: EmailStr
    password: str


class UserOut(UserBase):
    """Saída de usuário para o cliente (sem senha)."""
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class AnalyzeRequest(BaseModel):
    """Entrada para análise de página (URL)."""
    url: AnyHttpUrl


class AnalyzeResponse(BaseModel):
    """Saída padronizada para análise: resumo, pontos e entidades."""
    id: int
    url: str
    title: Optional[str]
    summary: Optional[str]
    key_points: Optional[List[str]]
    entities: Optional[Dict[str, Any]]
    created_at: datetime


class HistoryItem(AnalyzeResponse):
    pass


class ChatRequest(BaseModel):
    """Requisição de chat RAG."""
    message: str
    use_web_search: bool = True  # Se deve fazer busca na web
    max_history: int = 10  # Quantas mensagens antigas incluir como contexto


class ChatSource(BaseModel):
    """Fonte de informação usada na resposta."""
    type: str  # 'database' ou 'web'
    title: str
    url: str
    snippet: Optional[str] = None


class ChatResponse(BaseModel):
    """Resposta do chat RAG."""
    message: str
    sources: List[ChatSource]
    timestamp: datetime


class ChatHistoryItem(BaseModel):
    """Item do histórico de chat."""
    id: int
    role: str  # 'user' ou 'assistant'
    content: str
    sources: Optional[List[Dict[str, Any]]]
    created_at: datetime
    
    class Config:
        orm_mode = True


