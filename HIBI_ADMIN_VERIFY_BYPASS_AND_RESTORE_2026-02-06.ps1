[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string] $BaseUrl,

  [Parameter(Mandatory=$true)]
  [string] $AdminBypassKey,

  [Parameter(Mandatory=$false)]
  [string] $AdminUsername = "admin",

  [Parameter(Mandatory=$false)]
  [string] $AdminEmail = "admin@hibiscustoairport.co.nz",

  [Parameter(Mandatory=$false)]
  [string] $AdminPasswordPlain = "",

  [Parameter(Mandatory=$false)]
  [string] $CockpitPath = "/admin/ops"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Info($m){ Write-Host ("INFO  {0}" -f $m) -ForegroundColor Cyan }
function Ok($m){ Write-Host ("OK    {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN  {0}" -f $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FAIL  {0}" -f $m) -ForegroundColor Red }

function Coalesce($v, $fallback) {
  if ($null -ne $v -and "$v" -ne "") { return $v }
  return $fallback
}

function Try-Web {
  param(
    [ValidateSet("GET","POST","HEAD")]
    [string] $Method,
    [string] $Url,
    [hashtable] $Headers = $null,
    [Microsoft.PowerShell.Commands.WebRequestSession] $Session = $null,
    [string] $ContentType = $null,
    [string] $Body = $null,
    [int] $TimeoutSec = 25
  )
  try {
    $p = @{
      UseBasicParsing = $true
      Method = $Method
      Uri = $Url
      TimeoutSec = $TimeoutSec
      ErrorAction = "Stop"
    }
    if ($Headers) { $p.Headers = $Headers }
    if ($Session) { $p.WebSession = $Session }
    if ($ContentType) { $p.ContentType = $ContentType }
    if ($Body) { $p.Body = $Body }
    $r = Invoke-WebRequest @p
    return @{ ok=$true; status=[int]$r.StatusCode; r=$r }
  } catch {
    $code = $null
    try {
      if ($_.Exception.Response -and $_.Exception.Response.StatusCode) { $code = [int]$_.Exception.Response.StatusCode }
    } catch {}
    return @{ ok=$false; status=$code; err=$_.Exception.Message }
  }
}

function Get-SecurePasswordPlain {
  param([string] $Plain)
  if ($Plain -and $Plain.Trim().Length -ge 8) { return $Plain }
  Write-Host ""
  Write-Host "Enter NEW admin password (min 8 chars). It will NOT be printed." -ForegroundColor Yellow
  $sec = Read-Host -AsSecureString "Admin password"
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

$Base = $BaseUrl.TrimEnd("/")
$ts = [int](Get-Date -UFormat %s)
$pwd = Get-SecurePasswordPlain -Plain $AdminPasswordPlain

Info "1) Preflight probes"
foreach ($path in @("/healthz","/debug/stamp","/debug/routes")) {
  $u = ("{0}{1}?ts={2}" -f $Base, $path, $ts)
  $r = Try-Web -Method GET -Url $u
  if ($r.ok) { Ok ("GET {0} -> {1}" -f $path, $r.status) }
  else { Warn ("GET {0} -> {1}" -f $path, (Coalesce $r.status "ERR")) }
}

# Try bypass key across multiple header names
$headerSets = @(
  @{ "X-Admin-Key"    = $AdminBypassKey },
  @{ "X-Admin-Bypass" = $AdminBypassKey },
  @{ "X-API-Key"      = $AdminBypassKey },
  @{ "Authorization"  = ("Bearer {0}" -f $AdminBypassKey) }
)

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Info "2) Bypass probe (/admin) using common header names"
$bypassOk = $false
$usedHeader = $null

foreach ($hs in $headerSets) {
  $hn = ($hs.Keys | Select-Object -First 1)
  $u = ("{0}/admin?ts={1}" -f $Base, $ts)
  $rAdmin = Try-Web -Method GET -Url $u -Headers $hs -Session $session
  if ($rAdmin.ok -and $rAdmin.status -ge 200 -and $rAdmin.status -lt 400) {
    Ok ("Bypass OK: GET /admin -> {0} (header: {1})" -f $rAdmin.status, $hn)
    $bypassOk = $true
    $usedHeader = $hs
    break
  } else {
    Warn ("Bypass attempt: GET /admin -> {0} (header: {1})" -f (Coalesce $rAdmin.status "ERR"), $hn)
  }
}

if (-not $bypassOk) {
  Fail "Bypass FAILED for all common header names."
  throw "Stopping: bypass did not work."
}

Info "3) Cockpit probe (best-effort)"
$uOps = ("{0}{1}?ts={2}" -f $Base, $CockpitPath, $ts)
$rOps = Try-Web -Method GET -Url $uOps -Headers $usedHeader -Session $session
if ($rOps.ok -and $rOps.status -ge 200 -and $rOps.status -lt 400) {
  Ok ("Cockpit OK: GET {0} -> {1}" -f $CockpitPath, $rOps.status)
} else {
  Warn ("Cockpit probe not confirmed: GET {0} -> {1}" -f $CockpitPath, (Coalesce $rOps.status "ERR"))
}

Info "4) Attempt admin user restore/seed via common endpoints (using bypass header)"
$seedBody = @{
  username = $AdminUsername
  email    = $AdminEmail
  password = $pwd
  role     = "admin"
} | ConvertTo-Json -Compress

$seedCandidates = @(
  "/admin/bootstrap",
  "/admin/seed-admin",
  "/admin/create",
  "/admin/users",
  "/admin/api/users"
)

$seeded = $false
foreach ($p in $seedCandidates) {
  $u = ("{0}{1}" -f $Base, $p)
  $r = Try-Web -Method POST -Url $u -Headers $usedHeader -ContentType "application/json" -Body $seedBody -Session $session
  if ($r.ok -and $r.status -ge 200 -and $r.status -lt 300) {
    Ok ("Seed OK: POST {0} -> {1}" -f $p, $r.status)
    $seeded = $true
    break
  } else {
    Warn ("Seed attempt: POST {0} -> {1}" -f $p, (Coalesce $r.status "ERR"))
  }
}

if (-not $seeded) {
  Warn "No seed endpoint succeeded (may require DB-level seeding)."
}

Info "5) Verify login page is reachable"
$uLoginPage = ("{0}/admin/login?ts={1}" -f $Base, $ts)
$lp = Try-Web -Method GET -Url $uLoginPage
if ($lp.ok) { Ok ("GET /admin/login -> {0}" -f $lp.status) }
else { Warn ("GET /admin/login -> {0}" -f (Coalesce $lp.status "ERR")) }

Info "6) Attempt login using FORM + JSON (without bypass)"
$loginOk = $false

foreach ($p in @("/admin/login","/admin/auth/login","/admin/api/login","/token","/auth/token")) {
  if ($loginOk) { break }

  $u = ("{0}{1}" -f $Base, $p)

  $jsonBody = @{ username=$AdminUsername; password=$pwd } | ConvertTo-Json -Compress
  $rj = Try-Web -Method POST -Url $u -ContentType "application/json" -Body $jsonBody
  if ($rj.ok -and $rj.status -ge 200 -and $rj.status -lt 300) {
    Ok ("Login OK (JSON): POST {0} -> {1}" -f $p, $rj.status)
    $loginOk = $true
    break
  } else {
    Warn ("Login JSON: POST {0} -> {1}" -f $p, (Coalesce $rj.status "ERR"))
  }

  $formBody = ("username={0}&password={1}" -f [uri]::EscapeDataString($AdminUsername), [uri]::EscapeDataString($pwd))
  $rf = Try-Web -Method POST -Url $u -ContentType "application/x-www-form-urlencoded" -Body $formBody
  if ($rf.ok -and $rf.status -ge 200 -and $rf.status -lt 300) {
    Ok ("Login OK (FORM): POST {0} -> {1}" -f $p, $rf.status)
    $loginOk = $true
    break
  } else {
    Warn ("Login FORM: POST {0} -> {1}" -f $p, (Coalesce $rf.status "ERR"))
  }
}

if (-not $loginOk) {
  Warn "Login not confirmed yet (but bypass works, so you can still access admin while we wire real auth)."
} else {
  Ok "Login confirmed."
}

Write-Host ""
Write-Host "DONE." -ForegroundColor White