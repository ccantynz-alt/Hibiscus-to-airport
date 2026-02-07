#requires -Version 5.1
[CmdletBinding()]
param(
  [string]$BackendWhichUrl = "https://api.hibiscustoairport.co.nz/debug/which",
  [string]$BackendStampUrl = "https://api.hibiscustoairport.co.nz/debug/stamp",
  [string]$FrontendPingUrl = "https://www.hibiscustoairport.co.nz/api/__ping",
  [int]$SleepSeconds = 15,
  [switch]$BeepOnRed,
  [switch]$MakeEvidenceOnRed
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Curl-Status([string]$url){
  try { return [int](Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 12).StatusCode }
  catch { return 0 }
}
function Ensure-Dir([string]$p){ if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null } }
function NowStamp(){ Get-Date -Format "yyyyMMdd_HHmmss" }

$evidenceRoot = Join-Path $PSScriptRoot "evidence"
Ensure-Dir $evidenceRoot
Write-Host ("INFO EvidenceRoot: " + $evidenceRoot) -ForegroundColor Gray

while ($true) {
  $bw = Curl-Status $BackendWhichUrl
  $bs = Curl-Status $BackendStampUrl
  $fp = Curl-Status $FrontendPingUrl

  $green = ($bw -eq 200 -and $bs -eq 200 -and $fp -eq 200)

  if ($green) {
    Write-Host ("GREEN  BE=200/200 FE=200  " + (Get-Date)) -ForegroundColor Green
  } else {
    Write-Host ("RED    BE=$bw/$bs FE=$fp  " + (Get-Date)) -ForegroundColor Red
    if ($BeepOnRed) { [console]::beep(1000,250); Start-Sleep -Milliseconds 120; [console]::beep(800,250) }
    if ($MakeEvidenceOnRed) {
      $t = NowStamp
      $p = Join-Path $evidenceRoot ("EVIDENCE_" + $t + ".txt")
      $txt = @"
BackendWhichUrl=$BackendWhichUrl
BackendStampUrl=$BackendStampUrl
FrontendPingUrl=$FrontendPingUrl
backend_which=$bw
backend_stamp=$bs
frontend_ping=$fp
time=$t
"@
      [System.IO.File]::WriteAllText($p, $txt, (New-Object System.Text.UTF8Encoding($false)))
      Write-Host ("OK   Evidence: " + $p) -ForegroundColor Green
    }
  }

  Start-Sleep -Seconds $SleepSeconds
}