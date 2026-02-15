# backend/admin_routes.py
# FINISH_TODAY_B_ADMIN_LOGIN

import os
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from fastapi import APIRouter, Request, Response, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse

from config_env import env_presence_report, get_db_name, get_mongo_url_with_source

logger = logging.getLogger(__name__)

router = APIRouter()

ADMIN_COOKIE = "d8_admin"
ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY", "").strip()

def _is_authed(req: Request) -> bool:
    # allow either cookie or header for automation
    if ADMIN_API_KEY == "":
        return False
    h = (req.headers.get("X-Admin-Key") or "").strip()
    if h and h == ADMIN_API_KEY:
        return True
    c = (req.cookies.get(ADMIN_COOKIE) or "").strip()
    return c == ADMIN_API_KEY

def _require(req: Request):
    if not _is_authed(req):
        return False
    return True

@router.get("/admin/login", response_class=HTMLResponse)
def admin_login_get():
    return HTMLResponse("""<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Edmund Admin Login</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; padding:24px; max-width:820px; margin:0 auto;}
    .card{border:1px solid #e5e7eb; border-radius:14px; padding:18px;}
    input{width:100%; padding:12px; border-radius:10px; border:1px solid #d1d5db; margin-top:8px;}
    button{margin-top:12px; padding:12px 14px; border-radius:10px; border:0; background:#111827; color:#fff; cursor:pointer;}
    .hint{color:#6b7280; font-size:13px; margin-top:10px;}
  </style>
</head>
<body>
  <h1>Edmund Admin</h1>
  <div class="card">
    <form method="post" action="/admin/login">
      <label>Admin Key</label>
      <input name="key" type="password" placeholder="paste ADMIN_API_KEY" autocomplete="current-password" />
      <button type="submit">Login</button>
      <div class="hint">Uses ADMIN_API_KEY from Render env. Sets a cookie for this browser.</div>
    </form>
  </div>
</body>
</html>""")

@router.post("/admin/login")
def admin_login_post(key: str = Form(...)):
    k = (key or "").strip()
    if ADMIN_API_KEY == "" or k != ADMIN_API_KEY:
        return HTMLResponse("<h3>401 Unauthorized</h3><p>Key mismatch.</p><p><a href='/admin/login'>Back</a></p>", status_code=401)
    resp = RedirectResponse(url="/admin", status_code=302)
    resp.set_cookie(key=ADMIN_COOKIE, value=ADMIN_API_KEY, httponly=True, samesite="lax", secure=True)
    return resp

@router.get("/admin/logout")
def admin_logout():
    resp = RedirectResponse(url="/admin/login", status_code=302)
    resp.delete_cookie(ADMIN_COOKIE)
    return resp

@router.get("/admin", response_class=HTMLResponse)
def admin_shell(req: Request):
    if not _require(req):
        return RedirectResponse(url="/admin/login", status_code=302)

    return HTMLResponse("""<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Edmund Panel</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; margin:0;}
    header{display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid #e5e7eb;}
    .tabs{display:flex; gap:10px; padding:10px 18px; border-bottom:1px solid #e5e7eb;}
    .tab{padding:10px 12px; border-radius:10px; border:1px solid #e5e7eb; background:#fff; cursor:pointer;}
    .tab.active{background:#111827; color:#fff; border-color:#111827;}
    main{padding:0; height:calc(100vh - 110px);}
    iframe{width:100%; height:100%; border:0;}
    .right a{color:#111827; text-decoration:none; font-size:14px;}
    .meta{color:#6b7280; font-size:13px;}
  </style>
</head>
<body>
  <header>
    <div>
      <div style="font-weight:700;">Edmund Panel</div>
      <div class="meta">Admin + Cockpit + Booking Form Editor + Recovery</div>
    </div>
    <div class="right"><a href="/admin/logout">Logout</a></div>
  </header>

  <div class="tabs">
    <button class="tab active" data-url="/admin/bookings-view">Bookings</button>
    <button class="tab" data-url="/admin/cockpit">Cockpit</button>
    <button class="tab" data-url="/admin/booking-form">Booking Form</button>
    <button class="tab" data-url="/admin/mongo-scan">Recovery</button>
    <button class="tab" data-url="/admin/diagnostics">Diagnostics</button>
    <button class="tab" data-url="/admin/status">Status</button>
  </div>

  <main>
    <iframe id="frame" src="/admin/bookings-view"></iframe>
  </main>

<script>
  const tabs=[...document.querySelectorAll('.tab')];
  const frame=document.getElementById('frame');
  tabs.forEach(t=>{
    t.addEventListener('click', ()=>{
      tabs.forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      frame.src = t.dataset.url;
    });
  });
</script>
</body>
</html>""")

@router.get("/admin/bookings-view", response_class=HTMLResponse)
def admin_bookings_view(req: Request):
    if not _require(req):
        return RedirectResponse(url="/admin/login", status_code=302)

    return HTMLResponse("""<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Bookings</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; padding:18px; margin:0;}
    h2{margin:0 0 6px 0;}
    .meta{color:#6b7280; font-size:13px; margin-bottom:14px;}
    .row-bar{display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; align-items:center;}
    button{padding:8px 14px; border-radius:10px; border:1px solid #e5e7eb; background:#111827; color:#fff; cursor:pointer; font-size:13px;}
    input{padding:8px 12px; border-radius:10px; border:1px solid #d1d5db; font-size:13px;}
    table{width:100%; border-collapse:collapse; font-size:13px;}
    th{background:#f8fafc; text-align:left; padding:10px 8px; border-bottom:2px solid #e5e7eb; white-space:nowrap;}
    td{padding:8px; border-bottom:1px solid #f1f5f9; vertical-align:top;}
    tr:hover td{background:#f8fafc;}
    .badge{display:inline-block; padding:3px 8px; border-radius:8px; font-size:11px; font-weight:600;}
    .badge-pending{background:#fef3c7; color:#92400e;}
    .badge-confirmed{background:#d1fae5; color:#065f46;}
    .badge-cancelled{background:#fee2e2; color:#991b1b;}
    .badge-paid{background:#d1fae5; color:#065f46;}
    .badge-unpaid{background:#fee2e2; color:#991b1b;}
    .stats{display:flex; gap:12px; flex-wrap:wrap; margin-bottom:14px;}
    .stat{padding:12px 16px; border:1px solid #e5e7eb; border-radius:12px; min-width:120px;}
    .stat-val{font-size:22px; font-weight:700;}
    .stat-label{font-size:11px; color:#6b7280; margin-top:2px;}
    #error{color:#dc2626; margin-top:10px; display:none;}
    .empty{text-align:center; padding:40px; color:#6b7280;}
  </style>
</head>
<body>
  <h2>Bookings</h2>
  <div class="meta">Live from database (Active/Deleted). Auto-refreshes every 30s.</div>

  <div class="stats" id="stats"></div>

  <div class="row-bar">
    <input id="search" type="text" placeholder="Search name, email, ref..." oninput="applyFilter()" />
    <select id="statusFilter" onchange="applyFilter()" style="padding:8px 12px; border-radius:10px; border:1px solid #d1d5db; font-size:13px;">
      <option value="all">All statuses</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="cancelled">Cancelled</option>
    </select>
    <select id="sourceFilter" onchange="loadBookings()" style="padding:8px 12px; border-radius:10px; border:1px solid #d1d5db; font-size:13px;">
      <option value="active" selected>Active</option>
      <option value="deleted">Deleted</option>
    </select>
    <button onclick="loadBookings()">Refresh</button>
  </div>

  <div id="error"></div>
  <div id="table-wrap"></div>

<script>
let ALL = [];
const QP = new URLSearchParams(window.location.search);
const DB = QP.get('db');              // optional override for recovery
const COLLECTION = QP.get('collection'); // optional override for recovery

function apiUrl(){
  const which = (document.getElementById('sourceFilter')?.value) || 'active';
  const p = new URLSearchParams();
  p.set('ts', String(Date.now()));
  p.set('which', which);
  if(DB) p.set('db', DB);
  if(COLLECTION) p.set('collection', COLLECTION);
  return '/api/admin/bookings-list?' + p.toString();
}

async function loadBookings(){
  const wrap = document.getElementById('table-wrap');
  const err = document.getElementById('error');
  err.style.display='none';
  wrap.innerHTML = '<div class="empty">Loading bookings...</div>';
  try {
    const r = await fetch(apiUrl());
    if(!r.ok) throw new Error('HTTP '+r.status);
    const data = await r.json();
    ALL = data.items || [];
    renderStats();
    applyFilter();
  } catch(e){
    err.textContent = 'Failed to load bookings: '+String(e);
    err.style.display = 'block';
    wrap.innerHTML = '<div class="empty">Could not load bookings.</div>';
  }
}

function renderStats(){
  const s = document.getElementById('stats');
  const total = ALL.length;
  const pending = ALL.filter(b=>b.status==='pending').length;
  const confirmed = ALL.filter(b=>b.status==='confirmed').length;
  const revenue = ALL.filter(b=>b.payment_status==='paid').reduce((s,b)=>s+(b.totalPrice||0),0);
  s.innerHTML = `
    <div class="stat"><div class="stat-val">${total}</div><div class="stat-label">Total</div></div>
    <div class="stat"><div class="stat-val">${pending}</div><div class="stat-label">Pending</div></div>
    <div class="stat"><div class="stat-val">${confirmed}</div><div class="stat-label">Confirmed</div></div>
    <div class="stat"><div class="stat-val">$${revenue.toFixed(0)}</div><div class="stat-label">Revenue (paid)</div></div>
  `;
}

function applyFilter(){
  const term = (document.getElementById('search').value||'').toLowerCase();
  const status = document.getElementById('statusFilter').value;
  let list = ALL;
  if(status!=='all') list = list.filter(b=>b.status===status);
  if(term) list = list.filter(b=>
    (b.name||'').toLowerCase().includes(term) ||
    (b.email||'').toLowerCase().includes(term) ||
    (b.phone||'').toLowerCase().includes(term) ||
    (b.booking_ref||'').toLowerCase().includes(term) ||
    (b.pickupAddress||'').toLowerCase().includes(term) ||
    (b.dropoffAddress||'').toLowerCase().includes(term)
  );
  renderTable(list);
}

function badge(val, type){
  const cls = type==='status'
    ? (val==='confirmed'?'badge-confirmed':val==='cancelled'?'badge-cancelled':'badge-pending')
    : (val==='paid'?'badge-paid':'badge-unpaid');
  return '<span class="badge '+cls+'">'+(val||'n/a')+'</span>';
}

function renderTable(list){
  const wrap = document.getElementById('table-wrap');
  if(!list.length){
    wrap.innerHTML = '<div class="empty">No bookings found.</div>';
    return;
  }
  let html = '<table><thead><tr>';
  html += '<th>Ref</th><th>Date</th><th>Time</th><th>Customer</th><th>Phone</th>';
  html += '<th>Pickup</th><th>Dropoff</th><th>Pax</th><th>Price</th>';
  html += '<th>Status</th><th>Payment</th>';
  html += '</tr></thead><tbody>';
  for(const b of list){
    html += '<tr>';
    html += '<td><b>'+(b.booking_ref||'-')+'</b></td>';
    html += '<td>'+(b.date||'-')+'</td>';
    html += '<td>'+(b.time||'-')+'</td>';
    html += '<td>'+(b.name||'-')+'<br><span style="color:#6b7280;font-size:11px;">'+(b.email||'')+'</span></td>';
    html += '<td>'+(b.phone||'-')+'</td>';
    html += '<td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;">'+(b.pickupAddress||'-')+'</td>';
    html += '<td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;">'+(b.dropoffAddress||'-')+'</td>';
    html += '<td>'+(b.passengers||'-')+'</td>';
    html += '<td>$'+(b.totalPrice||b.pricing?.totalPrice||0)+'</td>';
    html += '<td>'+badge(b.status,'status')+'</td>';
    html += '<td>'+badge(b.payment_status,'payment')+'</td>';
    html += '</tr>';
  }
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

loadBookings();
setInterval(loadBookings, 30000);
</script>
</body>
</html>""")

@router.get("/api/admin/bookings-list")
async def admin_bookings_list(
    req: Request,
    which: str = "active",
    db: Optional[str] = None,
    collection: Optional[str] = None,
    limit: int = 500,
):
    """Fetch bookings from MongoDB for the server-rendered admin panel."""
    if not _require(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        mongo_url, mongo_src = get_mongo_url_with_source()
        if not mongo_url:
            return JSONResponse(
                {
                    "ok": False,
                    "error": "MONGO_URL not set",
                    "items": [],
                    "help": {
                        "message": "Set a MongoDB connection string in Render env vars.",
                        "accepted_env_vars": ["MONGO_URL", "MONGODB_URI", "MONGODB_URL", "DATABASE_URL (mongodb only)"],
                    },
                }
            )

        # Clamp to avoid huge responses
        try:
            limit = int(limit)
        except Exception:
            limit = 500
        limit = max(1, min(limit, 2000))

        client = AsyncIOMotorClient(mongo_url)

        # Choose DB: explicit query param > env DB_NAME > db in URI.
        env_db_name = get_db_name()
        override_db = (db or "").strip() or None
        default_db_name = None
        default_db = None
        try:
            default_db = client.get_default_database()
            default_db_name = getattr(default_db, "name", None)
        except Exception:
            default_db = None
            default_db_name = None

        used_db_name = override_db or env_db_name or default_db_name
        if not used_db_name:
            client.close()
            return JSONResponse(
                {
                    "ok": False,
                    "error": "DB_NAME not set and MONGO_URL has no default database; set DB_NAME in Render env",
                    "items": [],
                    "source": {
                        "which": which,
                        "db": None,
                        "collection": None,
                        "env_db_name": env_db_name,
                        "default_db_name": default_db_name,
                        "mongo_url_source": mongo_src,
                    },
                },
                status_code=400,
            )

        used_db = client[used_db_name]

        # Choose collection: explicit query param > 'which' mapping
        which_norm = (which or "active").strip().lower()
        if collection and collection.strip():
            coll_name = collection.strip()
        else:
            coll_name = "deleted_bookings" if which_norm == "deleted" else "bookings"

        sort_field = "deletedAt" if coll_name == "deleted_bookings" else "createdAt"
        docs = await used_db[coll_name].find({}, {"_id": 0}).sort(sort_field, -1).to_list(limit)
        client.close()
        return JSONResponse(
            {
                "ok": True,
                "count": len(docs),
                "items": docs,
                "source": {
                    "which": which_norm,
                    "db": used_db_name,
                    "collection": coll_name,
                    "limit": limit,
                    "env_db_name": env_db_name,
                    "default_db_name": default_db_name,
                    "mongo_url_source": mongo_src,
                },
            }
        )
    except Exception as e:
        logger.error(f"admin_bookings_list error: {e}")
        return JSONResponse({"ok": False, "error": str(e), "items": []})

@router.get("/admin/status")
def admin_status(req: Request):
    if not _require(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    return JSONResponse({"ok": True, "utc": datetime.utcnow().isoformat() + "Z"})


def _score_collection(name: str, keys: List[str]) -> Tuple[int, List[str]]:
    """Heuristic to find likely bookings collections without returning PII."""
    score = 0
    reasons: List[str] = []
    lname = (name or "").lower()
    k = set(keys or [])

    if "booking" in lname:
        score += 5
        reasons.append("name contains 'booking'")
    if "deleted" in lname:
        score += 2
        reasons.append("name contains 'deleted'")
    if "booking_ref" in k:
        score += 6
        reasons.append("has booking_ref field")
    if "pickupAddress" in k and "dropoffAddress" in k:
        score += 3
        reasons.append("has pickup/dropoff fields")
    if "date" in k and "time" in k:
        score += 2
        reasons.append("has date/time fields")
    if "email" in k:
        score += 1
        reasons.append("has email field")
    if "payment_status" in k:
        score += 1
        reasons.append("has payment_status field")

    return score, reasons


@router.get("/admin/mongo-scan", response_class=HTMLResponse)
def admin_mongo_scan_page(req: Request):
    if not _require(req):
        return RedirectResponse(url="/admin/login", status_code=302)

    return HTMLResponse("""<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Recovery - Mongo Scan</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; padding:18px; margin:0;}
    h2{margin:0 0 6px 0;}
    .meta{color:#6b7280; font-size:13px; margin-bottom:14px;}
    button{padding:8px 14px; border-radius:10px; border:1px solid #e5e7eb; background:#111827; color:#fff; cursor:pointer; font-size:13px;}
    .card{border:1px solid #e5e7eb; border-radius:14px; padding:14px; margin:12px 0;}
    table{width:100%; border-collapse:collapse; font-size:13px; margin-top:10px;}
    th{background:#f8fafc; text-align:left; padding:10px 8px; border-bottom:2px solid #e5e7eb; white-space:nowrap;}
    td{padding:8px; border-bottom:1px solid #f1f5f9; vertical-align:top;}
    tr:hover td{background:#f8fafc;}
    code{background:#f3f4f6; padding:2px 6px; border-radius:6px;}
    .err{color:#dc2626; font-size:13px; margin-top:10px;}
    .small{color:#6b7280; font-size:12px;}
    a{color:#111827;}
  </style>
</head>
<body>
  <h2>Recovery - Mongo Scan</h2>
  <div class="meta">
    If bookings look "missing", they are usually in a different database/collection (DB_NAME mismatch) or in <code>deleted_bookings</code>.
    This scan only returns counts/field names (no customer data) and requires admin login.
  </div>

  <button onclick="runScan()">Run scan</button>
  <div id="error" class="err" style="display:none;"></div>

  <div id="summary" class="card"></div>
  <div id="candidates" class="card"></div>
  <div id="details" class="card"></div>

<script>
function esc(s){return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
function linkToBookings(db, collection){
  const u = '/admin/bookings-view?db='+encodeURIComponent(db)+'&collection='+encodeURIComponent(collection);
  return '<a href=\"'+u+'\">View</a>';
}

async function runScan(){
  const err = document.getElementById('error');
  err.style.display='none';
  document.getElementById('summary').innerHTML = '<div class=\"small\">Scanning...</div>';
  document.getElementById('candidates').innerHTML = '';
  document.getElementById('details').innerHTML = '';
  try{
    const r = await fetch('/api/admin/mongo-scan?ts='+Date.now());
    const data = await r.json();
    if(!r.ok || !data.ok){
      throw new Error(data.error || ('HTTP '+r.status));
    }

    const src = data.source || {};
    document.getElementById('summary').innerHTML = `
      <div><b>Connected</b></div>
      <div class=\"small\">Used DB: <code>${esc(src.used_db_name||'n/a')}</code></div>
      <div class=\"small\">Env DB_NAME: <code>${esc(src.env_db_name||'')}</code> | URI default DB: <code>${esc(src.default_db_name||'')}</code></div>
      <div class=\"small\">Tip: If the right bookings are in a different DB, update Render env <code>DB_NAME</code> to match.</div>
    `;

    const cand = (data.booking_candidates || []);
    if(!cand.length){
      document.getElementById('candidates').innerHTML = '<b>Booking candidates</b><div class=\"small\">No obvious bookings collections found in scanned DBs.</div>';
    } else {
      let html = '<b>Booking candidates</b><table><thead><tr><th>DB</th><th>Collection</th><th>Count</th><th>Why</th><th></th></tr></thead><tbody>';
      for(const c of cand){
        html += '<tr>';
        html += '<td><code>'+esc(c.db)+'</code></td>';
        html += '<td><code>'+esc(c.collection)+'</code></td>';
        html += '<td>'+esc(c.count)+'</td>';
        html += '<td class=\"small\">'+esc((c.reasons||[]).join('; '))+'</td>';
        html += '<td>'+linkToBookings(c.db, c.collection)+'</td>';
        html += '</tr>';
      }
      html += '</tbody></table>';
      document.getElementById('candidates').innerHTML = html;
    }

    // Details table (first scanned db only, to keep it readable)
    const dbs = data.databases || [];
    if(dbs.length){
      const first = dbs[0];
      let html = '<b>Collections in '+esc(first.name)+'</b>';
      html += '<table><thead><tr><th>Collection</th><th>Count</th><th>Fields (sample)</th></tr></thead><tbody>';
      for(const c of (first.collections||[])){
        html += '<tr>';
        html += '<td><code>'+esc(c.name)+'</code></td>';
        html += '<td>'+esc(c.count)+'</td>';
        html += '<td class=\"small\">'+esc((c.sample_keys||[]).join(', '))+'</td>';
        html += '</tr>';
      }
      html += '</tbody></table>';
      if((data.errors||[]).length){
        html += '<div class=\"err\" style=\"margin-top:10px;\">'+esc((data.errors||[]).join(' | '))+'</div>';
      }
      document.getElementById('details').innerHTML = html;
    }

  }catch(e){
    err.textContent = 'Scan failed: ' + String(e);
    err.style.display='block';
    document.getElementById('summary').innerHTML = '';
  }
}
</script>
</body>
</html>""")


@router.get("/api/admin/mongo-scan")
async def admin_mongo_scan(req: Request):
    if not _require(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    try:
        from motor.motor_asyncio import AsyncIOMotorClient

        mongo_url, mongo_src = get_mongo_url_with_source()
        if not mongo_url:
            return JSONResponse(
                {
                    "ok": False,
                    "error": "MONGO_URL not set",
                    "help": {
                        "message": "This backend cannot scan for bookings until a MongoDB connection string is configured.",
                        "accepted_env_vars": ["MONGO_URL", "MONGODB_URI", "MONGODB_URL", "DATABASE_URL (mongodb only)"],
                    },
                },
                status_code=400,
            )

        client = AsyncIOMotorClient(mongo_url)
        errors: List[str] = []

        env_db_name = get_db_name()
        default_db_name = None
        try:
            default_db_name = client.get_default_database().name
        except Exception:
            default_db_name = None

        used_db_name = env_db_name or default_db_name

        # Try to enumerate databases (may require extra privileges).
        db_names: List[str] = []
        try:
            db_names = await client.list_database_names()
        except Exception as e:
            errors.append(f"list_database_names not permitted: {e}")

        # Always scan the "used" DB first if we know it.
        ordered_dbs: List[str] = []
        if used_db_name:
            ordered_dbs.append(used_db_name)
        for n in db_names:
            if n not in ordered_dbs:
                ordered_dbs.append(n)

        if not ordered_dbs:
            client.close()
            return JSONResponse(
                {
                    "ok": False,
                    "error": "Could not determine any database to scan (set DB_NAME, or ensure URI includes a database)",
                },
                status_code=400,
            )

        # Keep scan lightweight
        ordered_dbs = ordered_dbs[:10]

        databases_out: List[Dict[str, Any]] = []
        candidates: List[Dict[str, Any]] = []

        for db_name in ordered_dbs:
            db = client[db_name]
            try:
                col_names = await db.list_collection_names()
            except Exception as e:
                errors.append(f"list_collection_names failed for db {db_name}: {e}")
                continue

            cols_out: List[Dict[str, Any]] = []
            for col_name in col_names[:60]:
                coll = db[col_name]
                count: Optional[int] = None
                sample_keys: List[str] = []
                try:
                    count = await coll.estimated_document_count()
                except Exception:
                    count = None
                try:
                    doc = await coll.find_one({}, {"_id": 0})
                    if isinstance(doc, dict):
                        sample_keys = sorted(list(doc.keys()))
                except Exception:
                    sample_keys = []

                score, reasons = _score_collection(col_name, sample_keys)
                cols_out.append(
                    {
                        "name": col_name,
                        "count": count,
                        "score": score,
                        "reasons": reasons,
                        "sample_keys": sample_keys,
                    }
                )

                if score >= 6 or "booking" in (col_name or "").lower():
                    candidates.append(
                        {
                            "db": db_name,
                            "collection": col_name,
                            "count": count,
                            "score": score,
                            "reasons": reasons,
                        }
                    )

            # Sort collections within a DB by score then count
            cols_out.sort(key=lambda x: (x.get("score", 0), x.get("count") or 0), reverse=True)
            databases_out.append({"name": db_name, "collections": cols_out})

        client.close()

        # Best candidates first
        candidates.sort(key=lambda x: (x.get("score", 0), x.get("count") or 0), reverse=True)

        return JSONResponse(
            {
                "ok": True,
                "source": {
                    "env_db_name": env_db_name,
                    "default_db_name": default_db_name,
                    "used_db_name": used_db_name,
                    "mongo_url_source": mongo_src,
                },
                "databases": databases_out,
                "booking_candidates": candidates[:25],
                "errors": errors,
            }
        )
    except Exception as e:
        logger.error(f"admin_mongo_scan error: {e}")
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)


@router.get("/admin/diagnostics", response_class=HTMLResponse)
def admin_diagnostics_page(req: Request):
    if not _require(req):
        return RedirectResponse(url="/admin/login", status_code=302)

    return HTMLResponse("""<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Diagnostics</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; padding:18px; margin:0;}
    h2{margin:0 0 6px 0;}
    .meta{color:#6b7280; font-size:13px; margin-bottom:14px;}
    button{padding:8px 14px; border-radius:10px; border:1px solid #e5e7eb; background:#111827; color:#fff; cursor:pointer; font-size:13px;}
    table{width:100%; border-collapse:collapse; font-size:13px; margin-top:10px;}
    th{background:#f8fafc; text-align:left; padding:10px 8px; border-bottom:2px solid #e5e7eb; white-space:nowrap;}
    td{padding:8px; border-bottom:1px solid #f1f5f9; vertical-align:top;}
    tr:hover td{background:#f8fafc;}
    code{background:#f3f4f6; padding:2px 6px; border-radius:6px;}
    .ok{color:#065f46;}
    .bad{color:#991b1b;}
    .small{color:#6b7280; font-size:12px;}
    .err{color:#dc2626; font-size:13px; margin-top:10px;}
  </style>
</head>
<body>
  <h2>Diagnostics</h2>
  <div class="meta">Shows whether critical env vars are configured (never shows secret values).</div>
  <button onclick="loadDiag()">Refresh</button>
  <div id="error" class="err" style="display:none;"></div>
  <div id="out"></div>
<script>
function esc(s){return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
function badge(ok){return ok ? '<span class=\"ok\">SET</span>' : '<span class=\"bad\">MISSING</span>';}
async function loadDiag(){
  const err = document.getElementById('error');
  const out = document.getElementById('out');
  err.style.display='none';
  out.innerHTML = '<div class=\"small\">Loading...</div>';
  try{
    const r = await fetch('/api/admin/diagnostics?ts='+Date.now());
    const data = await r.json();
    if(!r.ok || !data.ok) throw new Error(data.error || ('HTTP '+r.status));
    const cfg = data.config || {};
    let html = '<h3>Environment</h3>';
    html += '<table><thead><tr><th>Key</th><th>Status</th><th>Notes</th></tr></thead><tbody>';
    for(const k of Object.keys(cfg)){
      const item = cfg[k] || {};
      let notes = '';
      if(k==='MONGO_URL'){
        notes = 'source=' + esc(item.source||'') + '; candidates=' + esc((item.candidates||[]).join(', '));
      }
      html += '<tr><td><code>'+esc(k)+'</code></td><td>'+badge(!!item.set)+'</td><td class=\"small\">'+notes+'</td></tr>';
    }
    html += '</tbody></table>';

    const db = data.db || {};
    html += '<h3 style=\"margin-top:18px;\">Database</h3>';
    if(db.ok){
      html += '<div class=\"small\">Connected to <code>'+esc(db.db_name||'')+'</code></div>';
      html += '<table><thead><tr><th>Collection</th><th>Count</th></tr></thead><tbody>';
      for(const c of (db.collections||[])){
        html += '<tr><td><code>'+esc(c.name)+'</code></td><td>'+esc(c.count)+'</td></tr>';
      }
      html += '</tbody></table>';
    } else {
      html += '<div class=\"bad\">Not connected</div><div class=\"small\">'+esc(db.error||'')+'</div>';
    }

    out.innerHTML = html;
  }catch(e){
    err.textContent = 'Diagnostics failed: ' + String(e);
    err.style.display = 'block';
    out.innerHTML = '';
  }
}
loadDiag();
</script>
</body>
</html>""")


@router.get("/api/admin/diagnostics")
async def admin_diagnostics(req: Request):
    if not _require(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)

    config = env_presence_report()
    db_report: Dict[str, Any] = {"ok": False}

    mongo_url, mongo_src = get_mongo_url_with_source()
    if mongo_url:
        try:
            from motor.motor_asyncio import AsyncIOMotorClient

            client = AsyncIOMotorClient(mongo_url)
            env_db_name = get_db_name()
            default_db_name = None
            try:
                default_db_name = client.get_default_database().name
            except Exception:
                default_db_name = None

            used_db_name = env_db_name or default_db_name
            if not used_db_name:
                db_report = {
                    "ok": False,
                    "error": "DB_NAME not set and URI has no default database",
                    "mongo_url_source": mongo_src,
                    "env_db_name": env_db_name,
                    "default_db_name": default_db_name,
                }
            else:
                db = client[used_db_name]
                collections = []
                for name in ("bookings", "deleted_bookings", "admins", "admin_sessions"):
                    try:
                        count = await db[name].estimated_document_count()
                    except Exception:
                        count = None
                    collections.append({"name": name, "count": count})
                db_report = {"ok": True, "db_name": used_db_name, "collections": collections}
            client.close()
        except Exception as e:
            db_report = {"ok": False, "error": str(e), "mongo_url_source": mongo_src}
    else:
        db_report = {
            "ok": False,
            "error": "MONGO_URL not set",
            "accepted_env_vars": ["MONGO_URL", "MONGODB_URI", "MONGODB_URL", "DATABASE_URL (mongodb only)"],
        }

    return JSONResponse({"ok": True, "utc": datetime.utcnow().isoformat() + "Z", "config": config, "db": db_report})
