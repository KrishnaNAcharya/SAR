# Hugging Face Spaces Deployment Helper Script
param(
    [Parameter(Mandatory=$true)]
    [string]$username,
    
    [Parameter(Mandatory=$true)]
    [string]$spacename
)

Write-Host "🚀 Deploying to Hugging Face Spaces..." -ForegroundColor Cyan
Write-Host "Username: $username" -ForegroundColor Yellow
Write-Host "Space: $spacename`n" -ForegroundColor Yellow

# Check if Git LFS is installed
try {
    git lfs version | Out-Null
    Write-Host "✅ Git LFS is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git LFS not installed. Installing..." -ForegroundColor Red
    Write-Host "   Download from: https://git-lfs.com/" -ForegroundColor Yellow
    Write-Host "   Or run: winget install -e --id GitHub.GitLFS" -ForegroundColor Yellow
    exit 1
}

# Clone the space
$space_url = "https://huggingface.co/spaces/$username/$spacename"
Write-Host "📥 Cloning space: $space_url" -ForegroundColor Yellow

if (Test-Path $spacename) {
    Write-Host "⚠️  Directory '$spacename' already exists. Using existing directory." -ForegroundColor Yellow
    cd $spacename
} else {
    git clone $space_url
    cd $spacename
}

# Setup Git LFS
Write-Host "`n🔧 Setting up Git LFS..." -ForegroundColor Yellow
git lfs install
Copy-Item ..\.gitattributes .
git add .gitattributes

# Copy required files
Write-Host "`n📦 Copying files..." -ForegroundColor Yellow

# Copy main files
Copy-Item ..\app.py . -Force
Write-Host "✅ Copied app.py" -ForegroundColor Green

Copy-Item ..\requirements_gradio.txt .\requirements.txt -Force
Write-Host "✅ Copied requirements.txt" -ForegroundColor Green

Copy-Item ..\README_HF.md .\README.md -Force
Write-Host "✅ Copied README.md" -ForegroundColor Green

# Copy model files
if (Test-Path ..\best_generator.pth) {
    Copy-Item ..\best_generator.pth . -Force
    Write-Host "✅ Copied best_generator.pth" -ForegroundColor Green
} else {
    Write-Host "⚠️  best_generator.pth not found" -ForegroundColor Yellow
}

# Copy classifier
if (-not (Test-Path terrain_classifier_checkpoints)) {
    New-Item -ItemType Directory -Path terrain_classifier_checkpoints | Out-Null
}

if (Test-Path ..\terrain_classifier_checkpoints\best_terrain_classifier.pth) {
    Copy-Item ..\terrain_classifier_checkpoints\best_terrain_classifier.pth .\terrain_classifier_checkpoints\ -Force
    Write-Host "✅ Copied terrain classifier" -ForegroundColor Green
} else {
    Write-Host "⚠️  Terrain classifier not found" -ForegroundColor Yellow
}

# Git add and commit
Write-Host "`n📝 Committing changes..." -ForegroundColor Yellow
git add .
git commit -m "Deploy SAR colorization app"

# Push to HF Spaces
Write-Host "`n🚀 Pushing to Hugging Face Spaces..." -ForegroundColor Cyan
Write-Host "   This may take a while for large model files..." -ForegroundColor Yellow
git push

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "`n🌐 Your app will be available at:" -ForegroundColor Cyan
Write-Host "   $space_url" -ForegroundColor Green
Write-Host "`n⏳ Wait 2-5 minutes for the Space to build and start." -ForegroundColor Yellow
Write-Host "`n💡 Tip: Check the 'Logs' tab in your Space for build status." -ForegroundColor Cyan

cd ..
