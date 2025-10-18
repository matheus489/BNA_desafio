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
- Frontend: React + Vite (interface limpa e profissional)
- IA: OpenAI (GPT-4 + Embeddings)
- RAG: Busca vetorial com similaridade de cosseno
- Web Search: Google/DuckDuckGo + scraping automático
- **[NOVO]** Adminer: Interface web para gerenciamento de dados

Estrutura:
- `backend/`: API, modelos, serviços (`scraper`, `llm`, `embeddings`, `web_search`), rotas (`auth`, `analyze`, `history`, `chat`)
- `frontend/`: React app (Login, Analyze, Chat RAG, History)
- `docker-compose.yml`: Orquestração completa (DB, Backend, Frontend, Adminer)

## Requisitos
- Python 3.11+
- Node 18+
- Docker (para Postgres)

## Como rodar

### **🐳 Opção 1: Docker Compose (Recomendado)**

A forma mais simples de rodar todo o projeto:

```bash
# Iniciar todos os serviços (Backend, Frontend, PostgreSQL, Adminer)
docker-compose up -d

# Verificar status
docker-compose ps

# Parar todos os serviços
docker-compose down
```

**Serviços disponíveis:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Adminer (Gerenciamento de Dados):** http://localhost:8081
- **PostgreSQL:** localhost:5432

**Acessar dados no Adminer:**
1. Acesse http://localhost:8081
2. Preencha:
   - **Sistema:** PostgreSQL
   - **Servidor:** `bna-db-1`
   - **Usuário:** `postgres`
   - **Senha:** `postgres`
   - **Banco:** `bna`

### **💻 Opção 2: Desenvolvimento Local**

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

Crie `.env` na raiz com:
```env
SECRET_KEY=change-me
ACCESS_TOKEN_EXPIRE_MINUTES=720
ALGORITHM=HS256
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/bna
CORS_ORIGINS=["http://localhost:5173"]
LLM_PROVIDER=openai
OPENAI_API_KEY=sua-chave-aqui
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
6. **[NOVO]** Gerenciar dados pelo Adminer (visualizar, consultar, exportar)

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

## 🆕 Melhorias Recentes

### **Interface Limpa e Profissional**
- ✅ Removidos emojis problemáticos que causavam símbolos quebrados
- ✅ Interface mais limpa focada em informações textuais
- ✅ Cards de informações estruturadas otimizados

### **Extração de Oportunidades Aprimorada**
- ✅ Algoritmo melhorado com mais palavras-chave
- ✅ Sistema de fallback inteligente baseado no tipo de empresa
- ✅ Validação de conteúdo para evitar cards vazios
- ✅ Insights contextuais automatizados

### **Gerenciamento de Dados com Adminer**
- ✅ Interface web integrada para acesso aos dados
- ✅ Visualização de tabelas: `page_analyses`, `chat_messages`, `users`
- ✅ Execução de queries SQL customizadas
- ✅ Exportação de dados em múltiplos formatos (CSV, JSON, SQL)
- ✅ Backup e restore facilitados

## 📊 Gerenciamento de Dados

### **Via Adminer (Interface Web)**
```
URL: http://localhost:8081
Sistema: PostgreSQL
Servidor: bna-db-1
Usuário: postgres
Senha: postgres
Banco: bna
```

### **Queries Úteis**
```sql
-- Ver todas as análises
SELECT id, url, title, created_at 
FROM page_analyses 
ORDER BY created_at DESC;

-- Contar análises por usuário
SELECT owner_id, COUNT(*) as total_analises 
FROM page_analyses 
GROUP BY owner_id;

-- Ver mensagens do chat
SELECT role, content, created_at 
FROM chat_messages 
ORDER BY created_at DESC 
LIMIT 10;

-- Backup de dados
-- Execute no terminal do container PostgreSQL:
pg_dump -U postgres bna > backup_bna.sql
```

### **Via Docker CLI**
```bash
# Acessar PostgreSQL via terminal
docker exec -it bna-db-1 psql -U postgres -d bna

# Ver tabelas
\dt

# Fazer backup
docker exec bna-db-1 pg_dump -U postgres bna > backup_bna.sql

# Restaurar backup
docker exec -i bna-db-1 psql -U postgres bna < backup_bna.sql
```

## Notas técnicas
- **RAG**: Embeddings vetoriais (OpenAI ada-002) + similaridade de cosseno
- **Web Search**: Google (fallback DuckDuckGo) + scraping automático dos top resultados
- **Deduplicação**: `UniqueConstraint(url)` e verificação antes de scrap/LLM
- **Segurança**: JWT; base para RBAC (campo `role` em `users`)
- **Cache inteligente**: Análises armazenadas evitam reprocessamento
- **Contexto rico**: Combina banco de dados + web + histórico de conversa
- **Persistência**: Volume Docker para dados do PostgreSQL
- **Observabilidade**: Adminer para inspeção e debugging de dados
- Extensões futuras: Alembic (migrations), testes, streaming de respostas, integração CRM

## 🐳 Docker Compose - Comandos Úteis

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f adminer

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Rebuild de um serviço específico
docker-compose up --build backend

# Reiniciar um serviço
docker-compose restart backend

# Ver status dos serviços
docker-compose ps

# Acessar terminal de um container
docker-compose exec backend bash
docker-compose exec db psql -U postgres -d bna
```

## Deploy (visão geral)
- Backend: Uvicorn/Gunicorn atrás de Nginx
- DB: Postgres gerenciado ou container dedicado com backup automático
- Frontend: build do Vite servido por CDN/Nginx
- Adminer: Opcional em produção (remover em ambientes sensíveis)
- Variáveis de ambiente configuradas no ambiente de produção
- Volumes persistentes para dados do PostgreSQL

## 🔒 Segurança em Produção

**Importante antes de fazer deploy:**
1. ✅ Altere a `SECRET_KEY` no `.env`
2. ✅ Use senhas fortes para o PostgreSQL
3. ✅ Configure CORS adequadamente
4. ✅ Remova ou proteja o Adminer em produção
5. ✅ Use HTTPS (SSL/TLS)
6. ✅ Configure backup automático do banco de dados

Para o roteiro de entrevista, veja `PRESENTATION.md`.
