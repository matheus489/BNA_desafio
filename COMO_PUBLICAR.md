# 🌐 Como Publicar o BNA.dev

## ✅ Passo a Passo Simples

### 1️⃣ Enviar código para o GitHub

```powershell
# Se ainda não tem repositório no GitHub:
# 1. Crie um repositório em: https://github.com/new
# 2. Nomeie como "BNA" (ou outro nome)
# 3. NÃO inicialize com README

# Conectar repositório local ao GitHub (se ainda não estiver)
git remote add origin https://github.com/SEU-USUARIO/BNA.git

# Enviar código
git push -u origin main
```

### 2️⃣ Escolher Plataforma de Hospedagem

#### 🚂 **Opção A: Railway (MAIS FÁCIL)** ⭐

**Por que Railway?**
- ✅ Detecta Docker Compose automaticamente
- ✅ $5 de crédito grátis por mês
- ✅ PostgreSQL incluído
- ✅ Deploy em 2 cliques
- ✅ HTTPS automático

**Como fazer:**

1. Acesse: **https://railway.app**
2. Clique em **"Login with GitHub"**
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha o repositório **BNA**
6. Railway detecta automaticamente! ✅

**Configurar variáveis:**

Após o deploy, clique em cada serviço e adicione:

**Backend:**
```
OPENAI_API_KEY=sk-proj-sua-chave-aqui
OPENAI_MODEL=gpt-4
SECRET_KEY=sua-secret-key-super-segura
```

**Frontend:**
```
VITE_API_URL=https://bna-backend-production.up.railway.app
```

**URLs geradas automaticamente:**
- Backend: `https://bna-backend-production.up.railway.app`
- Frontend: `https://bna-frontend-production.up.railway.app`

---

#### 🎨 **Opção B: Render (100% GRÁTIS)**

**Por que Render?**
- ✅ Totalmente gratuito
- ✅ PostgreSQL grátis
- ✅ Simples de usar
- ⚠️ Hiberna após 15 min de inatividade

**Como fazer:**

1. Acesse: **https://render.com**
2. Clique em **"Get Started"**
3. Login com GitHub

**Criar banco de dados:**
1. **New** → **PostgreSQL**
2. Nome: `bna-db`
3. Plan: **Free**
4. Create Database
5. **Copie a "Internal Database URL"**

**Criar backend:**
1. **New** → **Web Service**
2. Conecte o repositório GitHub
3. Configurações:
   - **Name:** `bna-backend`
   - **Environment:** Docker
   - **Docker Build Context:** `./backend`
   - **Docker Command:** (deixe vazio)

4. **Environment Variables:**
   ```
   DATABASE_URL=(cole a URL copiada)
   OPENAI_API_KEY=sk-proj-sua-chave-aqui
   OPENAI_MODEL=gpt-4
   SECRET_KEY=sua-secret-key-aqui
   CORS_ORIGINS=["https://bna-frontend.onrender.com"]
   ```

5. **Create Web Service**

**Criar frontend:**
1. **New** → **Static Site**
2. Conecte o repositório GitHub
3. Build Command:
   ```
   cd frontend && npm install && npm run build
   ```
4. Publish Directory: `frontend/dist`
5. **Environment Variables:**
   ```
   VITE_API_URL=https://bna-backend.onrender.com
   ```
6. **Create Static Site**

**Aguarde 5 minutos** para o primeiro deploy!

---

### 3️⃣ Gerar SECRET_KEY

**Opção 1 - Python:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Opção 2 - Node:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Opção 3 - Online:**
Acesse: https://randomkeygen.com/ (seção "CodeIgniter Encryption Keys")

---

### 4️⃣ Testar o Site

Após deploy completo:

1. **Abra o frontend** (URL fornecida pela plataforma)
2. **Teste criar conta**
3. **Teste fazer login**
4. **Teste analisar uma URL**
5. **Teste gerar relatório PDF**
6. **Teste o chat RAG**

---

## 🚀 Deploy Automático

Após configurar uma vez:

```powershell
# Windows
.\deploy.ps1

# Ou manual
git add .
git commit -m "Sua mensagem"
git push origin main
```

**O deploy acontece automaticamente!** 🎉

---

## 📊 Custos

### Railway
- **Grátis:** $5 de crédito/mês
- **Uso estimado:** $3-5/mês (MVP)
- **Produção:** $15-30/mês

### Render
- **Grátis:** 100% free tier
- **Limitações:** Hiberna após inatividade
- **Upgrade (opcional):** $7/mês

### OpenAI API
- **Uso casual:** $5-10/mês
- **Uso médio:** $20-50/mês
- **Uso intenso:** $100+/mês

---

## 🔒 Segurança

**Antes de publicar:**

- [x] `.env` está no `.gitignore` ✅
- [ ] `SECRET_KEY` é forte e única
- [ ] `OPENAI_API_KEY` é válida
- [ ] `CORS_ORIGINS` tem apenas domínios permitidos
- [ ] Senhas do PostgreSQL são fortes

---

## 💡 Dicas

### Deploy mais rápido
Use Railway - é automático!

### Deploy grátis
Use Render - é 100% free!

### Domínio personalizado
Adicione seu domínio nas configurações da plataforma:
- `bna.dev` → Backend
- `app.bna.dev` → Frontend

### Monitorar logs
```bash
# Railway
railway logs

# Render
# Acesse painel → Logs

# Fly.io
fly logs
```

---

## ❓ Problemas Comuns

### Backend não inicia
- ✅ Verifique variáveis de ambiente
- ✅ Veja os logs
- ✅ Confirme DATABASE_URL correto

### Frontend não carrega
- ✅ Build terminou com sucesso?
- ✅ VITE_API_URL aponta para backend?
- ✅ Backend está rodando?

### CORS error
- ✅ Adicione URL do frontend em CORS_ORIGINS
- ✅ Reinicie o backend

### OpenAI error
- ✅ API key está correta?
- ✅ Tem créditos na conta OpenAI?
- ✅ Modelo está correto? (gpt-4 ou gpt-3.5-turbo)

---

## 📚 Arquivos Úteis

- **QUICK_DEPLOY.md** - Guia rápido de 5 minutos
- **DEPLOY.md** - Guia completo e detalhado
- **README.md** - Documentação geral do projeto

---

## 🎉 Pronto!

Seu site BNA.dev está no ar! 🚀

**Próximos passos:**
1. Compartilhe o link
2. Configure domínio personalizado
3. Configure backup do banco
4. Adicione analytics
5. Monitore uso da API OpenAI

---

**Dúvidas?** Consulte os guias completos ou a documentação da plataforma escolhida.

