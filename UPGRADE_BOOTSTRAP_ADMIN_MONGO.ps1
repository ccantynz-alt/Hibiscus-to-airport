Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "[OK]  $m" -ForegroundColor Green }
function Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Fail($m){ throw $m }

function Write-Utf8NoBom([string]$p, [string]$c){
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($p, $c, $enc)
}

$repo = "C:\Temp\repos_clean\Hibiscus-to-airport"
$target = Join-Path $repo "backend\booking_routes.py"

if (!(Test-Path -LiteralPath $repo)) { Fail "Repo not found: $repo" }
if (!(Test-Path -LiteralPath $target)) { Fail "Target not found: $target" }

Set-Location -LiteralPath $repo
Ok "Repo: $repo"
Ok "Target: $target"

# Backup
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$bak = "$target.bak_$stamp"
Copy-Item -LiteralPath $target -Destination $bak -Force
Ok "Backup created: $bak"

# Read file
$src = Get-Content -LiteralPath $target -Raw -Encoding UTF8

# Idempotency
if ($src -match "/api/admin/bootstrap") {
  Warn "Bootstrap endpoint already present. No changes made."
  exit 0
}

# Best-effort: detect collection name used near login route (db["..."])
$collection = "admins"
$loginIdx = $src.IndexOf("/api/admin/login")
if ($loginIdx -ge 0) {
  $start = [Math]::Max(0, $loginIdx - 4000)
  $chunk = $src.Substring($start, [Math]::Min(8000, $src.Length - $start))
  $m = [regex]::Matches($chunk, "db\[\s*['""](?<c>[^'""]+)['""]\s*\]")
  if ($m.Count -gt 0) { $collection = $m[$m.Count-1].Groups["c"].Value }
}
Ok "Detected admin collection (best-effort): $collection"

# Ensure required imports exist (datetime + JSONResponse)
$prepend = ""
if ($src -notmatch "from\s+datetime\s+import\s+datetime" -and $src -notmatch "import\s+datetime") {
  $prepend += "from datetime import datetime`r`n"
}
if ($src -notmatch "JSONResponse") {
  $prepend += "from fastapi.responses import JSONResponse`r`n"
}

if ($prepend.Length -gt 0) {
  if ($src -match "^\s*(from|import)\s+") {
    $lines = $src -split "`r?`n"
    $i = 0
    while ($i -lt $lines.Count -and ($lines[$i] -match "^\s*(from|import)\s+" -or $lines[$i].Trim() -eq "")) { $i++ }
    $head = ($lines[0..($i-1)] -join "`r`n")
    $tail = ($lines[$i..($lines.Count-1)] -join "`r`n")
    $src = $head + "`r`n" + $prepend + "`r`n" + $tail
  } else {
    $src = $prepend + "`r`n" + $src
  }
  Ok "Ensured required imports (datetime/JSONResponse)."
} else {
  Ok "Imports already present."
}

# Inject endpoint
$inject = @"
# === HTA BREAK-GLASS ADMIN BOOTSTRAP (token-gated) ===
# POST /api/admin/bootstrap
# Header: x-admin-token: <ADMIN_TOKEN>
# Body: { "username": "...", "password": "..." }
import os
from typing import Optional

try:
    from pydantic import BaseModel
except Exception:
    BaseModel = object

try:
    # Prefer shared hashing from auth.py to match existing login verification
    from auth import hash_password as _hash_password  # type: ignore
except Exception:
    try:
        from auth import get_password_hash as _hash_password  # type: ignore
    except Exception:
        _hash_password = None

from pymongo import MongoClient

class _BootstrapBody(BaseModel):
    username: str
    password: str

def _get_db():
    mongo_url = (os.getenv("MONGO_URL") or "").strip()
    db_name = (os.getenv("DB_NAME") or "hibiscustoairport").strip()
    if not mongo_url:
        raise RuntimeError("MONGO_URL is not set")
    client = MongoClient(mongo_url)
    return client[db_name]

@router.post("/api/admin/bootstrap")
async def admin_bootstrap(body: _BootstrapBody, x_admin_token: Optional[str] = None):
    expected = (os.getenv("ADMIN_TOKEN") or "").strip()
    provided = (x_admin_token or "").strip()
    if (not expected) or (provided != expected):
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    if _hash_password is None:
        return JSONResponse(status_code=500, content={"detail": "Password hashing not configured (auth.py hash function not found)"})

    db = _get_db()
    admins = db["$collection"]

    pwd_hash = _hash_password(body.password)
    now = datetime.utcnow()

    admins.update_one(
        {"username": body.username},
        {"$set": {"username": body.username, "password_hash": pwd_hash, "updated_at": now},
         "$setOnInsert": {"created_at": now}},
        upsert=True
    )

    return {"ok": True, "username": body.username}
# === END BREAK-GLASS ADMIN BOOTSTRAP ===
"@

$src2 = $src.TrimEnd() + "`r`n`r`n" + $inject.TrimStart()
Write-Utf8NoBom $target $src2
Ok "Patched: backend\booking_routes.py"

$check = Get-Content -LiteralPath $target -Raw -Encoding UTF8
if ($check -notmatch "/api/admin/bootstrap") { Fail "Patch failed: endpoint not found after write." }
Ok "Verified bootstrap endpoint is present."

Write-Host ""
Write-Host "NEXT:" -ForegroundColor Yellow
Write-Host "1) Commit + push. Redeploy/restart Render backend." -ForegroundColor Yellow
Write-Host "2) Call POST /api/admin/bootstrap with x-admin-token header to set admin password." -ForegroundColor Yellow
Write-Host ""
Write-Host "Bootstrap call template (fill in locally; DO NOT paste secrets into chat):" -ForegroundColor Yellow
Write-Host '$base="https://hibiscustoairport-backend.onrender.com"' -ForegroundColor Yellow
Write-Host '$adminToken="PASTE_ADMIN_TOKEN_FROM_RENDER"' -ForegroundColor Yellow
Write-Host '$body=@{ username="admin"; password="SET_NEW_PASSWORD" } | ConvertTo-Json -Compress' -ForegroundColor Yellow
Write-Host 'curl.exe -S -s -D - --max-time 15 -X POST "$base/api/admin/bootstrap" -H "Content-Type: application/json" -H "x-admin-token: $adminToken" -d $body' -ForegroundColor Yellow