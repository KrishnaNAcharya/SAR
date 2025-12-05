# Test Website Locally Before Deploying

Write-Host "🌐 Setting up SAR Colorization Website..." -ForegroundColor Cyan

cd website

# Check if Node.js is installed
Write-Host "`n📋 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not installed!" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "`n⚠️  Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item .env.local.example .env.local
    Write-Host "❌ Please edit .env.local and add your HF Space URL!" -ForegroundColor Red
    Write-Host "   Open: .env.local" -ForegroundColor Yellow
    Write-Host "   Set: NEXT_PUBLIC_HF_SPACE_URL=https://YOUR_USERNAME-sar-colorization.hf.space" -ForegroundColor Yellow
    notepad .env.local
    Write-Host "`nAfter saving, run this script again." -ForegroundColor Cyan
    exit 0
}

# Check if HF Space URL is configured
$envContent = Get-Content .env.local
$hfUrl = $envContent | Select-String "NEXT_PUBLIC_HF_SPACE_URL" | Out-String
if ($hfUrl -match "YOUR_USERNAME") {
    Write-Host "`n❌ Please configure your HF Space URL in .env.local" -ForegroundColor Red
    Write-Host "   Current: $hfUrl" -ForegroundColor Yellow
    Write-Host "   Should be: NEXT_PUBLIC_HF_SPACE_URL=https://YOUR_USERNAME-sar-colorization.hf.space" -ForegroundColor Yellow
    notepad .env.local
    exit 1
}

Write-Host "`n✅ Configuration looks good!" -ForegroundColor Green
Write-Host "`n🚀 Starting development server..." -ForegroundColor Cyan
Write-Host "   Open: http://localhost:3000" -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop`n" -ForegroundColor Yellow

npm run dev
