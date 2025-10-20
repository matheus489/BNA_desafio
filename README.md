# bna.dev – Plataforma de Inteligência para Vendas

Solução completa com RAG e IA para coletar, resumir e estruturar informações de páginas web, apoiando o time de vendas antes de reuniões.

---

## 🎯 **DESTAQUE: Features que Surpreendem**

> **80% IA, 20% humano = 100% resultado** - Implementado em código!


### **💪 Simulador de Objeções com IA** ⭐ NOVO
Treine vendedores com IA gerando objeções contextualizadas:
- 🎮 Gamificação com scores (0-100) e grades (A+ a F)
- 🎯 3 níveis: Fácil, Médio, Difícil
- 🤖 Avaliação automática com feedback detalhado
- 📊 Estatísticas de progresso e evolução
- 💡 Objeções específicas por empresa analisada

**Acesse**: `/training` após login | **[Ver Demo](ROTEIRO_APRESENTACAO.md)**

---

## 🚀 **Features Principais**

### **🤖 Chat RAG com Web Search Automático**
**Chat RAG (Retrieval-Augmented Generation)** que combina:
- 🔍 **Busca vetorial** no histórico de análises (embeddings semânticos)
- 🌐 **Web Search automático** em tempo real (Google/DuckDuckGo)
- 🤖 **GPT-4** para respostas contextualizadas e inteligentes
- 💬 **Interface de chat** moderna e interativa

**Exemplos**: "Qual o stack tecnológico da empresa X?" | "Quais empresas de IA já analisei?"

### **🔄 Comparação Inteligente entre Empresas**
Selecione 2-5 empresas analisadas e receba:
- ⚖️ **Comparação lado a lado** de stack, pricing e ICP
- 🏆 **Ranking de prioridade** gerado por IA
- 💡 **Oportunidades únicas** de cada empresa
- 🎯 **Estratégia de abordagem** para o lead mais promissor

### **📊 Análise de Sites com IA**
- Scraping inteligente e extração de conteúdo
- Análise focada em vendas B2B (ICP, produtos, pricing, stack)
- Cache por URL (nunca reprocessa a mesma empresa)
- Exportação CSV para Google Sheets

### **📝 Relatórios Detalhados**
Gere relatórios executivos expandidos com insights profundos de mercado, oportunidades e estratégias de abordagem.

### **🌐 Enriquecimento Multi-Fonte** ⭐ NOVO
Sistema automático que busca dados de múltiplas fontes para criar perfil 360° da empresa:
- 📊 **Crunchbase**: Funding, investimentos, valuation
- 💻 **GitHub**: Tech stack real, atividade open-source
- 👔 **LinkedIn**: Company data, headcount
- 📰 **News API**: Notícias recentes e menções na mídia
- ⭐ **G2/Capterra**: Reviews e ratings de produtos
- 🤖 **Síntese por IA**: LLM consolida tudo em perfil executivo unificado

**Como usar**: POST `/enrichment/analyze/{analysis_id}` | Economiza 30-45min de research manual

### **📊 Dashboard Executivo com IA** ⭐ NOVO
Visão consolidada em tempo real com insights gerados por IA:
- 📈 **4 KPIs principais** com trends (Total Leads, Hot Leads, Análises/mês, Deal Score)
- 🤖 **Insights de IA automáticos** (3-4 insights acionáveis baseados nos dados)
- 📊 **Pipeline distribution** (visualização em pizza chart)
- 📈 **Tendências semanais** (gráfico de linha das últimas 8 semanas)
- 🏆 **Top 5 leads da semana** com scoring automático
- 📋 **Activity timeline** (últimas 15 atividades)
- 🔄 **Auto-refresh** a cada 2 minutos

**Como usar**: GET `/dashboard` | Frontend: `<Dashboard />` component

### **📋 Kanban Board para Pipeline** ⭐ NOVO
Gestão visual de pipeline de vendas com drag-and-drop:
- 🎯 **5 estágios**: Lead → Qualificado → Proposta → Negociação → Fechado
- 🖱️ **Drag-and-drop** para mover leads entre estágios
- 🤖 **Sugestões de IA** por estágio (próximas ações recomendadas)
- 📊 **Estatísticas do pipeline** (conversão por estágio, tempo médio)
- 🔄 **Bulk update** (atualiza múltiplos leads de uma vez)

**Como usar**: GET `/kanban/pipeline` | PATCH `/kanban/analysis/{id}/stage`

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

## 🌐 Deploy em Produção

### 📚 Guias de Deploy Disponíveis

**Para hospedar o site:**
- 📖 **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - Deploy em 5 minutos (Railway ou Render)
- 📖 **[DEPLOY.md](DEPLOY.md)** - Guia completo para todas as plataformas

### 🚀 Deploy Rápido (Railway - Recomendado)

```bash
# 1. Fazer commit das mudanças
.\deploy.ps1  # Windows
# ou
./deploy.sh   # Linux/Mac

# 2. Acessar Railway
# https://railway.app

# 3. Deploy from GitHub repo
# Selecione o repositório BNA

# 4. Configure variáveis de ambiente
# OPENAI_API_KEY, SECRET_KEY, etc.

# Pronto! 🎉
```

### 🏢 Plataformas Suportadas

| Plataforma | Grátis | Facilidade | Docker | Recomendação |
|------------|--------|-----------|---------|--------------|
| Railway | ✅ ($5/mês) | ⭐⭐⭐⭐⭐ | ✅ | **Melhor para iniciar** |
| Render | ✅ | ⭐⭐⭐⭐ | ✅ | Alternativa grátis |
| Fly.io | ✅ | ⭐⭐⭐ | ✅ | Requer CLI |
| DigitalOcean | ❌ ($5+) | ⭐⭐⭐⭐ | ✅ | Produção |

### 🔒 Segurança em Produção

**Importante antes de fazer deploy:**
1. ✅ Altere a `SECRET_KEY` no `.env` (use: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
2. ✅ Use senhas fortes para o PostgreSQL
3. ✅ Configure CORS adequadamente para seu domínio
4. ✅ Remova ou proteja o Adminer em produção
5. ✅ Use HTTPS (SSL/TLS) - configurado automaticamente nas plataformas
6. ✅ Configure backup automático do banco de dados
7. ✅ Adicione rate limiting nas APIs
8. ✅ Monitore logs e erros

### 📊 Arquitetura em Produção
- **Backend:** FastAPI + Uvicorn (containerizado)
- **Database:** PostgreSQL gerenciado
- **Frontend:** Build estático do Vite (CDN/Nginx)
- **Storage:** Volumes persistentes para dados
- **SSL/TLS:** Certificados automáticos (Let's Encrypt)
- **Monitoring:** Logs centralizados + health checks

### 💰 Custos Estimados

**Desenvolvimento/MVP:**
- Railway: $0-5/mês (crédito grátis)
- Render: $0/mês (free tier)
- OpenAI API: ~$5-20/mês (uso normal)

**Produção (tráfego médio):**
- Hospedagem: $10-25/mês
- Database: $7-15/mês
- OpenAI API: $50-200/mês
- Total: **$70-240/mês**

---

## 📚 Documentação Completa

### Para Desenvolvimento
- **[RESUMO_TECNICO.md](RESUMO_TECNICO.md)** - Arquitetura detalhada, modelo de dados, endpoints
- **[README.md](README.md)** - Este arquivo (setup e uso básico)

### Para Apresentação
- **[IMPLEMENTACAO_COMPLETA.md](IMPLEMENTACAO_COMPLETA.md)** - Resumo executivo de tudo que foi entregue ⭐
- **[ROTEIRO_APRESENTACAO.md](ROTEIRO_APRESENTACAO.md)** - Script completo de apresentação (30min) ⭐
- **[NOVAS_FEATURES.md](NOVAS_FEATURES.md)** - Documentação técnica das 2 features novas ⭐

### Para Instalação
- **[chrome-extension/COMO_INSTALAR.md](chrome-extension/COMO_INSTALAR.md)** - Guia de instalação da extensão
- **[chrome-extension/README.md](chrome-extension/README.md)** - Documentação técnica da extensão

### Início Rápido
1. Leia **[IMPLEMENTACAO_COMPLETA.md](IMPLEMENTACAO_COMPLETA.md)** para visão geral
2. Siga **[ROTEIRO_APRESENTACAO.md](ROTEIRO_APRESENTACAO.md)** para preparar apresentação
3. Instale extensão com **[COMO_INSTALAR.md](chrome-extension/COMO_INSTALAR.md)**
4. Execute os testes descritos em **[NOVAS_FEATURES.md](NOVAS_FEATURES.md)**

---

## 🎯 Case BNA - Status

✅ **Requisitos Básicos**: 100% Completo
- [x] API que recebe links e retorna informações
- [x] Cache em DB (não rescrapeia)
- [x] UI para equipe de vendas
- [x] Autenticação na UI

🚀 **Além do Esperado**: 2 Features Revolucionárias
- [x] **Chrome Extension** - Análise com 1 clique do navegador
- [x] **Simulador de Objeções** - Treinamento gamificado com IA
- [x] Chat RAG com busca vetorial
- [x] Comparação de empresas
- [x] Relatórios detalhados
- [x] Exportação CSV/Sheets
- [x] Interface Admin
- [x] Docker Compose completo

📊 **Resultado**: Não é uma API. É uma **plataforma completa** de inteligência para vendas.

---

**Desenvolvido com** ❤️ **para BNA.dev**
> "80% IA, 20% humano = 100% resultado" - Implementado em código!
