# Run this script to clear VS Code caches when hanging occurs
# Right-click -> Run with PowerShell

Write-Host "🧹 Cleaning VS Code caches..." -ForegroundColor Cyan

$projectDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$vscodeUserSettings = "$env:APPDATA\Code\User\settings.json"
$cacheDir = "$env:APPDATA\Code\Cache"

# Clear project caches
Write-Host "Clearing project caches..."
Remove-Item -Path "$projectDir\.next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$projectDir\tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$projectDir\.vscode\.typescript" -Recurse -Force -ErrorAction SilentlyContinue

# Clear VS Code global cache
Write-Host "Clearing VS Code global cache..."
Remove-Item -Path $cacheDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ All caches cleared! Restart VS Code now." -ForegroundColor Green
