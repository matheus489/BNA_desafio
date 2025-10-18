# Script de Deploy Rápido - BNA.dev
# Execute: .\deploy.ps1

Write-Host "🚀 BNA.dev - Deploy Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar status
Write-Host "📊 Verificando status do Git..." -ForegroundColor Yellow
git status

Write-Host ""
$continue = Read-Host "Deseja continuar com o commit? (S/N)"
if ($continue -ne "S" -and $continue -ne "s") {
    Write-Host "❌ Deploy cancelado." -ForegroundColor Red
    exit
}

# 2. Pedir mensagem de commit
Write-Host ""
$message = Read-Host "Digite a mensagem do commit"
if ([string]::IsNullOrWhiteSpace($message)) {
    $message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# 3. Add, Commit e Push
Write-Host ""
Write-Host "📦 Adicionando arquivos..." -ForegroundColor Yellow
git add .

Write-Host "💾 Fazendo commit..." -ForegroundColor Yellow
git commit -m $message

Write-Host "🚀 Enviando para GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Acesse Railway.app ou Render.com" -ForegroundColor White
Write-Host "2. Conecte seu repositório GitHub" -ForegroundColor White
Write-Host "3. Configure variáveis de ambiente" -ForegroundColor White
Write-Host "4. Aguarde o deploy automático" -ForegroundColor White
Write-Host ""
Write-Host "📚 Consulte QUICK_DEPLOY.md para instruções detalhadas" -ForegroundColor Cyan

