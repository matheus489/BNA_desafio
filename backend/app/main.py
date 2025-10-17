from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configurações da aplicação (variáveis de ambiente, CORS, etc.)
from .config import settings
# Rotas principais da API
from .routers import auth, analyze, history, admin, chat


# Instância principal do FastAPI
app = FastAPI(
    title="bna.dev API",
    description="Plataforma de Inteligência para Vendas com RAG e IA",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware de CORS para permitir o frontend acessar a API em ambiente local
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/health")
def health():
    """Endpoint simples de verificação de saúde da API."""
    return {"status": "ok"}


# Registro das rotas organizadas por domínio
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
app.include_router(history.router, prefix="/history", tags=["history"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])


