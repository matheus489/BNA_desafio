# 🚀 Guia de Deploy - BNA.dev

Este guia contém instruções para hospedar o projeto BNA.dev em diferentes plataformas.

## 📋 Pré-requisitos

Antes de fazer o deploy, você precisa:

1. ✅ Código commitado no Git
2. ✅ Conta no GitHub
3. ✅ Chave API da OpenAI
4. ✅ Docker configurado (para algumas plataformas)

---

## 🎯 Opções de Hospedagem Recomendadas

### 1. **Railway** ⭐ RECOMENDADO
- ✅ Suporta Docker Compose nativamente
- ✅ Free tier com $5 de crédito/mês
- ✅ PostgreSQL incluído
- ✅ Deploy automático via Git
- ✅ Configuração mais simples

### 2. **Render**
- ✅ Free tier disponível
- ✅ Suporta Docker
- ✅ PostgreSQL gratuito (com limitações)
- ⚠️ Hiberna após inatividade

### 3. **Fly.io**
- ✅ Free tier generoso
- ✅ Excelente para Docker
- ✅ PostgreSQL incluído
- ⚠️ Requer CLI

### 4. **DigitalOcean App Platform**
- ✅ Muito estável
- ✅ Suporta Docker
- ⚠️ Pago (começa em $5/mês)

---

## 🚂 Deploy no Railway (RECOMENDADO)

### Passo 1: Preparar o Repositório

```bash
# 1. Criar arquivo .gitignore se não existir
echo "node_modules/
__pycache__/
*.pyc
.env
bna_local.db
.vscode/
.cursor/" > .gitignore

# 2. Adicionar e commitar mudanças
git add .
git commit -m "Preparar para deploy no Railway"
git push origin main
```

### Passo 2: Deploy no Railway

1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha o repositório BNA
6. Railway detectará automaticamente o `docker-compose.yml`

### Passo 3: Configurar Variáveis de Ambiente

No painel do Railway, adicione estas variáveis:

**Backend:**
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/bna
SECRET_KEY=seu_secret_key_super_seguro_aqui
OPENAI_API_KEY=sk-sua-chave-openai-aqui
OPENAI_MODEL=gpt-4
CORS_ORIGINS=["https://seu-dominio-frontend.railway.app"]
```

**Frontend:**
```
VITE_API_URL=https://seu-dominio-backend.railway.app
```

### Passo 4: Deploy Automático

- Railway fará deploy automático a cada push no GitHub
- Acesse os logs para verificar o progresso
- URLs públicas serão geradas automaticamente

---

## 🎨 Deploy no Render

### Passo 1: Criar Serviços no Render

1. Acesse: https://render.com
2. Faça login com GitHub
3. Crie 3 serviços:
   - **PostgreSQL Database** (free)
   - **Web Service** para o Backend
   - **Static Site** para o Frontend

### Passo 2: Configurar Backend

1. **New Web Service** → Conecte o repositório
2. Configurações:
   - **Name:** bna-backend
   - **Environment:** Docker
   - **Docker Build Context:** `./backend`
   - **Health Check Path:** `/health`

3. **Variáveis de Ambiente:**
```
DATABASE_URL=(copie do PostgreSQL criado)
SECRET_KEY=seu_secret_key_aqui
OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_MODEL=gpt-4
```

### Passo 3: Configurar Frontend

1. **New Static Site** → Conecte o repositório
2. Configurações:
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`

3. **Variáveis de Ambiente:**
```
VITE_API_URL=https://bna-backend.onrender.com
```

---

## ✈️ Deploy no Fly.io

### Passo 1: Instalar CLI

```bash
# Windows (PowerShell)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# macOS/Linux
curl -L https://fly.io/install.sh | sh
```

### Passo 2: Fazer Login

```bash
fly auth login
```

### Passo 3: Criar Aplicações

```bash
# Backend
cd backend
fly launch --name bna-backend --no-deploy

# Frontend  
cd ../frontend
fly launch --name bna-frontend --no-deploy
```

### Passo 4: Configurar PostgreSQL

```bash
fly postgres create --name bna-db
fly postgres attach --app bna-backend bna-db
```

### Passo 5: Deploy

```bash
# Backend
cd backend
fly deploy

# Frontend
cd ../frontend
fly deploy
```

---

## 🔒 Segurança - Variáveis de Ambiente

**IMPORTANTE:** Nunca commite o arquivo `.env` com suas chaves!

Crie um arquivo `.env.example` para referência:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security
SECRET_KEY=your-secret-key-here

# OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4

# CORS
CORS_ORIGINS=["http://localhost:5173"]
```

---

## 🌐 Configurar Domínio Personalizado

### Railway
1. Vá em **Settings** do serviço
2. Em **Domains** adicione seu domínio
3. Configure DNS:
   - Tipo: CNAME
   - Nome: @
   - Valor: fornecido pelo Railway

### Render
1. Vá em **Settings** do serviço
2. Em **Custom Domain** adicione seu domínio
3. Configure DNS conforme instruções

---

## 📊 Monitoramento

### Logs em Produção

**Railway:**
```bash
# Ver logs em tempo real
railway logs
```

**Render:**
- Acesse o painel do serviço
- Clique em **Logs**

**Fly.io:**
```bash
fly logs
```

---

## 🐛 Troubleshooting

### Problema: Backend não conecta ao banco

**Solução:**
- Verifique se DATABASE_URL está correta
- Certifique-se que o PostgreSQL está rodando
- Verifique logs do banco de dados

### Problema: CORS error no frontend

**Solução:**
- Adicione a URL do frontend em CORS_ORIGINS
- Formato: `["https://seu-frontend.com"]`
- Reinicie o backend

### Problema: OpenAI API error

**Solução:**
- Verifique se OPENAI_API_KEY está correta
- Confirme que tem créditos na conta OpenAI
- Verifique o modelo (gpt-4 ou gpt-3.5-turbo)

---

## 📝 Checklist de Deploy

- [ ] Código commitado e no GitHub
- [ ] `.env` no `.gitignore`
- [ ] Variáveis de ambiente configuradas
- [ ] PostgreSQL criado
- [ ] Backend deployado e rodando
- [ ] Frontend deployado e rodando
- [ ] CORS configurado corretamente
- [ ] Testado criar usuário
- [ ] Testado login
- [ ] Testado análise de URL
- [ ] Testado geração de relatório
- [ ] Domínio personalizado configurado (opcional)

---

## 🎉 Pronto!

Seu sistema BNA.dev está no ar! 🚀

Para suporte, consulte a documentação de cada plataforma:
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Fly.io: https://fly.io/docs

