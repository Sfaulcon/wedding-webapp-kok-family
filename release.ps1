# Builds backend + frontend and creates one zip: release\francoisandkaitlyn-upload.zip
# Run from project root:  .\release.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

$apiUrl = "https://api.francoisandkaitlyn.co.za"
$zipName = "francoisandkaitlyn-upload.zip"
$staging = Join-Path $root "release\staging"
$outZip = Join-Path $root "release\$zipName"

Remove-Item $staging -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $outZip -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $staging -Force | Out-Null

$apiOut = Join-Path $staging "api"
$wwwOut = Join-Path $staging "www"
New-Item -ItemType Directory -Path $apiOut -Force | Out-Null
New-Item -ItemType Directory -Path $wwwOut -Force | Out-Null

Write-Host "Building backend..." -ForegroundColor Cyan
Push-Location (Join-Path $root "backend")
npm install
npm run build
if (-not (Test-Path "dist\index.js")) { throw "Backend build failed: dist\index.js missing" }
Pop-Location

Write-Host "Building frontend ($apiUrl)..." -ForegroundColor Cyan
Push-Location (Join-Path $root "kait-wedding-webapp-v1")
$env:VITE_API_URL = $apiUrl
npm install
npm run build
if (-not (Test-Path "dist\index.html")) { throw "Frontend build failed" }
Pop-Location

Write-Host "Assembling package..." -ForegroundColor Cyan
Copy-Item -Path (Join-Path $root "backend\dist") -Destination (Join-Path $apiOut "dist") -Recurse -Force
Copy-Item -Path (Join-Path $root "backend\package.json") -Destination $apiOut -Force
Copy-Item -Path (Join-Path $root "backend\package-lock.json") -Destination $apiOut -Force
Copy-Item -Path (Join-Path $root "backend\.env.example") -Destination $apiOut -Force
Copy-Item -Path (Join-Path $root "backend\ecosystem.config.cjs") -Destination $apiOut -Force

$dataSrc = Join-Path $root "backend\data"
if (Test-Path $dataSrc) {
  Copy-Item -Path $dataSrc -Destination (Join-Path $apiOut "data") -Recurse -Force
}

$credOut = Join-Path $apiOut "credentials"
New-Item -ItemType Directory -Path $credOut -Force | Out-Null
Set-Content -Path (Join-Path $credOut "PUT_GOOGLE_KEY_HERE.txt") -Value "Replace this file with google-key.json from Google Cloud (service account)." -Encoding UTF8

Copy-Item -Path (Join-Path $root "kait-wedding-webapp-v1\dist\*") -Destination $wwwOut -Recurse -Force

$install = @"
francoisandkaitlyn.co.za — upload package
============================================

Unzip on your Linux server (example: /var/www/francoisandkaitlyn).

1) Replace api/credentials/PUT_GOOGLE_KEY_HERE.txt with your real file:
   api/credentials/google-key.json   (chmod 600)

2) Create api/.env — copy api/.env.example and set:
   SPREADSHEET_ID, ALLOWED_ORIGINS=https://francoisandkaitlyn.co.za
   SYNC_SECRET=(random string), NODE_ENV=production, TRUST_PROXY=1

3) Start API:
   cd api
   npm ci --omit=dev
   pm2 start ecosystem.config.cjs
   pm2 save

4) Nginx: root = www/ for francoisandkaitlyn.co.za
   Proxy api.francoisandkaitlyn.co.za to http://127.0.0.1:4000
   Add SSL (certbot).
"@
Set-Content -Path (Join-Path $staging "INSTALL.txt") -Value $install -Encoding UTF8

Compress-Archive -Path "$staging\*" -DestinationPath $outZip -Force
Remove-Item $staging -Recurse -Force

Write-Host ""
Write-Host "Done: $outZip" -ForegroundColor Green
Write-Host "Upload that zip to your server, unzip, follow INSTALL.txt inside." -ForegroundColor Green
Write-Host ""
