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
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    # Relacionamento com o dono (usuário que solicitou a análise)
    owner = relationship("User", back_populates="analyses")


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


