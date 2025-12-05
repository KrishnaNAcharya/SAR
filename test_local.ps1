# Quick Local Test Script
# Run this to test before deploying

Write-Host "🚀 Testing SAR Colorization App Locally..." -ForegroundColor Cyan

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements_gradio.txt

# Check for model files
Write-Host "`n📋 Checking for required model files..." -ForegroundColor Yellow

$generator_exists = Test-Path "best_generator.pth"
$classifier_exists = Test-Path "terrain_classifier_checkpoints\best_terrain_classifier.pth"

if (-not $generator_exists) {
    Write-Host "❌ Missing: best_generator.pth" -ForegroundColor Red
} else {
    Write-Host "✅ Found: best_generator.pth" -ForegroundColor Green
}

if (-not $classifier_exists) {
    Write-Host "❌ Missing: terrain_classifier_checkpoints\best_terrain_classifier.pth" -ForegroundColor Red
} else {
    Write-Host "✅ Found: terrain_classifier_checkpoints\best_terrain_classifier.pth" -ForegroundColor Green
}

if (-not $generator_exists -or -not $classifier_exists) {
    Write-Host "`n⚠️  Some model files are missing. App may not work correctly." -ForegroundColor Yellow
    Write-Host "   Copy model files to the correct locations before running." -ForegroundColor Yellow
}

# Run the app
Write-Host "`n🎨 Starting Gradio app..." -ForegroundColor Cyan
Write-Host "   Open your browser to: http://localhost:7860" -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop`n" -ForegroundColor Yellow

python app.py
