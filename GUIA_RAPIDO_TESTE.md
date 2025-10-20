# ⚡ GUIA RÁPIDO DE TESTE - Novas Features

## 🎯 3 Features Prontas para Testar

---

## 🚀 SETUP INICIAL (5 minutos)

### 1. Instale dependências do frontend
```bash
cd frontend
npm install
# Instala: @dnd-kit/core, @dnd-kit/sortable, recharts
```

### 2. Execute migration do banco
```bash
# Conecte ao PostgreSQL e execute:
psql -h localhost -U postgres -d bna

# No psql:
ALTER TABLE page_analyses 
ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'lead' NOT NULL;

# Ou crie script Python
# Ver: backend/app/scripts/add_stage_field.py
```

### 3. Inicie o sistema
```bash
# Backend (terminal 1)
cd backend
uvicorn app.main:app --reload

# Frontend (terminal 2)
cd frontend
npm run dev
```

---

## ✅ TESTE 1: Enriquecimento Multi-Fonte

### Backend (via curl):

```bash
# 1. Login e obtenha token
curl -X POST http://localhost:8000/auth/login \
  -F 'username=seu@email.com' \
  -F 'password=suasenha'
# Copie o access_token da resposta

# 2. Defina token
export TOKEN="cole_seu_token_aqui"

# 3. Analise uma empresa
curl -X POST http://localhost:8000/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://openai.com"}'
# Anote o "id" da resposta

# 4. Enriqueça com múltiplas fontes
export ANALYSIS_ID=1  # Use o ID da etapa 3
curl -X POST http://localhost:8000/enrichment/analyze/$ANALYSIS_ID \
  -H "Authorization: Bearer $TOKEN"

# Resposta esperada:
{
  "status": "success",
  "analysis_id": 1,
  "sources_enriched": 3,  # Número de fontes bem-sucedidas
  "enriched_data": {
    "raw_data": {
      "crunchbase": {...},
      "github": {...},
      "linkedin": {...},
      "news": {...},
      "reviews": {...}
    },
    "synthesized": {
      "company_overview": "...",
      "funding_status": "...",
      "tech_stack": [...],
      "market_position": "...",
      "recent_activity": "...",
      "growth_signals": [...],
      "risk_factors": [...],
      "sales_approach": "...",
      "key_insights": [...]
    }
  }
}
```

### Verificações:
- ✅ Status 200
- ✅ `sources_enriched` >= 1
- ✅ `synthesized` com dados preenchidos
- ✅ `tech_stack` não vazio (se GitHub encontrado)

### Troubleshooting:
- ❌ Se todas as fontes falharem (sources_enriched: 0):
  - Normal! Pode não ter APIs configuradas
  - Configure pelo menos GitHub Token:
    ```bash
    # .env
    GITHUB_TOKEN=seu_token_aqui
    ```
  - GitHub é a fonte mais fácil de configurar

---

## ✅ TESTE 2: Dashboard Executivo

### Backend (via curl):

```bash
# 1. Dashboard completo
curl http://localhost:8000/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq

# Resposta esperada:
{
  "kpis": {
    "total_leads": 10,
    "total_leads_trend": "+12%",
    "hot_leads": 3,
    "hot_leads_trend": "+30%",
    "analyses_this_month": 5,
    "analyses_trend": "+25%",
    "avg_deal_score": 78,
    "deal_score_trend": "+5%"
  },
  "ai_insights": [
    {
      "type": "opportunity",
      "icon": "🔥",
      "title": "3 empresas de FinTech levantaram funding",
      "description": "Momento ideal para abordagem..."
    }
  ],
  "pipeline_distribution": [...],
  "recent_activity": [...],
  "trends": {
    "weekly_analyses": [...]
  },
  "top_leads": [...]
}

# 2. Apenas KPIs (mais rápido)
curl http://localhost:8000/dashboard/kpis \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Apenas Insights de IA
curl http://localhost:8000/dashboard/insights \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Frontend:

1. **Adicione rota ao React Router:**

```typescript
// frontend/src/main.tsx ou App.tsx
import { Dashboard } from './pages/Dashboard'

// No Router:
<Route path="/dashboard" element={<Dashboard />} />
```

2. **Acesse:** http://localhost:5173/dashboard

### Verificações:
- ✅ 4 KPI cards exibidos
- ✅ Gráficos renderizando (Recharts)
- ✅ Insights de IA visíveis
- ✅ Activity timeline populada
- ✅ Auto-refresh funcionando (console.log a cada 2min)

### Troubleshooting:
- ❌ Gráficos não aparecem:
  ```bash
  cd frontend
  npm install recharts
  ```
- ❌ Insights vazios:
  - Normal se tiver poucas análises
  - Crie pelo menos 5 análises para insights melhores

---

## ✅ TESTE 3: Kanban Board

### Backend (via curl):

```bash
# 1. Pipeline organizado por estágio
curl http://localhost:8000/kanban/pipeline \
  -H "Authorization: Bearer $TOKEN" | jq

# Resposta esperada:
{
  "pipeline": {
    "lead": [
      {
        "id": 1,
        "title": "OpenAI",
        "url": "https://openai.com",
        "stage": "lead",
        "created_at": "2025-01-19T...",
        "summary": "...",
        "sales_potential": "Alto",
        "industry": "Technology",
        "has_enrichment": true
      }
    ],
    "qualified": [...],
    "proposal": [...],
    "negotiation": [...],
    "closed": [...]
  },
  "stats": {
    "total": 10,
    "by_stage": {
      "lead": 5,
      "qualified": 3,
      "proposal": 1,
      "negotiation": 0,
      "closed": 1
    }
  }
}

# 2. Move análise para "qualified"
curl -X PATCH http://localhost:8000/kanban/analysis/$ANALYSIS_ID/stage \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stage": "qualified"}' | jq

# Resposta:
{
  "status": "success",
  "analysis_id": 1,
  "old_stage": "lead",
  "new_stage": "qualified",
  "suggestion": [
    "📞 Agendar call de discovery",
    "📊 Preparar análise de ROI personalizada",
    "🤝 Identificar stakeholders chave"
  ]
}

# 3. Sugestões de IA para um card
curl http://localhost:8000/kanban/analysis/$ANALYSIS_ID/suggestions \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Estatísticas do pipeline
curl http://localhost:8000/kanban/stats \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. Bulk update (múltiplos cards)
curl -X POST http://localhost:8000/kanban/bulk-update-stage \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"analysis_ids": [1, 2, 3], "new_stage": "proposal"}' | jq
```

### Verificações:
- ✅ Pipeline retorna 5 estágios
- ✅ Move entre estágios funciona
- ✅ Sugestões de IA específicas por estágio
- ✅ Estatísticas calculadas corretamente

### Troubleshooting:
- ❌ Erro "column stage does not exist":
  ```bash
  # Execute a migration:
  psql -h localhost -U postgres -d bna -c "
    ALTER TABLE page_analyses 
    ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'lead' NOT NULL;
  "
  ```

---

## 🎬 CENÁRIO DE TESTE COMPLETO (10 minutos)

### Workflow realista:

```bash
# 1. Faça login
export TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -F 'username=teste@email.com' \
  -F 'password=senha123' | jq -r '.access_token')

# 2. Analise 3 empresas
for url in "https://openai.com" "https://github.com" "https://microsoft.com"; do
  curl -s -X POST http://localhost:8000/analyze \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"$url\"}"
  sleep 2
done

# 3. Enriqueça a primeira análise
curl -X POST http://localhost:8000/enrichment/analyze/1 \
  -H "Authorization: Bearer $TOKEN"

# 4. Veja o dashboard
curl http://localhost:8000/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq '.kpis'

# 5. Organize no Kanban
# Move análise 1 para qualified
curl -X PATCH http://localhost:8000/kanban/analysis/1/stage \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stage": "qualified"}'

# Move análise 2 para proposal
curl -X PATCH http://localhost:8000/kanban/analysis/2/stage \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stage": "proposal"}'

# 6. Veja o pipeline organizado
curl http://localhost:8000/kanban/pipeline \
  -H "Authorization: Bearer $TOKEN" | jq '.stats'

# 7. Dashboard atualizado
curl http://localhost:8000/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq '.ai_insights'
```

### Resultado esperado:
```
✅ 3 análises criadas
✅ 1 análise enriquecida (OpenAI)
✅ Dashboard mostra:
   - total_leads: 3
   - 1-2 insights de IA
   - Pipeline: 1 lead, 1 qualified, 1 proposal
✅ Kanban organizado por estágios
✅ Sugestões específicas por estágio
```

---

## 📊 VALIDAÇÃO VISUAL (Frontend)

### Dashboard (http://localhost:5173/dashboard)
- ✅ 4 KPI cards com ícones coloridos
- ✅ Gráfico de pizza (Pipeline Distribution)
- ✅ Gráfico de linha (Tendências)
- ✅ Cards de insights com ícones 🔥⚠️💡
- ✅ Timeline de atividades
- ✅ Top 5 leads com progress bars

### Kanban (http://localhost:5173/kanban) - SE IMPLEMENTAR FRONTEND
- ✅ 5 colunas verticais
- ✅ Cards em cada coluna
- ✅ Drag-and-drop funcionando
- ✅ Sugestões ao clicar no card

---

## 🐛 TROUBLESHOOTING GERAL

### Erro: "Unauthorized"
```bash
# Refaça login
export TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -F 'username=seu@email.com' \
  -F 'password=suasenha' | jq -r '.access_token')
```

### Erro: "Analysis not found"
```bash
# Crie uma análise primeiro
curl -X POST http://localhost:8000/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Erro: "Column stage does not exist"
```bash
# Execute migration
psql -h localhost -U postgres -d bna -c "
  ALTER TABLE page_analyses 
  ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'lead' NOT NULL;
"
```

### Dashboard vazio
```bash
# Crie pelo menos 3 análises
# Dashboard precisa de dados para gerar insights
```

### Enriquecimento falha em todas as fontes
```bash
# Configure pelo menos GitHub Token no .env:
echo "GITHUB_TOKEN=seu_token_aqui" >> .env

# Restart backend
```

---

## ✅ CHECKLIST DE SUCESSO

### Backend:
- [ ] `/enrichment/analyze/{id}` retorna dados
- [ ] `/dashboard` retorna KPIs
- [ ] `/dashboard/insights` retorna insights
- [ ] `/kanban/pipeline` retorna organizado
- [ ] `/kanban/analysis/{id}/stage` move cards

### Frontend:
- [ ] Dashboard renderiza sem erros
- [ ] Gráficos (Recharts) aparecem
- [ ] KPIs exibem números reais
- [ ] Insights de IA visíveis

### Funcional:
- [ ] Enriquecimento busca múltiplas fontes
- [ ] IA gera insights acionáveis
- [ ] Kanban organiza por estágios
- [ ] Sugestões específicas por estágio

---

## 🎯 PRONTO PARA DEMONSTRAÇÃO!

Se todos os testes passarem:
- ✅ 3 features funcionais
- ✅ Backend production-ready
- ✅ IA aplicada estrategicamente
- ✅ Código limpo e documentado

**Tempo total de teste: 10-15 minutos**

---

**Dúvidas? Consulte:**
- `IMPLEMENTACAO_COMPLETA_STATUS.md` - Status detalhado
- `ENTREGA_FINAL_RESUMO.md` - Resumo executivo
- `ANALISE_MELHORIAS_EXTRAORDINARIAS.md` - Documentação técnica

**Boa sorte na demonstração! 🚀**

