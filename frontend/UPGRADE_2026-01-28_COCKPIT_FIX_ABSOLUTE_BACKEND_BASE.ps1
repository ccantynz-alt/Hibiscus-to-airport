# UPGRADE_2026-01-28_COCKPIT_FIX_ABSOLUTE_BACKEND_BASE.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [string]$TargetRoot = (Get-Location).Path,
  [string]$BackendBase = "https://hibiscustoairport-backend.onrender.com"
)

function Ok($m){ Write-Host "[OK]   $m" -ForegroundColor Green }
function Fail($m){ Write-Host "[FAIL] $m" -ForegroundColor Red; throw $m }

function Write-Utf8NoBom($Path, $Content) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

$TargetRoot = (Resolve-Path -LiteralPath $TargetRoot).Path
Ok "TargetRoot: $TargetRoot"
Ok "BackendBase: $BackendBase"

$hits = @(Get-ChildItem -LiteralPath $TargetRoot -Recurse -File | Select-String -Pattern "agent-cockpit" -ErrorAction SilentlyContinue)
if ($hits.Count -eq 0) { Fail "No agent-cockpit source found." }

$files = @($hits | ForEach-Object { $_.Path } | Sort-Object -Unique)
$files = $files | Where-Object { $_ -match "\\backend\\" -and $_.ToLower().EndsWith(".py") }

if ($files.Count -eq 0) { Fail "No backend *.py cockpit file found." }

Ok "Files to patch:"
$files | ForEach-Object { Write-Host " - $_" }

$abs = "$BackendBase/api/api/agents"
$stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")

foreach ($path in $files) {
  $orig = Get-Content -LiteralPath $path -Raw -Encoding UTF8
  $new = $orig

  $new = $new -replace '"/api/api/agents','"' + $abs
  $new = $new -replace "'/api/api/agents","'" + $abs
  $new = $new -replace '"/api/agents','"' + $abs
  $new = $new -replace "'/api/agents","'" + $abs
  $new = $new -replace 'calls your backend at /api/agents/\*','calls your backend at ' + $abs + '/*'

  if ($new -ne $orig) {
    Copy-Item $path "$path.bak_$stamp"
    Write-Utf8NoBom $path $new
    Ok "Patched: $path"
  } else {
    Fail "No changes applied to $path"
  }
}

Ok "DONE"
