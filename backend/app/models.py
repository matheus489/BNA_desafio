from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamento: um usuário pode ter várias análises
    analyses = relationship("PageAnalysis", back_populates="owner")
    # Relacionamento: um usuário pode ter várias sessões de treinamento
    training_sessions = relationship("TrainingSession", back_populates="user")


class PageAnalysis(Base):
    __tablename__ = "page_analyses"
    __table_args__ = (
        UniqueConstraint("url", name="uq_page_analyses_url"),
    )

    id = Column(Integer, primary_key=True, index=True)
    url = Column(Text, nullable=False)
    title = Column(Text, nullable=True)
    raw_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    key_points = Column(Text, nullable=True)  # Armazenado como JSON (string) de lista
    entities = Column(Text, nullable=True)    # Armazenado como JSON (string) de dicionário
    stage = Column(String(50), default='lead', nullable=False)  # Pipeline stage
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    # Relacionamento com o dono (usuário que solicitou a análise)
    owner = relationship("User", back_populates="analyses")
    
    # Vendedor atribuído ao card
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    seller = relationship("User", foreign_keys=[seller_id], backref="assigned_analyses")
    
    # Relacionamento com notas e anexos
    notes = relationship("AnalysisNote", back_populates="analysis", cascade="all, delete-orphan")
    attachments = relationship("AnalysisAttachment", back_populates="analysis", cascade="all, delete-orphan")


class ChatMessage(Base):
    """Histórico de mensagens do chat RAG"""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' ou 'assistant'
    content = Column(Text, nullable=False)
    sources = Column(Text, nullable=True)  # JSON com fontes usadas (análises + web)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamento com usuário
    user = relationship("User")


class TrainingSession(Base):
    """Sessões de treinamento do simulador de objeções"""
    __tablename__ = "training_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    analysis_id = Column(Integer, ForeignKey("page_analyses.id"), nullable=True)  # Empresa relacionada
    difficulty = Column(String(20), nullable=False)  # easy, medium, hard
    objection = Column(Text, nullable=False)  # A objeção apresentada
    objection_type = Column(String(50), nullable=True)  # preço, timing, concorrência, etc
    user_response = Column(Text, nullable=False)  # Resposta do usuário
    suggested_response = Column(Text, nullable=True)  # Resposta sugerida
    evaluation = Column(Text, nullable=True)  # JSON com avaliação (score, feedback, etc)
    score = Column(Integer, nullable=True)  # 0-100
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamentos
    user = relationship("User", back_populates="training_sessions")
    analysis = relationship("PageAnalysis")


class AnalysisNote(Base):
    """Notas/anotações sobre análises no Kanban"""
    __tablename__ = "analysis_notes"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("page_analyses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relacionamentos
    analysis = relationship("PageAnalysis", back_populates="notes")
    user = relationship("User")


class AnalysisAttachment(Base):
    """Anexos das análises no Kanban"""
    __tablename__ = "analysis_attachments"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("page_analyses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_url = Column(Text, nullable=False)  # URL ou path do arquivo
    file_type = Column(String(100), nullable=True)
    file_size = Column(Integer, nullable=True)  # Tamanho em bytes
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamentos
    analysis = relationship("PageAnalysis", back_populates="attachments")
    user = relationship("User")
