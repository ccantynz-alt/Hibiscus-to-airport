Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== CHECK_MONGO_BOOKINGS ===" -ForegroundColor Cyan
Write-Host ""

# 1) Confirm mongosh exists
$mongosh = Get-Command mongosh -ErrorAction SilentlyContinue
if (-not $mongosh) {
  Write-Host "ERROR: 'mongosh' is not installed or not on PATH." -ForegroundColor Red
  Write-Host ""
  Write-Host "Fast fixes:" -ForegroundColor Yellow
  Write-Host "  A) Use MongoDB Atlas -> Browse Collections (browser UI), OR"
  Write-Host "  B) Install MongoDB Compass (GUI), OR"
  Write-Host "  C) Install mongosh, then re-run this script."
  Write-Host ""
  throw "mongosh not found"
}

# 2) Ask for Atlas connection string + optional DB name
Write-Host "Paste your Atlas connection string (it starts with mongodb+srv:// ...)" -ForegroundColor Yellow
$MONGO_URI = Read-Host "MONGO_URI"

if ([string]::IsNullOrWhiteSpace($MONGO_URI)) { throw "MONGO_URI was empty" }

Write-Host ""
Write-Host "If you KNOW your database name, paste it now. Otherwise press Enter." -ForegroundColor Yellow
$DB = Read-Host "DB_NAME (optional)"

# Helper: run mongosh command
function Run-Mongo([string]$eval) {
  & mongosh $MONGO_URI --quiet --eval $eval 2>&1
}

Write-Host ""
Write-Host "Step 1/4: Listing databases..." -ForegroundColor Cyan
$showDbs = Run-Mongo "show dbs"
$showDbs | ForEach-Object { $_ }
Write-Host ""

# If DB not provided, try to infer a likely DB by finding non-system DBs
if ([string]::IsNullOrWhiteSpace($DB)) {
  Write-Host "No DB name provided. We'll try common DB names and also let you choose." -ForegroundColor Yellow
  Write-Host ""

  $candidates = @("hibiscus","production","prod","app","main","database","db","test","staging")

  foreach ($cand in $candidates) {
    Write-Host ("Trying DB: " + $cand) -ForegroundColor DarkCyan
    $cols = Run-Mongo "db = db.getSiblingDB('$cand'); db.getCollectionNames()"
    if ($cols -match '\[' -or $cols -match '"') {
      # If it returned something list-ish, keep it
      Write-Host "Collections:" -ForegroundColor Green
      $cols | ForEach-Object { $_ }
      Write-Host ""
    }
  }

  Write-Host "If you saw a DB above with collections, re-run and enter that DB name." -ForegroundColor Yellow
  Write-Host "For now, we will continue ONLY if you enter a DB name." -ForegroundColor Yellow
  Write-Host ""
  throw "DB_NAME not provided. Re-run and paste the DB name that contains your collections."
}

Write-Host ""
Write-Host ("Step 2/4: Listing collections in DB: " + $DB) -ForegroundColor Cyan
$collections = Run-Mongo "db = db.getSiblingDB('$DB'); db.getCollectionNames()"
$collections | ForEach-Object { $_ }
Write-Host ""

# 3) Try common booking collection names automatically
$tryCols = @(
  "bookings",
  "booking",
  "orders",
  "order",
  "reservations",
  "reservation",
  "rides",
  "ride",
  "payments",
  "payment",
  "checkouts",
  "checkoutSessions",
  "stripeEvents"
)

Write-Host "Step 3/4: Searching common booking collections..." -ForegroundColor Cyan
foreach ($c in $tryCols) {
  Write-Host ("--- Checking collection: " + $c) -ForegroundColor DarkCyan

  # Count documents (safe)
  $countOut = Run-Mongo "db = db.getSiblingDB('$DB'); (db.getCollectionNames().includes('$c') ? db['$c'].countDocuments({}) : 'MISSING')"
  $countOut | ForEach-Object { $_ }

  # Print latest 5 docs if exists
  $latestOut = Run-Mongo "db = db.getSiblingDB('$DB'); if (db.getCollectionNames().includes('$c')) { db['$c'].find({}).sort({_id:-1}).limit(5).pretty() } else { '' }"
  $latestOut | ForEach-Object { $_ }

  Write-Host ""
}

Write-Host "Step 4/4: Done." -ForegroundColor Cyan
Write-Host "If you paste the output here (you can redact private fields), I will tell you EXACTLY where bookings are." -ForegroundColor Green
