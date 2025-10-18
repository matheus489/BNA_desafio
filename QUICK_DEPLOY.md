# 🚀 Deploy Rápido - 5 Minutos

## Opção 1: Railway (Mais Fácil) ⭐

### 1️⃣ Prepare o código
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2️⃣ Deploy
1. Acesse: https://railway.app
2. Login com GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Selecione: `BNA`
5. Railway detecta automaticamente o Docker Compose ✅

### 3️⃣ Configure Variáveis de Ambiente

**Clique em cada serviço e adicione:**

**Backend:**
```
OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_MODEL=gpt-4
SECRET_KEY=sua-secret-key-segura
```

**Frontend:**
```
VITE_API_URL=https://seu-backend.up.railway.app
```

### 4️⃣ Pronto! 🎉
- URLs geradas automaticamente
- Deploy automático a cada push
- PostgreSQL já configurado

---

## Opção 2: Render (Free Forever)

### 1️⃣ Crie conta: https://render.com

### 2️⃣ Crie PostgreSQL
1. **New** → **PostgreSQL**
2. Nome: `bna-db`
3. Plan: **Free**
4. Copie a **Internal Database URL**

### 3️⃣ Crie Backend
1. **New** → **Web Service**
2. Conecte repositório GitHub
3. Configurações:
   - Name: `bna-backend`
   - Environment: **Docker**
   - Docker Build Context: `./backend`
   - Docker Command: (deixe vazio)

4. **Environment Variables:**
   ```
   DATABASE_URL=(cole a URL do PostgreSQL)
   OPENAI_API_KEY=sk-sua-chave-aqui
   OPENAI_MODEL=gpt-4
   SECRET_KEY=sua-secret-key-aqui
   CORS_ORIGINS=["https://bna-frontend.onrender.com"]
   ```

### 4️⃣ Crie Frontend
1. **New** → **Static Site**
2. Build Command: 
   ```
   cd frontend && npm install && npm run build
   ```
3. Publish Directory: `frontend/dist`
4. **Environment Variables:**
   ```
   VITE_API_URL=https://bna-backend.onrender.com
   ```

### 5️⃣ Aguarde deploy (3-5 minutos)

---

## 🔑 Gerar SECRET_KEY

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Online
# https://randomkeygen.com/
```

---

## 🧪 Testar Deploy

Após deploy, teste:

1. ✅ Backend health: `https://seu-backend.com/health`
2. ✅ Frontend: `https://seu-frontend.com`
3. ✅ Criar conta
4. ✅ Login
5. ✅ Analisar URL
6. ✅ Gerar relatório PDF

---

## ⚠️ Problemas Comuns

### Backend não inicia
- ✅ Verifique variáveis de ambiente
- ✅ Veja logs do serviço
- ✅ Confirme DATABASE_URL correto

### Frontend não conecta ao backend
- ✅ VITE_API_URL deve apontar para backend
- ✅ Adicione frontend URL em CORS_ORIGINS
- ✅ Use HTTPS (não HTTP)

### OpenAI errors
- ✅ Verifique API key
- ✅ Confirme créditos na conta OpenAI
- ✅ Modelo correto (gpt-4 ou gpt-3.5-turbo)

---

## 💰 Custos

| Plataforma | Backend | DB | Frontend | Total/mês |
|------------|---------|----|---------:|-----------|
| Railway | $5 crédito | Incluso | Incluso | $0-5 |
| Render | Grátis* | Grátis | Grátis | $0 |
| Fly.io | Grátis | Grátis | Grátis | $0 |

*Render: serviços gratuitos hibernam após inatividade

---

## 📱 Acessar API

```bash
# Substituir URLs pelos seus domínios

# Health check
curl https://seu-backend.com/health

# Login
curl -X POST https://seu-backend.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha"}'

# Analisar URL
curl -X POST https://seu-backend.com/analyze \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://exemplo.com"}'
```

---

## 🎯 Próximos Passos

1. ✅ Configurar domínio personalizado
2. ✅ Adicionar monitoramento
3. ✅ Configurar backups do banco
4. ✅ Adicionar analytics
5. ✅ Configurar SSL/HTTPS

---

**Dúvidas?** Consulte o arquivo `DEPLOY.md` para guia completo!

