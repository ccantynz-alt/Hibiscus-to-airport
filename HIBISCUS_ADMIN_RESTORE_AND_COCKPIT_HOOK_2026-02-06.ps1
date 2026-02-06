[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string] $RepoRoot,

  [Parameter(Mandatory=$true)]
  [string] $BaseUrl,

  [Parameter(Mandatory=$false)]
  [string] $AdminUsername = "admin",

  [Parameter(Mandatory=$false)]
  [string] $AdminEmail = "admin@hibiscustoairport.co.nz",

  [Parameter(Mandatory=$false)]
  [string] $AdminPasswordPlain = "",

  [Parameter(Mandatory=$false)]
  [string] $AdminDisplayName = "Site Admin",

  [Parameter(Mandatory=$false)]
  [switch] $SkipGitCleanCheck,

  [Parameter(Mandatory=$false)]
  [switch] $NoPatchWrite
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "OK   $m" -ForegroundColor Green }
function Info($m){ Write-Host "INFO $m" -ForegroundColor Cyan }
function Warn($m){ Write-Host "WARN $m" -ForegroundColor Yellow }
function Fail($m){ Write-Host "FAIL $m" -ForegroundColor Red }

if (-not (Test-Path $RepoRoot)) {
  Fail "Repo root not found: $RepoRoot"
  exit 1
}

$base = $BaseUrl.TrimEnd("/")
$ts = [int](Get-Date -UFormat %s)

Info "Health probe"
try {
  $h = Invoke-WebRequest -UseBasicParsing "$base/healthz?ts=$ts" -TimeoutSec 20
  Ok "Health: $($h.StatusCode)"
} catch {
  Fail "Health probe failed"
}

if (-not $AdminPasswordPlain) {
  Write-Host ""
  Write-Host "Enter NEW admin password:" -ForegroundColor Yellow
  $sec = Read-Host -AsSecureString "Password"
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  $AdminPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
}

Info "Attempting admin bootstrap endpoint"

$body = @{
  username = $AdminUsername
  email    = $AdminEmail
  password = $AdminPasswordPlain
  role     = "admin"
} | ConvertTo-Json

$created = $false
$paths = @(
  "/admin/bootstrap",
  "/admin/seed-admin",
  "/admin/create"
)

foreach ($p in $paths) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Method POST -Uri "$base$p" `
      -ContentType "application/json" -Body $body -TimeoutSec 20
    if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) {
      Ok "Admin created via $p"
      $created = $true
      break
    }
  } catch {}
}

if (-not $created) {
  Warn "Admin not created via endpoint (may already exist or use different method)."
}

Info "Testing login"

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginOk = $false

$loginPaths = @(
  "/admin/login",
  "/admin/auth/login"
)

foreach ($lp in $loginPaths) {
  try {
    $form = "username=$AdminUsername&password=$AdminPasswordPlain"
    $r = Invoke-WebRequest -UseBasicParsing -Method POST -Uri "$base$lp" `
      -WebSession $session `
      -ContentType "application/x-www-form-urlencoded" `
      -Body $form -TimeoutSec 20

    if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) {
      Ok "Login success via $lp"
      $loginOk = $true
      break
    }
  } catch {}
}

if (-not $loginOk) {
  Fail "Login failed"
  exit 1
}

Info "Dashboard probe"
try {
  $d = Invoke-WebRequest -UseBasicParsing "$base/admin" `
    -WebSession $session -TimeoutSec 20
  Ok "Dashboard reachable: $($d.StatusCode)"
} catch {
  Warn "Dashboard probe failed"
}

Info "Preparing cockpit hook"

$hookDir = Join-Path $RepoRoot "d8_runtime"
$hookPath = Join-Path $hookDir "cockpit_hook.json"

New-Item -ItemType Directory -Force -Path $hookDir | Out-Null

$hook = @{
  label = "System Cockpit"
  href  = "/admin/ops"
  proof = "HIBI_COCKPIT_HOOK_READY_20260206"
} | ConvertTo-Json

$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($hookPath, $hook, $enc)

Ok "Cockpit hook written: $hookPath"

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor White