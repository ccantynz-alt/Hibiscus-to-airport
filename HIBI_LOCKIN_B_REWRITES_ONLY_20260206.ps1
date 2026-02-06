param(
  [string] $RepoRoot = "C:\Temp\repos_clean\Hibiscus-to-airport",
  [string] $BackendBase = "https://api.hibiscustoairport.co.nz"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Info($m){ Write-Host ("INFO {0}" -f $m) -ForegroundColor Cyan }

function Write-Utf8NoBom {
  param([string]$Path,[string]$Text)
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Text, $enc)
}

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
Info ("RepoRoot: {0}" -f $RepoRoot)

$vercelJsonPath = Join-Path $RepoRoot "vercel.json"

$rewrites = @(
  @{ source="/api/admin/:path*"; destination="$BackendBase/admin/:path*" },
  @{ source="/admin/status";    destination="$BackendBase/admin/status" },
  @{ source="/admin/cockpit";   destination="$BackendBase/admin/cockpit" },
  @{ source="/admin/logout";    destination="$BackendBase/admin/logout" },
  @{ source="/debug/:path*";    destination="$BackendBase/debug/:path*" },
  @{ source="/healthz";         destination="$BackendBase/healthz" }
)

$obj = @{
  rewrites = $rewrites
}

$json = $obj | ConvertTo-Json -Depth 10
Write-Utf8NoBom -Path $vercelJsonPath -Text $json

Ok "vercel.json written with admin rewrites."
Write-Host ""
Write-Host "NEXT:" -ForegroundColor Yellow
Write-Host "1) Deploy frontend" -ForegroundColor Yellow
Write-Host "2) Test:" -ForegroundColor Yellow
Write-Host "   curl.exe -I https://www.hibiscustoairport.co.nz/api/admin/status" -ForegroundColor Yellow