# IMPORT_EMERGENT_ZIP_TO_HIBISCUS_2026-01-29.ps1
# Imports Emergent export ZIP (platform-main/frontend) into this repo root (CRA),
# preserves .git/.vercel, backs up current working tree, applies build-compat pins,
# commits + pushes.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "[OK]   $m" -ForegroundColor Green }
function Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Fail($m){ Write-Host "[FAIL] $m" -ForegroundColor Red; throw $m }
function Write-Utf8NoBom($Path, $Content) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

$RepoRoot = (Get-Location).Path
if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot ".git"))) { Fail "Not in a git repo root. Run inside C:\Temp\repos_clean\Hibiscus-to-airport" }

# --- Locate ZIP ---
$zipName = "Hibiscus To Airport.zip"
$candidates = @(
  (Join-Path $RepoRoot $zipName),
  (Join-Path "C:\Temp" $zipName),
  (Join-Path $env:USERPROFILE ("Downloads\" + $zipName))
)

$ZipPath = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $ZipPath) {
  Fail ("ZIP not found. Put it at one of these paths:`n - " + ($candidates -join "`n - "))
}
Ok "ZIP found: $ZipPath"

# --- Backup current working tree (excluding heavy folders) ---
$stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$backupZip = Join-Path $RepoRoot ("BACKUP_before_import_" + $stamp + ".zip")
$tmpBackup = Join-Path $env:TEMP ("hib_import_backup_" + $stamp)
New-Item -ItemType Directory -Force -Path $tmpBackup | Out-Null

$excludeNames = @("node_modules",".next",".vercel",".git","dist","build",".turbo")
Ok ("Backing up current files (excluding: {0})" -f ($excludeNames -join ", "))

$rcArgs = @(
  "`"$RepoRoot`"",
  "`"$tmpBackup`"",
  "/E","/NFL","/NDL","/NJH","/NJS","/NC","/NS","/NP",
  "/XD"
) + ($excludeNames | ForEach-Object { "`"$($_)`"" })

cmd.exe /c ("robocopy " + ($rcArgs -join " ")) | Out-Null

Compress-Archive -Path (Join-Path $tmpBackup "*") -DestinationPath $backupZip -Force
Remove-Item -LiteralPath $tmpBackup -Recurse -Force
Ok "Backup created: $backupZip"

# --- Extract ZIP ---
$extractRoot = Join-Path $env:TEMP ("hib_import_extract_" + $stamp)
New-Item -ItemType Directory -Force -Path $extractRoot | Out-Null
Expand-Archive -LiteralPath $ZipPath -DestinationPath $extractRoot -Force
Ok "Extracted to: $extractRoot"

# --- Locate platform-main/frontend ---
$platformMain = Join-Path $extractRoot "platform-main"
$frontendSrc  = Join-Path $platformMain "frontend"
$backendSrc   = Join-Path $platformMain "backend"

if (-not (Test-Path -LiteralPath $frontendSrc)) {
  Fail "Expected folder not found: platform-main\frontend inside the ZIP. The ZIP structure is not what we expect."
}
if (-not (Test-Path -LiteralPath (Join-Path $frontendSrc "package.json"))) {
  Fail "frontend package.json not found inside the ZIP."
}
Ok "Found frontend source: $frontendSrc"

# --- Wipe repo working tree except .git and .vercel ---
Ok "Cleaning repo working tree (preserving .git and .vercel)..."
Get-ChildItem -LiteralPath $RepoRoot -Force | ForEach-Object {
  $name = $_.Name
  if ($name -in @(".git",".vercel")) { return }
  Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
}

# --- Copy frontend into repo root ---
Ok "Copying Emergent frontend into repo root..."
Copy-Item -LiteralPath (Join-Path $frontendSrc "*") -Destination $RepoRoot -Recurse -Force

# --- Optionally keep backend for reference (doesn't affect Vercel build) ---
if (Test-Path -LiteralPath $backendSrc) {
  Ok "Copying backend folder for reference..."
  Copy-Item -LiteralPath $backendSrc -Destination (Join-Path $RepoRoot "backend") -Recurse -Force
}

# --- Apply build-compat pins (keeps site content, ensures Vercel builds) ---
# Fix known Vercel ERESOLVE blockers:
# - react-day-picker@8 expects React <=18
# - react-day-picker expects date-fns <=3
$pkgPath = Join-Path $RepoRoot "package.json"
$pkgOrig = Get-Content -LiteralPath $pkgPath -Raw -Encoding UTF8
$pkgNew  = $pkgOrig

$pkgNew = [regex]::Replace($pkgNew, '"react"\s*:\s*"[^"]+"', '"react": "^18.2.0"')
$pkgNew = [regex]::Replace($pkgNew, '"react-dom"\s*:\s*"[^"]+"', '"react-dom": "^18.2.0"')

if ($pkgNew -match '"date-fns"\s*:') {
  $pkgNew = [regex]::Replace($pkgNew, '"date-fns"\s*:\s*"[^"]+"', '"date-fns": "^3.6.0"')
}

if ($pkgNew -ne $pkgOrig) {
  Copy-Item -LiteralPath $pkgPath -Destination ($pkgPath + ".bak_" + $stamp) -Force
  Write-Utf8NoBom $pkgPath $pkgNew
  Ok "Pinned react/react-dom to ^18.2.0 and date-fns to ^3.6.0 (build compatibility)."
} else {
  Warn "package.json pins not changed (unexpected)."
}

# Remove lockfiles if present (avoid stale resolutions)
foreach ($lp in @((Join-Path $RepoRoot "package-lock.json"), (Join-Path $RepoRoot "npm-shrinkwrap.json"))) {
  if (Test-Path -LiteralPath $lp) {
    Copy-Item -LiteralPath $lp -Destination ($lp + ".bak_" + $stamp) -Force
    Remove-Item -LiteralPath $lp -Force
    Ok "Removed lockfile: $lp"
  }
}

# --- Commit + push ---
git status
git add -A
git commit -m "restore: import Emergent site content (frontend) for hibiscustoairport.co.nz"
git push

Ok "IMPORT COMPLETE."
Ok "NEXT: In Vercel project 'hibiscus-to-airport' -> Deployments -> Redeploy (Production)."

# --- Quick live checks (you can run after deploy finishes) ---
Write-Host ""
Write-Host "After Vercel deploy finishes, run:" -ForegroundColor Yellow
Write-Host '  Invoke-WebRequest -Uri "https://hibiscustoairport.co.nz" -Method Get -TimeoutSec 30 | Select StatusCode' -ForegroundColor Yellow
Write-Host '  Invoke-WebRequest -Uri "https://www.hibiscustoairport.co.nz" -Method Get -TimeoutSec 30 | Select StatusCode' -ForegroundColor Yellow
