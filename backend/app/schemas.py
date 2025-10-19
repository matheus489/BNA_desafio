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


# ========== Schemas para Simulador de Objeções ==========

class ObjectionItem(BaseModel):
    """Item de objeção individual."""
    id: int
    objection: str
    type: str
    difficulty: str
    hint: str
    suggested_response: str
    context: str


class GenerateObjectionsRequest(BaseModel):
    """Requisição para gerar objeções."""
    analysis_id: int
    difficulty: str = "medium"  # easy, medium, hard


class GenerateObjectionsResponse(BaseModel):
    """Resposta com objeções geradas."""
    objections: List[ObjectionItem]
    company_context: str
    overall_strategy: str


class SubmitResponseRequest(BaseModel):
    """Requisição para submeter resposta a uma objeção."""
    objection: str
    objection_type: str
    user_response: str
    suggested_response: str
    company_context: str
    analysis_id: Optional[int] = None
    difficulty: str = "medium"


class ResponseEvaluation(BaseModel):
    """Avaliação da resposta do usuário."""
    score: int  # 0-100
    grade: str  # A+, A, B+, B, C+, C, D, F
    strengths: List[str]
    weaknesses: List[str]
    improvements: List[str]
    tone_analysis: str
    overall_feedback: str


class SubmitResponseResponse(BaseModel):
    """Resposta da avaliação."""
    evaluation: ResponseEvaluation
    session_id: int  # ID da sessão de treinamento salva


class TrainingSessionOut(BaseModel):
    """Saída de uma sessão de treinamento."""
    id: int
    analysis_id: Optional[int]
    difficulty: str
    objection: str
    objection_type: Optional[str]
    user_response: str
    suggested_response: Optional[str]
    evaluation: Optional[Dict[str, Any]]
    score: Optional[int]
    created_at: datetime
    
    class Config:
        orm_mode = True


class TrainingStatsResponse(BaseModel):
    """Estatísticas de treinamento do usuário."""
    total_sessions: int
    average_score: float
    sessions_by_difficulty: Dict[str, int]
    sessions_by_type: Dict[str, int]
    recent_sessions: List[TrainingSessionOut]
    improvement_trend: List[Dict[str, Any]]  # Score ao longo do tempo


