# bna.dev – Plataforma de Inteligência para Vendas

Solução completa com RAG e IA para coletar, resumir e estruturar informações de páginas web, apoiando o time de vendas antes de reuniões.

## 🚀 **NOVO: Sistema RAG com Web Search Automático**

Agora com **Chat RAG (Retrieval-Augmented Generation)** que combina:
- 🔍 **Busca vetorial** no histórico de análises (embeddings semânticos)
- 🌐 **Web Search automático** em tempo real (Google/DuckDuckGo)
- 🤖 **GPT-4** para respostas contextualizadas e inteligentes
- 💬 **Interface de chat** moderna e interativa

**Exemplos de uso:**
- "Qual o stack tecnológico da empresa X?"
- "Quais empresas de IA já analisei?"
- "Me dê informações sobre pricing de SaaS B2B"

## Arquitetura
- Backend: FastAPI (Python), SQLAlchemy (PostgreSQL), JWT, serviços de scraping, LLM e RAG
- Banco: PostgreSQL (Docker Compose)
- Frontend: React + Vite
- IA: OpenAI (GPT-4 + Embeddings)
- RAG: Busca vetorial com similaridade de cosseno
- Web Search: Google/DuckDuckGo + scraping automático

Estrutura:
- `backend/`: API, modelos, serviços (`scraper`, `llm`, `embeddings`, `web_search`), rotas (`auth`, `analyze`, `history`, `chat`)
- `frontend/`: React app (Login, Analyze, Chat RAG, History)

## Requisitos
- Python 3.11+
- Node 18+
- Docker (para Postgres)

## Como rodar (local)
1) Suba o Postgres:
```bash
docker compose up -d db
```

2) Backend: instalar deps e iniciar API
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
python -m backend.app.scripts.init_db
uvicorn backend.app.main:app --reload --port 8000
```
Crie `backend/.env` com por exemplo:
```env
SECRET_KEY=change-me
ACCESS_TOKEN_EXPIRE_MINUTES=720
ALGORITHM=HS256
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/bna
CORS_ORIGINS=["http://localhost:5173"]
LLM_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

3) Frontend: iniciar
```bash
cd frontend
npm install
npm run dev
```
Acesse `http://localhost:5173`.

## Fluxo de uso
1. Registrar e logar (token JWT salvo no localStorage)
2. Enviar URL em "Analisar" (scraping + LLM + persistência com dedup por URL)
3. **[NOVO]** Usar "Chat RAG" para fazer perguntas sobre empresas (busca no banco + web)
4. Ver "Histórico" das análises (retorno imediato sem reprocessar)
5. **[NOVO]** Exportar histórico para Google Sheets (1 clique!)

## Endpoints

### Autenticação
- POST `/auth/register` { email, password }
- POST `/auth/login` (OAuth2 form: username=email, password=...)

### Análise de Sites
- POST `/analyze` { url } (Bearer token)
- GET `/history` (Bearer token)
- **[NOVO]** GET `/history/export/csv` (Bearer token) - Exporta para Google Sheets
  - CSV formatado com 11 colunas estruturadas
  - Download automático
  - Pronto para importar no Google Sheets

### **[NOVO] Chat RAG**
- POST `/chat` { message, use_web_search, max_history } (Bearer token)
  - Faz busca vetorial no banco de análises
  - Opcionalmente busca na web em tempo real
  - Retorna resposta do GPT-4 com fontes citadas
- GET `/chat/history` (Bearer token) - Histórico de conversas
- DELETE `/chat/history` (Bearer token) - Limpa histórico

## Notas técnicas
- **RAG**: Embeddings vetoriais (OpenAI ada-002) + similaridade de cosseno
- **Web Search**: Google (fallback DuckDuckGo) + scraping automático dos top resultados
- **Deduplicação**: `UniqueConstraint(url)` e verificação antes de scrap/LLM
- **Segurança**: JWT; base para RBAC (campo `role` em `users`)
- **Cache inteligente**: Análises armazenadas evitam reprocessamento
- **Contexto rico**: Combina banco de dados + web + histórico de conversa
- Extensões futuras: Alembic (migrations), testes, streaming de respostas, integração CRM

## Deploy (visão geral)
- Backend: Uvicorn/Gunicorn atrás de Nginx
- DB: Postgres gerenciado ou container dedicado com backup
- Frontend: build do Vite servido por CDN/Nginx
- Variáveis de ambiente configuradas no ambiente de produção

Para o roteiro de entrevista, veja `PRESENTATION.md`.
