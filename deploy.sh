#!/bin/bash

# Script de Deploy Rápido - BNA.dev
# Execute: ./deploy.sh

echo "🚀 BNA.dev - Deploy Script"
echo "========================="
echo ""

# 1. Verificar status
echo "📊 Verificando status do Git..."
git status

echo ""
read -p "Deseja continuar com o commit? (s/N): " continue
if [[ ! $continue =~ ^[Ss]$ ]]; then
    echo "❌ Deploy cancelado."
    exit 0
fi

# 2. Pedir mensagem de commit
echo ""
read -p "Digite a mensagem do commit: " message
if [ -z "$message" ]; then
    message="Update: $(date '+%Y-%m-%d %H:%M')"
fi

# 3. Add, Commit e Push
echo ""
echo "📦 Adicionando arquivos..."
git add .

echo "💾 Fazendo commit..."
git commit -m "$message"

echo "🚀 Enviando para GitHub..."
git push origin main

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "🌐 Próximos passos:"
echo "1. Acesse Railway.app ou Render.com"
echo "2. Conecte seu repositório GitHub"
echo "3. Configure variáveis de ambiente"
echo "4. Aguarde o deploy automático"
echo ""
echo "📚 Consulte QUICK_DEPLOY.md para instruções detalhadas"

