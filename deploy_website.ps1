# Deploy Website to Vercel

param(
    [Parameter(Mandatory=$false)]
    [string]$hfSpaceUrl
)

Write-Host "🌐 Deploying SAR Colorization Website to Vercel..." -ForegroundColor Cyan

cd website

# Check if Vercel CLI is installed
Write-Host "`n📋 Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI version: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vercel CLI not installed. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Prompt for HF Space URL if not provided
if (-not $hfSpaceUrl) {
    Write-Host "`n🔗 Enter your Hugging Face Space URL:" -ForegroundColor Cyan
    Write-Host "   Example: https://username-sar-colorization.hf.space" -ForegroundColor Yellow
    $hfSpaceUrl = Read-Host "HF Space URL"
}

if (-not $hfSpaceUrl) {
    Write-Host "❌ HF Space URL is required!" -ForegroundColor Red
    exit 1
}

# Create/update .env.local
Write-Host "`n📝 Configuring environment..." -ForegroundColor Yellow
"NEXT_PUBLIC_HF_SPACE_URL=$hfSpaceUrl" | Out-File -FilePath .env.local -Encoding utf8

Write-Host "✅ Environment configured" -ForegroundColor Green

# Deploy to Vercel
Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Cyan
Write-Host "   You may be asked to login on first run." -ForegroundColor Yellow
Write-Host "   Choose 'Yes' when asked to link to existing project (if you have one)." -ForegroundColor Yellow

vercel --prod --yes

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "`n🌐 Your website should now be live!" -ForegroundColor Cyan
Write-Host "   Check the URL provided by Vercel above." -ForegroundColor Yellow
Write-Host "`n💡 Tip: Run 'vercel domains' to add a custom domain" -ForegroundColor Cyan

cd ..
