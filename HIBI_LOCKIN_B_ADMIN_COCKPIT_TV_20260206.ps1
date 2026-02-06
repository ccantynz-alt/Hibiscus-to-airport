[CmdletBinding()]
param(
  [Parameter(Mandatory=$false)]
  [string] $RepoRoot = "C:\Temp\repos_clean\Hibiscus-to-airport",

  [Parameter(Mandatory=$false)]
  [string] $BackendBase = "https://api.hibiscustoairport.co.nz",

  [Parameter(Mandatory=$false)]
  [switch] $NoGitCommit
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Info($m){ Write-Host ("INFO {0}" -f $m) -ForegroundColor Cyan }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }

function Write-Utf8NoBom {
  param([string]$Path,[string]$Text)
  $enc = New-Object System.Text.UTF8Encoding($false)
  $dir = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($Path, $Text, $enc)
}

function Backup-File {
  param([string]$Path)
  if (Test-Path -LiteralPath $Path) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    $bak = "$Path.bak.$ts"
    Copy-Item -LiteralPath $Path -Destination $bak -Force
    Ok ("Backup: {0}" -f $bak)
  }
}

function Ensure-Rewrite {
  param([ref]$Arr,[string]$Source,[string]$Dest)
  foreach ($r in $Arr.Value) {
    if ($r.source -eq $Source -and $r.destination -eq $Dest) { return $false }
  }
  $Arr.Value += [pscustomobject]@{ source=$Source; destination=$Dest }
  return $true
}

function Detect-NextJsAppRoot {
  param([string]$Root)
  $candidates = @(
    (Join-Path $Root "src\app"),
    (Join-Path $Root "app")
  )
  foreach ($c in $candidates) { if (Test-Path -LiteralPath $c) { return $c } }
  return $null
}

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
Info ("RepoRoot: {0}" -f $RepoRoot)
Info ("BackendBase: {0}" -f $BackendBase)

# 1) vercel.json rewrites
$vercelJsonPath = Join-Path $RepoRoot "vercel.json"
if (Test-Path -LiteralPath $vercelJsonPath) {
  Info "Found vercel.json — merging rewrites."
  $raw = Get-Content -LiteralPath $vercelJsonPath -Raw
  $obj = $raw | ConvertFrom-Json
} else {
  Info "No vercel.json — creating."
  $obj = [pscustomobject]@{}
}

if (-not ($obj.PSObject.Properties.Name -contains "rewrites")) {
  $obj | Add-Member -MemberType NoteProperty -Name rewrites -Value @()
}
if ($null -eq $obj.rewrites) { $obj.rewrites = @() }

$rew = @()
foreach ($r in $obj.rewrites) {
  if ($null -ne $r -and $r.source -and $r.destination) {
    $rew += [pscustomobject]@{ source=[string]$r.source; destination=[string]$r.destination }
  }
}

$added = 0
if (Ensure-Rewrite ([ref]$rew) "/api/admin/:path*" ("{0}/admin/:path*" -f $BackendBase)) { $added++ }
if (Ensure-Rewrite ([ref]$rew) "/admin/status"  ("{0}/admin/status"  -f $BackendBase)) { $added++ }
if (Ensure-Rewrite ([ref]$rew) "/admin/cockpit" ("{0}/admin/cockpit" -f $BackendBase)) { $added++ }
if (Ensure-Rewrite ([ref]$rew) "/admin/logout"  ("{0}/admin/logout"  -f $BackendBase)) { $added++ }
if (Ensure-Rewrite ([ref]$rew) "/debug/:path*"  ("{0}/debug/:path*"  -f $BackendBase)) { $added++ }
if (Ensure-Rewrite ([ref]$rew) "/healthz"       ("{0}/healthz"       -f $BackendBase)) { $added++ }

$obj.rewrites = $rew
Backup-File $vercelJsonPath
Write-Utf8NoBom -Path $vercelJsonPath -Text ($obj | ConvertTo-Json -Depth 50)
Ok ("Wrote vercel.json (rewrites total: {0}, added now: {1})" -f $obj.rewrites.Count, $added)

# 2) Optional Next.js embed pages
$appRoot = Detect-NextJsAppRoot -Root $RepoRoot
if ($null -eq $appRoot) {
  Warn "No Next.js app router detected — skipping /admin/cockpit + /admin/tv pages."
} else {
  Info ("Next.js app router detected: {0}" -f $appRoot)
  $cockpitPagePath = Join-Path $appRoot "admin\cockpit\page.tsx"
  $tvPagePath      = Join-Path $appRoot "admin\tv\page.tsx"

  Backup-File $cockpitPagePath
  Backup-File $tvPagePath

  $cockpitPage = @"
export const dynamic = 'force-dynamic';
export default function AdminCockpitPage() {
  const src = '/api/admin/cockpit';
  const proof = 'HIBI_LOCKIN_B_COCKPIT_20260206';
  return (
    <div style={{ height: '100vh', width: '100vw', background: '#0b0f1a' }}>
      <div style={{ padding: 12, fontFamily: 'ui-sans-serif, system-ui', color: 'white', fontSize: 12, opacity: 0.75 }}>
        Cockpit Embed • {proof}
      </div>
      <iframe
        src={src}
        style={{ border: 'none', width: '100%', height: 'calc(100vh - 40px)' }}
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
"@

  $tvPage = @"
export const dynamic = 'force-dynamic';
export default function AdminTvPage() {
  const src = '/api/admin/cockpit';
  const proof = 'HIBI_LOCKIN_B_TV_20260206';
  return (
    <div style={{ height: '100vh', width: '100vw', background: '#05070f' }}>
      <div style={{ padding: 12, fontFamily: 'ui-sans-serif, system-ui', color: 'white', fontSize: 12, opacity: 0.75 }}>
        TV • Live Ops View • {proof}
      </div>
      <iframe
        src={src}
        style={{ border: 'none', width: '100%', height: 'calc(100vh - 40px)' }}
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
"@

  Write-Utf8NoBom -Path $cockpitPagePath -Text $cockpitPage
  Write-Utf8NoBom -Path $tvPagePath -Text $tvPage
  Ok ("Wrote: {0}" -f $cockpitPagePath)
  Ok ("Wrote: {0}" -f $tvPagePath)
}

# 3) Git commit (optional)
if (-not $NoGitCommit) {
  $gitDir = Join-Path $RepoRoot ".git"
  if (Test-Path -LiteralPath $gitDir) {
    Info "Committing patch..."
    Push-Location $RepoRoot
    try {
      git add -- vercel.json | Out-Null
      if ($null -ne $appRoot) {
        git add -- (Resolve-Path -LiteralPath (Join-Path $appRoot "admin\cockpit\page.tsx")).Path 2>$null | Out-Null
        git add -- (Resolve-Path -LiteralPath (Join-Path $appRoot "admin\tv\page.tsx")).Path 2>$null | Out-Null
      }
      git commit -m "Lock B: admin door + cockpit/tv + backend rewrites" | Out-Host
      Ok "Committed."
    } catch {
      Warn "Git commit failed (non-fatal)."
    }
    Pop-Location
  } else {
    Warn "No .git folder — skipping git commit."
  }
}

Write-Host ""
Write-Host "B LOCKED. NEXT:" -ForegroundColor Yellow
Write-Host "Deploy frontend (push / Vercel deploy), then test WWW URLs:" -ForegroundColor Yellow
Write-Host "  curl.exe -I `"https://www.hibiscustoairport.co.nz/api/admin/status?ts=1`"" -ForegroundColor Yellow
Write-Host "  curl.exe -I `"https://www.hibiscustoairport.co.nz/api/admin/cockpit?ts=1`"" -ForegroundColor Yellow