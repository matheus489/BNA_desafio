from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings


engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
# Fabrica sessões para uso por request (FastAPI dependency)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base para modelos do SQLAlchemy
Base = declarative_base()


def get_db():
    """Dependency de injeção de sessão DB (abre e fecha por request)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


