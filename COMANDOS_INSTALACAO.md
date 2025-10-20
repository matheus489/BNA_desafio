# ⚡ COMANDOS DE INSTALAÇÃO E VERIFICAÇÃO

## 🚀 Setup Completo em 5 Minutos

### Passo 1: Instalar Dependências do Frontend (2 min)

```bash
cd frontend
npm install
```

**Dependências instaladas:**
- `@dnd-kit/core@^6.1.0` (drag-and-drop)
- `@dnd-kit/sortable@^8.0.0` (sortable)
- `recharts@^2.10.3` (gráficos)

**Verificação:**
```bash
npm list @dnd-kit/core @dnd-kit/sortable recharts
```

---

### Passo 2: Migration do Banco de Dados (1 min)

```bash
# Volte para raiz do projeto
cd ..

# Execute migration
docker-compose exec db psql -U postgres -d bna -c "ALTER TABLE page_analyses ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'lead' NOT NULL;"
```

**Saída esperada:**
```
ALTER TABLE
```

**Verificação:**
```bash
docker-compose exec db psql -U postgres -d bna -c "\d page_analyses" | findstr stage
```

**Saída esperada:**
```
stage | character varying(50) | | not null | 'lead'::character varying
```

---

### Passo 3: Reiniciar Serviços (1 min)

```bash
docker-compose restart backend frontend
```

**Saída esperada:**
```
[+] Restarting 2/2
 ✔ Container bna-backend-1  Started
 ✔ Container bna-frontend-1 Started
```

**Aguarde 10 segundos para serviços iniciarem:**
```bash
timeout /t 10 /nobreak
```

---

### Passo 4: Verificar Logs (1 min)

```bash
# Backend
docker-compose logs --tail=10 backend
```

**Procure por:**
```
✅ "INFO:     Application startup complete."
✅ "INFO:     Uvicorn running on http://0.0.0.0:8000"
❌ Nenhum traceback ou erro
```

```bash
# Frontend
docker-compose logs --tail=10 frontend
```

**Procure por:**
```
✅ "VITE ... ready in ... ms"
✅ "Local:   http://localhost:5173/"
❌ Nenhum erro de compilação
```

---

### Passo 5: Teste de Saúde (30 segundos)

```bash
# Health check backend
Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Saída esperada:**
```json
{"status":"ok"}
```

```bash
# Frontend acessível
Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing | Select-Object StatusCode
```

**Saída esperada:**
```
StatusCode
----------
       200
```

---

## ✅ VERIFICAÇÃO COMPLETA DAS FEATURES

### Feature 1: Enriquecimento Multi-Fonte

```bash
# Registre usuário (se ainda não tem)
$body = @{
    email = "teste@bna.dev"
    password = "senha123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:8000/auth/register -Method POST -Body $body -ContentType "application/json" -UseBasicParsing

# Login
$loginBody = @{
    username = "teste@bna.dev"
    password = "senha123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:8000/auth/login -Method POST -Body "username=teste@bna.dev&password=senha123" -ContentType "application/x-www-form-urlencoded" -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).access_token

# Criar análise
$analyzeBody = @{ url = "https://openai.com" } | ConvertTo-Json
$headers = @{ Authorization = "Bearer $token" }

$analysisResponse = Invoke-WebRequest -Uri http://localhost:8000/analyze -Method POST -Body $analyzeBody -ContentType "application/json" -Headers $headers -UseBasicParsing
$analysisId = ($analysisResponse.Content | ConvertFrom-Json).id

# Enriquecer
Invoke-WebRequest -Uri "http://localhost:8000/enrichment/analyze/$analysisId" -Method POST -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

**Resultado esperado:**
```json
{
  "status": "success",
  "analysis_id": 1,
  "sources_enriched": 1-5,
  "enriched_data": {
    "raw_data": {...},
    "synthesized": {
      "company_overview": "...",
      "tech_stack": [...],
      "key_insights": [...]
    }
  }
}
```

---

### Feature 2: Dashboard

```bash
# Testar dashboard
Invoke-WebRequest -Uri http://localhost:8000/dashboard -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

**Resultado esperado:**
```json
{
  "kpis": {
    "total_leads": 1,
    "hot_leads": 0,
    "analyses_this_month": 1,
    "avg_deal_score": 75
  },
  "ai_insights": [...],
  "pipeline_distribution": [...],
  "recent_activity": [...],
  "trends": {...},
  "top_leads": [...]
}
```

---

### Feature 3: Kanban

```bash
# Pipeline
Invoke-WebRequest -Uri http://localhost:8000/kanban/pipeline -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

# Mover para qualified
$stageBody = @{ stage = "qualified" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/kanban/analysis/$analysisId/stage" -Method PATCH -Body $stageBody -ContentType "application/json" -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

**Resultado esperado:**
```json
{
  "status": "success",
  "old_stage": "lead",
  "new_stage": "qualified",
  "suggestion": [
    "📞 Agendar call de discovery",
    "📊 Preparar análise de ROI personalizada",
    ...
  ]
}
```

---

### Feature 4: Dark Mode (Frontend)

**Acesse:** http://localhost:5173/settings

**Teste:**
1. Clique no botão flutuante 🌙 (canto inferior direito)
2. Selecione "Light Mode" → página fica clara
3. Selecione "High Contrast" → contraste alto
4. Volte para "Dark Mode"
5. Acesse `/settings`
6. Clique em preset "Ocean" → cores mudam para azul
7. Clique em preset "Sunset" → cores mudam para laranja
8. Customize cor primária manualmente
9. Recarregue a página → tema persiste (localStorage)

---

## 🔍 TROUBLESHOOTING

### Erro: "column stage does not exist"
```bash
# Execute migration novamente
docker-compose exec db psql -U postgres -d bna -c "ALTER TABLE page_analyses ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'lead' NOT NULL;"

# Restart backend
docker-compose restart backend
```

### Erro: "Module not found: recharts"
```bash
cd frontend
npm install recharts @dnd-kit/core @dnd-kit/sortable
```

### Erro: "Cannot find module ThemeContext"
```bash
# Verifique se o arquivo existe
ls frontend/src/contexts/ThemeContext.tsx

# Se não existe, foi criado corretamente - restart do frontend
docker-compose restart frontend
```

### Frontend não compila
```bash
# Limpe cache e reinstale
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend não inicia
```bash
# Verifique logs
docker-compose logs backend

# Se tiver erro de import, restart
docker-compose restart backend
```

---

## 📊 VERIFICAÇÃO FINAL - CHECKLIST

Execute este checklist completo:

### Backend:
```bash
# 1. Health check
Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing

# 2. Docs
Invoke-WebRequest -Uri http://localhost:8000/docs -UseBasicParsing

# 3. Novo endpoint - dashboard
Invoke-WebRequest -Uri http://localhost:8000/dashboard -Headers $headers -UseBasicParsing

# 4. Novo endpoint - kanban
Invoke-WebRequest -Uri http://localhost:8000/kanban/pipeline -Headers $headers -UseBasicParsing

# 5. Novo endpoint - enrichment
Invoke-WebRequest -Uri http://localhost:8000/enrichment/status/1 -Headers $headers -UseBasicParsing
```

### Frontend:
```bash
# 1. Home
start http://localhost:5173

# 2. Dashboard
start http://localhost:5173/dashboard

# 3. Kanban
start http://localhost:5173/kanban

# 4. Settings
start http://localhost:5173/settings
```

### Funcionalidades:
- [ ] Dashboard carrega sem erros
- [ ] Gráficos (Recharts) aparecem
- [ ] KPIs exibem números
- [ ] Insights de IA visíveis
- [ ] Kanban mostra colunas
- [ ] Drag-and-drop funciona
- [ ] Botão de tema flutuante aparece
- [ ] Temas mudam ao clicar
- [ ] Settings page acessível
- [ ] Presets de cor funcionam

---

## 🎉 SUCESSO!

Se todos os itens acima passarem:
- ✅ **Sistema 100% funcional**
- ✅ **4 features completas**
- ✅ **Pronto para demo**

---

## 📞 COMANDO DE EMERGÊNCIA

Se algo der errado, reset completo:

```bash
# Stop tudo
docker-compose down

# Limpa volumes (CUIDADO: apaga dados)
docker-compose down -v

# Rebuild completo
docker-compose up --build -d

# Aguarde 30 segundos
timeout /t 30 /nobreak

# Recrie usuário e teste
```

---

**Última atualização:** 19/10/2025  
**Status:** ✅ Pronto para usar!

