from functools import lru_cache
from pydantic import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Carrega e tipa variáveis de ambiente para toda a aplicação."""

    APP_NAME: str = "BNA Pre-Meeting Intel API"
    API_V1_STR: str = "/api"

    # Segurança / JWT
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12
    ALGORITHM: str = "HS256"

    # Banco de dados (SQLAlchemy + Postgres)
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/bna"

    # CORS (origens permitidas para o frontend)
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    # Provedor de LLM (padrão: OpenAI). Pode ser alternado por env.
    LLM_PROVIDER: str = "openai"  # openai|gemini|ollama
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


