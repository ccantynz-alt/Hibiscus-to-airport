Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ========= CONFIG =========
$RepoPath = "C:\Temp\repos_clean\Hibiscus-to-airport"
$Base = "https://api.hibiscustoairport.co.nz"
$PollSeconds = 20
$MaxMinutes = 90

# Optional: run these once stamp flips
$RunRepairPack = $true
$RunPatchBuilder = $true

# Deploy hook should be stored as env var (safer)
$DeployHook = $env:HIBISCUS_RENDER_DEPLOY_HOOK
if ([string]::IsNullOrWhiteSpace($DeployHook)) {
  throw "Missing env var HIBISCUS_RENDER_DEPLOY_HOOK. Set it first."
}

# ========= LOG =========
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$LogPath = "C:\Temp\HIBISCUS_AUTO_FINISH_$ts.log"
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $LogPath) | Out-Null

function Log([string]$Msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Msg
  $line | Tee-Object -FilePath $LogPath -Append
}

function CurlText([string]$Url, [int]$MaxTimeSec = 25) {
  & curl.exe -S -s -D - --max-time $MaxTimeSec `
    -H "cache-control: no-cache" `
    -H "pragma: no-cache" `
    $Url
}

function ExtractStamp([string]$CurlOutput) {
  $m = [regex]::Match($CurlOutput, '"stamp"\s*:\s*"([^"]+)"')
  if ($m.Success) { return $m.Groups[1].Value }
  return ""
}

function GetExpectedStampFromRepo([string]$Path) {
  # Searches repo for newest RENDER_STAMP_... occurrence
  if (-not (Test-Path $Path)) { throw "RepoPath not found: $Path" }

  $matches = Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Length -lt 5MB } |
    ForEach-Object {
      try {
        Select-String -Path $_.FullName -Pattern "RENDER_STAMP_[0-9]{8}_[0-9]{6}" -AllMatches -ErrorAction SilentlyContinue |
          ForEach-Object { $_.Matches } |
          ForEach-Object { $_.Value }
      } catch { }
    }

  $unique = $matches | Where-Object { $_ } | Select-Object -Unique
  if (-not $unique) { return "" }

  # pick lexicographically max => newest based on your stamp format
  return ($unique | Sort-Object)[-1]
}

function Probe([string]$Path, [int]$FirstLines = 60) {
  $url = "{0}{1}" -f $Base, $Path
  Log "PROBE $Path => $url"
  $resp = CurlText $url
  ($resp -split "`n" | Select-Object -First $FirstLines) | ForEach-Object { Log ("  " + $_.TrimEnd("`r")) }
  return $resp
}

Log "HIBISCUS AUTO-FINISH START"
Log "RepoPath: $RepoPath"
Log "Base: $Base"
Log "Log: $LogPath"
Log ""

$ExpectedStamp = GetExpectedStampFromRepo $RepoPath
if ([string]::IsNullOrWhiteSpace($ExpectedStamp)) {
  Log "ERROR: Could not find any RENDER_STAMP_########_###### in repo."
  throw "Expected stamp not found in repo. Confirm stamp exists in code and rerun."
}
Log "ExpectedStamp (from repo): $ExpectedStamp"

$deadline = (Get-Date).AddMinutes($MaxMinutes)

while ((Get-Date) -lt $deadline) {
  $out = Probe "/debug/stamp" 40
  $prodStamp = ExtractStamp $out

  if ([string]::IsNullOrWhiteSpace($prodStamp)) {
    Log "WARN: Could not parse stamp from production response."
    Start-Sleep -Seconds $PollSeconds
    continue
  }

  if ($prodStamp -eq $ExpectedStamp) {
    Log "✅ STAMP MATCH: prod=$prodStamp (updated)"
    break
  }

  Log "STAMP MISMATCH: prod=$prodStamp expected=$ExpectedStamp"
  Log "Triggering Render deploy hook (service deploy)..."
  try {
    $deployResp = CurlText $DeployHook 25
    ($deployResp -split "`n" | Select-Object -First 30) | ForEach-Object { Log ("  " + $_.TrimEnd("`r")) }
  } catch {
    Log ("ERROR calling deploy hook: " + $_.Exception.Message)
  }

  Log "Sleeping $PollSeconds seconds..."
  Start-Sleep -Seconds $PollSeconds
}

if ((Get-Date) -ge $deadline) {
  Log "❌ TIMEOUT: stamp did not flip within $MaxMinutes minutes."
  Log "This means: wrong Render service behind the domain, or deploys are failing/rolling back."
  Log "Next: In Render, open the service that OWNS custom domain api.hibiscustoairport.co.nz and deploy there."
  throw "Auto-finish timed out."
}

Log ""
Log "=== COCKPIT CHECKS ==="
Probe "/__cockpit_stamp__" 60 | Out-Null
Probe "/agent-cockpit" 60 | Out-Null
Probe "/api/cockpit/state" 80 | Out-Null

Log ""
Log "=== OPTIONAL AGENT ACTIONS ==="
if ($RunRepairPack) { Probe "/api/agents/repair" 120 | Out-Null } else { Log "Skipping /api/agents/repair" }
if ($RunPatchBuilder) { Probe "/api/agents/patch-builder" 120 | Out-Null } else { Log "Skipping /api/agents/patch-builder" }

Log ""
Log "HIBISCUS AUTO-FINISH END (success). Log: $LogPath"
