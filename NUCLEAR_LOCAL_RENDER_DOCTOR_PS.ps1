Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Repo = "C:\Temp\repos_clean\Hibiscus-to-airport"
Set-Location $Repo

Write-Host "`n☢️ NUCLEAR LOCAL RENDER DOCTOR (POWERSHELL SAFE)" -ForegroundColor Cyan
Write-Host "Repo: $Repo"
Write-Host "Time: $(Get-Date)"

Write-Host "`n=== 0) Python version ===" -ForegroundColor Yellow
python --version

Write-Host "`n=== 1) Syntax check (compileall backend) ===" -ForegroundColor Yellow
python -m compileall ".\backend" -q
Write-Host "✅ compileall passed" -ForegroundColor Green

$tmp = Join-Path $Repo "_doctor_tmp"
New-Item -ItemType Directory -Path $tmp -Force | Out-Null

$pyA = @"
import sys, traceback
print("Python:", sys.version)
try:
    import backend.server as s
    print("IMPORT_OK_FILE:", getattr(s, "__file__", None))
    print("HAS_APP:", hasattr(s, "app"))
    if not hasattr(s, "app"):
        raise RuntimeError("backend.server imported but has no 'app' attribute")
except Exception as e:
    print("IMPORT_FAILED:", repr(e))
    traceback.print_exc()
    raise
"@

$pathA = Join-Path $tmp "doctor_import_backend_server.py"
Set-Content -Path $pathA -Value $pyA -Encoding UTF8

Write-Host "`n=== 2) Import backend.server (Render-style) ===" -ForegroundColor Yellow
python $pathA

$pyB = @"
from backend.server import app
paths = []
for r in app.router.routes:
    p = getattr(r, "path", "")
    if p:
        paths.append(p)

paths = sorted(set(paths))
hits = [p for p in paths if p.startswith("/admin") or ("cockpit" in p) or ("agent" in p)]

print("TOTAL_ROUTES:", len(paths))
print("MATCHING_ROUTES:", len(hits))
for p in hits:
    print(p)
"@

$pathB = Join-Path $tmp "doctor_list_routes.py"
Set-Content -Path $pathB -Value $pyB -Encoding UTF8

Write-Host "`n=== 3) List admin/cockpit/agent routes ===" -ForegroundColor Yellow
python $pathB

Write-Host "`n☢️ DOCTOR COMPLETE — if steps 1-3 pass, Render should build." -ForegroundColor Cyan
