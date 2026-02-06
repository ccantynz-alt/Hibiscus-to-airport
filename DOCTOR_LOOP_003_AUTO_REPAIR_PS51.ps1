Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [string]$BackendOrigin = "https://api.hibiscustoairport.co.nz",
  [string]$FrontendOrigin = "https://www.hibiscustoairport.co.nz",
  [int]$LoopSleepSeconds = 20,
  [int]$FastSleepSeconds = 10,
  [int]$VerifyTimeoutSeconds = 900,
  [switch]$NoPR
)

function Ok([string]$m){ Write-Host "OK   $m" -ForegroundColor Green }
function Info([string]$m){ Write-Host "INFO $m" -ForegroundColor Gray }
function Warn([string]$m){ Write-Host "WARN $m" -ForegroundColor Yellow }

function Assert-Exe([string]$name, [switch]$Optional){
  $c = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $c) {
    if ($Optional) { return $false }
    throw "Required command not found on PATH: $name"
  }
  return $true
}

function Invoke-Http([string]$url){
  try {
    return Invoke-WebRequest -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop -Uri $url
  } catch {
    $resp = $_.Exception.Response
    if ($resp -and $resp.GetResponseStream) {
      try {
        $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $txt = $sr.ReadToEnd()
        return @{ StatusCode = [int]$resp.StatusCode; Content = $txt; Headers = $resp.Headers }
      } catch {}
    }
    return @{ StatusCode = -1; Content = $_.Exception.Message; Headers = @{} }
  }
}

function Get-Header([object]$r, [string]$name){
  try { if ($r -and $r.Headers) { $v = $r.Headers[$name]; if ($v) { return [string]$v } } } catch {}
  return ""
}

function Looks-Like-Html([object]$r){
  $ct = Get-Header $r "Content-Type"
  $body = ""
  try { $body = [string]$r.Content } catch {}
  if ($ct -match "text/html") { return $true }
  if ($body -match "<html") { return $true }
  if ($body -match "<title") { return $true }
  return $false
}

function Classify-FrontendAdmin([object]$r){
  if (Looks-Like-Html $r) { return "FRONTEND_PROXY_MISSING_OR_BYPASSED" }
  $sc = [int]$r.StatusCode
  if ($sc -ge 200 -and $sc -lt 300) { return "FRONTEND_EDGE_OK" }
  if ($sc -eq 404) { return "FRONTEND_EDGE_404" }
  if ($sc -ge 500) { return "FRONTEND_EDGE_5XX" }
  if ($sc -lt 0) { return "FRONTEND_EDGE_TIMEOUT_OR_NETWORK" }
  return "FRONTEND_EDGE_OTHER"
}

function Classify-Backend([object]$r){
  $sc = [int]$r.StatusCode
  if ($sc -ge 200 -and $sc -lt 300) { return "BACKEND_OK" }
  if ($sc -eq 404) { return "BACKEND_ROUTE_MISSING" }
  if ($sc -ge 500) { return "BACKEND_5XX" }
  if ($sc -lt 0) { return "BACKEND_TIMEOUT_OR_NETWORK" }
  return "BACKEND_OTHER"
}

function Write-Utf8NoBom([string]$Path,[string]$Content){
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Ensure-AdminProxy {
  # Creates either Next pages/api route or Vercel /api function
  $pkgPath = Join-Path (Get-Location).Path "package.json"
  $isNext = $false
  if (Test-Path -LiteralPath $pkgPath) {
    try {
      $pkg = (Get-Content -LiteralPath $pkgPath -Raw | ConvertFrom-Json)
      if ($pkg.dependencies -and $pkg.dependencies.next) { $isNext = $true }
      if ($pkg.devDependencies -and $pkg.devDependencies.next) { $isNext = $true }
    } catch {}
  }

  if ($isNext) {
    $useTs = (Test-Path -LiteralPath ".\tsconfig.json")

    if (Test-Path -LiteralPath ".\src\pages") { $base = ".\src\pages" }
    elseif (Test-Path -LiteralPath ".\pages") { $base = ".\pages" }
    else { $base = ".\src\pages" }

    if ($useTs) { $ext = "ts" } else { $ext = "js" }

    $path = Join-Path $base ("api\admin\[...path]." + $ext)

    $code = @"
import type { NextApiRequest, NextApiResponse } from "next";
export const config = { api: { bodyParser: false } };
function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backend = (process.env.HIBI_BACKEND_ORIGIN || "${BackendOrigin}").replace(/\/$/, "");
  const parts = (req.query.path || []) as string[];
  const rest = parts.join("/");
  const q = req.url?.includes("?") ? req.url.substring(req.url.indexOf("?")) : "";
  const targetUrl = backend + "/admin/" + rest + q;

  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (!v) continue;
    const key = k.toLowerCase();
    if (key === "host" || key === "connection" || key === "content-length") continue;
    headers[key] = Array.isArray(v) ? v.join(",") : String(v);
  }

  const injected = process.env.HIBI_ADMIN_PROXY_ADMIN_KEY;
  if (injected && !headers["x-admin-key"]) headers["x-admin-key"] = injected;

  const method = (req.method || "GET").toUpperCase();
  const body = (method === "GET" || method === "HEAD") ? undefined : await readRawBody(req);

  const r = await fetch(targetUrl, { method, headers, body: body as any, redirect: "manual" });
  res.status(r.status);
  r.headers.forEach((value, key) => { if (key.toLowerCase() !== "transfer-encoding") { try { res.setHeader(key, value); } catch {} } });
  const buf = Buffer.from(await r.arrayBuffer());
  res.send(buf);
}
"@

    Write-Utf8NoBom -Path $path -Content $code
    return $path
  }

  $path2 = ".\api\admin\[...path].js"
  $code2 = @"
export default async function handler(req, res) {
  const backend = (process.env.HIBI_BACKEND_ORIGIN || "${BackendOrigin}").replace(/\/$/, "");
  const rest = (req.query?.path ? (Array.isArray(req.query.path) ? req.query.path.join("/") : String(req.query.path)) : "");
  const q = req.url && req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "";
  const targetUrl = backend + "/admin/" + rest + q;

  const headers = {};
  for (const [k, v] of Object.entries(req.headers || {})) {
    if (!v) continue;
    const key = String(k).toLowerCase();
    if (key === "host" || key === "connection" || key === "content-length") continue;
    headers[key] = Array.isArray(v) ? v.join(",") : String(v);
  }

  const injected = process.env.HIBI_ADMIN_PROXY_ADMIN_KEY;
  if (injected && !headers["x-admin-key"]) headers["x-admin-key"] = injected;

  const method = String(req.method || "GET").toUpperCase();
  const body = (method === "GET" || method === "HEAD") ? undefined : req.body;

  const r = await fetch(targetUrl, { method, headers, body, redirect: "manual" });
  res.statusCode = r.status;
  r.headers.forEach((value, key) => { if (key.toLowerCase() !== "transfer-encoding") { try { res.setHeader(key, value); } catch {} } });
  const buf = Buffer.from(await r.arrayBuffer());
  res.end(buf);
}
"@
  Write-Utf8NoBom -Path $path2 -Content $code2
  return $path2
}

function Repair-FrontendProxy {
  Assert-Exe git | Out-Null
  $branch = "doctor/fix-admin-proxy-" + (Get-Date -Format "yyyyMMdd-HHmmss")

  $porc = (git status --porcelain)
  if ($porc -and $porc.Trim()) {
    Warn "Working tree dirty; stashing before repair..."
    git stash push -u -m ("doctorloop-auto-stash " + (Get-Date -Format s)) | Out-Null
  }

  git checkout -B $branch | Out-Null

  $proxyPath = Ensure-AdminProxy
  Ok ("Proxy ensured: " + $proxyPath)

  git add --all | Out-Null
  $staged = (git diff --cached --name-only)
  if ($staged -and $staged.Trim()) {
    git commit -m "Doctor: proxy /api/admin/* to backend /admin/*" | Out-Null
    Ok "Committed."
  } else {
    Warn "No changes staged (already present)."
  }

  git push -u origin $branch | Out-Null
  Ok ("Pushed: " + $branch)

  if (-not $NoPR) {
    $gh = Get-Command gh -ErrorAction SilentlyContinue
    if ($gh) {
      try { $null = gh auth status 2>$null } catch { $gh = $null }
    }
    if ($gh) {
      try { $null = gh pr create --fill 2>$null } catch { Warn "PR create failed (may already exist)." }
      try { $null = gh pr merge --auto --merge --delete-branch 2>$null } catch { Warn "Auto-merge failed (checks?)" }
    } else {
      Warn "gh not ready; skipping PR/merge."
    }
  }

  $deadline = (Get-Date).AddSeconds($VerifyTimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    $tsv = [int](Get-Date -UFormat %s)
    $r = Invoke-Http ("$FrontendOrigin/api/admin/logout?ts=$tsv")
    $cls = Classify-FrontendAdmin $r
    Info ("VERIFY logout => " + $r.StatusCode + " => " + $cls)
    if ($cls -ne "FRONTEND_PROXY_MISSING_OR_BYPASSED") {
      Ok "VERIFY OK (not HTML)."
      return
    }
    Start-Sleep -Seconds $FastSleepSeconds
  }
  Warn "VERIFY TIMEOUT (still HTML)."
}

Ok "DOCTOR_LOOP_003 (PS5.1) starting"
Info ("BackendOrigin : " + $BackendOrigin)
Info ("FrontendOrigin: " + $FrontendOrigin)

while ($true) {
  $ts = [int](Get-Date -UFormat %s)
  Write-Host ""
  Info ("=== DOCTOR_LOOP_003 ts=" + $ts + " ===")

  $bHealth = Invoke-Http ("$BackendOrigin/healthz?ts=$ts")
  $bClass  = Classify-Backend $bHealth

  $fLogout = Invoke-Http ("$FrontendOrigin/api/admin/logout?ts=$ts")
  $fClass  = Classify-FrontendAdmin $fLogout

  Info ("Backend healthz : " + $bHealth.StatusCode + " => " + $bClass)
  Info ("Frontend logout : " + $fLogout.StatusCode + " => " + $fClass)

  if ($fClass -eq "FRONTEND_PROXY_MISSING_OR_BYPASSED") {
    Warn "DIAGNOSIS: Frontend is serving HTML for /api/admin/*"
    Repair-FrontendProxy
    Start-Sleep -Seconds $FastSleepSeconds
    continue
  }

  if ($bClass -ne "BACKEND_OK") {
    Warn "Backend unhealthy (this loop does not control Render deploy without credentials)."
  } else {
    Ok "Healthy enough."
  }

  Start-Sleep -Seconds $LoopSleepSeconds
}