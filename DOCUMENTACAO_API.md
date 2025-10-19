# 📡 DOCUMENTAÇÃO DA API - BNA.DEV

## 🎯 **VISÃO GERAL**

A API do BNA.dev é construída com **FastAPI** e oferece endpoints RESTful para análise de empresas, chat inteligente, treinamento de objeções e gerenciamento de usuários.

**Base URL:** `http://localhost:8000`  
**Documentação Interativa:** `http://localhost:8000/docs`  
**ReDoc:** `http://localhost:8000/redoc`

---

## 🔐 **AUTENTICAÇÃO**

### **JWT Token**
Todos os endpoints protegidos requerem um token JWT no header:
```http
Authorization: Bearer <seu_token_jwt>
```

### **Obter Token**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "role": "user"
  }
}
```

---

## 📊 **ENDPOINTS PRINCIPAIS**

### **1. 🔍 ANÁLISE DE EMPRESAS**

#### **Analisar URL**
```http
POST /analyze/
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://exemplo.com"
}
```

**Resposta:**
```json
{
  "id": 123,
  "url": "https://exemplo.com",
  "title": "Empresa Exemplo",
  "summary": "## RESUMO EXECUTIVO\nEmpresa de tecnologia...",
  "key_points": [
    "🎯 ICP: Startup de tecnologia",
    "🛍️ Produtos: SaaS para PMEs",
    "💰 Pricing: $99/mês"
  ],
  "entities": {
    "company_name": "Empresa Exemplo",
    "industry": "Tecnologia",
    "company_size": "Startup",
    "products": ["SaaS", "API"],
    "pricing_model": "Subscription",
    "tech_stack": ["React", "Node.js", "AWS"],
    "contacts": ["CEO", "CTO"],
    "market_position": "Emergente",
    "growth_stage": "Startup",
    "sales_potential": "Alto",
    "decision_makers": ["CEO", "CTO"],
    "pain_points": ["Escalabilidade", "Automação"],
    "competitors": ["Concorrente A", "Concorrente B"],
    "partnership_potential": "Alto"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### **Comparar Análises**
```http
POST /analyze/compare
Authorization: Bearer <token>
Content-Type: application/json

{
  "analysis_ids": [123, 456, 789]
}
```

**Resposta:**
```json
{
  "comparison": "## Comparação de Empresas\n\n### Empresa A vs Empresa B...",
  "similarities": ["Ambas são startups", "Mesmo setor"],
  "differences": ["Diferentes modelos de preço", "Stack tecnológico diferente"],
  "recommendations": ["Abordar com foco em escalabilidade", "Destacar diferenciais"]
}
```

### **2. 💬 CHAT RAG**

#### **Enviar Mensagem**
```http
POST /chat/
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Quais são as melhores empresas para abordar?",
  "use_web_search": true,
  "max_history": 10
}
```

**Resposta:**
```json
{
  "message": "Com base nas análises disponíveis, as **melhores empresas** para abordar são:\n\n### 🏆 Top 3 Empresas\n\n1. **Empresa A** - Score: 9/10\n   - **Potencial de Vendas:** Alto\n   - **Budget:** $50k-100k\n   - **Timing:** Urgente\n\n2. **Empresa B** - Score: 8/10\n   - **Potencial de Vendas:** Alto\n   - **Budget:** $30k-80k\n   - **Timing:** Médio\n\n### 🎯 Estratégia Recomendada\n- Abordar **Empresa A** primeiro (maior urgência)\n- Focar em **escalabilidade** e **automação**\n- Envolver **CEO** e **CTO** na conversa",
  "sources": [
    {
      "type": "database",
      "title": "Análise - Empresa A",
      "url": "https://empresa-a.com",
      "snippet": "Startup de tecnologia com foco em SaaS..."
    },
    {
      "type": "web",
      "title": "Tendências do Mercado SaaS 2024",
      "url": "https://exemplo.com/trends",
      "snippet": "O mercado SaaS está em crescimento..."
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### **Histórico do Chat**
```http
GET /chat/history?limit=50
Authorization: Bearer <token>
```

**Resposta:**
```json
[
  {
    "id": 1,
    "role": "user",
    "content": "Quais são as melhores empresas?",
    "sources": null,
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "role": "assistant",
    "content": "Com base nas análises...",
    "sources": [
      {
        "type": "database",
        "title": "Análise - Empresa A",
        "url": "https://empresa-a.com",
        "snippet": "Startup de tecnologia..."
      }
    ],
    "created_at": "2024-01-15T10:30:05Z"
  }
]
```

#### **Limpar Histórico**
```http
DELETE /chat/history
Authorization: Bearer <token>
```

### **3. 🎯 SIMULADOR DE OBJEÇÕES**

#### **Gerar Objeções**
```http
POST /training/generate-objections
Authorization: Bearer <token>
Content-Type: application/json

{
  "analysis_id": 123,
  "difficulty": "medium"
}
```

**Resposta:**
```json
{
  "objections": [
    {
      "id": 1,
      "objection": "O preço está muito alto para nosso orçamento",
      "type": "Preço",
      "difficulty": "medium",
      "hint": "Foque no ROI e valor a longo prazo",
      "suggested_response": "Entendo sua preocupação com o investimento. Vamos analisar o ROI...",
      "context": "Empresa startup com orçamento limitado"
    },
    {
      "id": 2,
      "objection": "Não temos tempo para implementar agora",
      "type": "Timing",
      "difficulty": "medium",
      "hint": "Mostre como pode economizar tempo",
      "suggested_response": "Compreendo a pressão de tempo. Nossa solução na verdade economiza tempo...",
      "context": "Equipe sobrecarregada com projetos"
    }
  ]
}
```

#### **Submeter Resposta**
```http
POST /training/submit-response
Authorization: Bearer <token>
Content-Type: application/json

{
  "objection_id": 1,
  "user_response": "Nosso produto oferece ROI em 3 meses..."
}
```

**Resposta:**
```json
{
  "score": 85,
  "feedback": "## Avaliação da Resposta\n\n### ✅ Pontos Fortes\n- **ROI específico** (3 meses) é convincente\n- **Dados concretos** aumentam credibilidade\n- **Tom profissional** mantém a conversa\n\n### 🔄 Melhorias Sugeridas\n- Adicione **casos de sucesso** similares\n- Mencione **garantia** ou **período de teste**\n- Inclua **métricas** de economia de tempo\n\n### 🎯 Próximos Passos\n1. **Agende demonstração** para mostrar o ROI\n2. **Prepare casos de sucesso** de empresas similares\n3. **Ofereça período de teste** gratuito\n\n**Score: 85/100** - Excelente resposta!",
  "suggestions": [
    "Adicione casos de sucesso similares",
    "Mencione garantia ou período de teste",
    "Inclua métricas de economia de tempo"
  ]
}
```

#### **Estatísticas de Treinamento**
```http
GET /training/stats
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "total_sessions": 25,
  "average_score": 78.5,
  "best_score": 95,
  "improvement_trend": "positive",
  "sessions_by_difficulty": {
    "easy": 10,
    "medium": 12,
    "hard": 3
  },
  "sessions_by_type": {
    "Preço": 8,
    "Timing": 7,
    "Autoridade": 5,
    "Necessidade": 5
  },
  "recent_sessions": [
    {
      "id": 25,
      "score": 85,
      "objection_type": "Preço",
      "difficulty": "medium",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### **4. 📊 HISTÓRICO E RELATÓRIOS**

#### **Listar Análises**
```http
GET /history/?limit=20&offset=0
Authorization: Bearer <token>
```

**Resposta:**
```json
[
  {
    "id": 123,
    "url": "https://exemplo.com",
    "title": "Empresa Exemplo",
    "summary": "## RESUMO EXECUTIVO\nEmpresa de tecnologia...",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### **Obter Análise Específica**
```http
GET /history/123
Authorization: Bearer <token>
```

#### **Excluir Análise**
```http
DELETE /history/123
Authorization: Bearer <token>
```

### **5. ⚙️ ADMINISTRAÇÃO**

#### **Estatísticas Gerais**
```http
GET /admin/stats
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "total_users": 150,
  "total_analyses": 1250,
  "total_training_sessions": 500,
  "active_users_today": 25,
  "analyses_today": 15,
  "average_analysis_time": 45.5,
  "top_analyzed_domains": [
    "exemplo.com",
    "empresa.com",
    "startup.com"
  ],
  "user_growth": {
    "last_7_days": 12,
    "last_30_days": 45
  }
}
```

#### **Listar Usuários**
```http
GET /admin/users?limit=20&offset=0
Authorization: Bearer <token>
```

**Resposta:**
```json
[
  {
    "id": 1,
    "email": "usuario@exemplo.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-15T10:30:00Z",
    "analyses_count": 25,
    "training_sessions_count": 10
  }
]
```

#### **Promover Usuário a Admin**
```http
PUT /admin/users/1/promote
Authorization: Bearer <token>
```

#### **Excluir Usuário**
```http
DELETE /admin/users/1
Authorization: Bearer <token>
```

---

## 🔧 **CONFIGURAÇÃO E DEPLOY**

### **Variáveis de Ambiente**

#### **Backend**
```bash
# Database
DATABASE_URL=postgresql://bna:bna123@localhost:5432/bna

# OpenAI
OPENAI_API_KEY=sk-...

# JWT
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://bna.dev
```

### **Docker Compose**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://bna:bna123@db:5432/bna
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: bna
      POSTGRES_USER: bna
      POSTGRES_PASSWORD: bna123
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### **Deploy**
```bash
# Local
docker-compose up -d --build

# Produção
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📝 **CÓDIGOS DE STATUS HTTP**

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Não encontrado |
| 422 | Dados inválidos |
| 500 | Erro interno do servidor |

---

## 🚨 **TRATAMENTO DE ERROS**

### **Formato de Erro**
```json
{
  "detail": "Mensagem de erro específica",
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Erros Comuns**

#### **401 - Não Autorizado**
```json
{
  "detail": "Token JWT inválido ou expirado"
}
```

#### **400 - Dados Inválidos**
```json
{
  "detail": "URL inválida fornecida",
  "error_code": "INVALID_URL"
}
```

#### **422 - Validação**
```json
{
  "detail": [
    {
      "loc": ["body", "url"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 🧪 **TESTES**

### **Teste de Endpoint**
```python
import requests

# Teste de análise
response = requests.post(
    "http://localhost:8000/analyze/",
    json={"url": "https://exemplo.com"},
    headers={"Authorization": "Bearer <token>"}
)

assert response.status_code == 200
data = response.json()
assert "summary" in data
```

### **Teste de Chat**
```python
# Teste de chat
response = requests.post(
    "http://localhost:8000/chat/",
    json={"message": "Olá, como posso ajudar?"},
    headers={"Authorization": "Bearer <token>"}
)

assert response.status_code == 200
data = response.json()
assert "message" in data
```

---

## 📚 **RECURSOS ADICIONAIS**

### **Documentação Interativa**
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### **Health Check**
```http
GET /health
```

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### **Rate Limiting**
- **100 requests/minuto** por usuário
- **1000 requests/hora** por IP
- **Headers de Rate Limit** incluídos nas respostas

---

## 🎯 **EXEMPLOS DE USO**

### **Fluxo Completo de Análise**
```python
import requests

# 1. Login
login_response = requests.post("http://localhost:8000/auth/login", json={
    "email": "usuario@exemplo.com",
    "password": "senha123"
})
token = login_response.json()["access_token"]

# 2. Analisar empresa
analysis_response = requests.post("http://localhost:8000/analyze/", json={
    "url": "https://exemplo.com"
}, headers={"Authorization": f"Bearer {token}"})

analysis = analysis_response.json()
print(f"Análise: {analysis['title']}")

# 3. Chat sobre a análise
chat_response = requests.post("http://localhost:8000/chat/", json={
    "message": f"Quais são os principais pontos da {analysis['title']}?",
    "use_web_search": True
}, headers={"Authorization": f"Bearer {token}"})

chat = chat_response.json()
print(f"Resposta: {chat['message']}")

# 4. Treinar objeções
training_response = requests.post("http://localhost:8000/training/generate-objections", json={
    "analysis_id": analysis["id"],
    "difficulty": "medium"
}, headers={"Authorization": f"Bearer {token}"})

objections = training_response.json()
print(f"Objeções geradas: {len(objections['objections'])}")
```

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Explore a API** - Use a documentação interativa
2. **Teste os Endpoints** - Faça requisições de exemplo
3. **Integre com seu Sistema** - Use os endpoints em sua aplicação
4. **Monitore Performance** - Acompanhe métricas e logs
5. **Contribua** - Sugira melhorias e reporte bugs

**API desenvolvida com ❤️ para revolucionar as vendas B2B! 🚀**
