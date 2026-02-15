# backend/admin_routes.py
# FINISH_TODAY_B_ADMIN_LOGIN

import os
import logging
from datetime import datetime
from fastapi import APIRouter, Request, Response, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse

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
      <div class="meta">Admin + Cockpit + Booking Form Editor</div>
    </div>
    <div class="right"><a href="/admin/logout">Logout</a></div>
  </header>

  <div class="tabs">
    <button class="tab active" data-url="/admin/bookings-view">Bookings</button>
    <button class="tab" data-url="/admin/cockpit">Cockpit</button>
    <button class="tab" data-url="/admin/booking-form">Booking Form</button>
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
  <div class="meta">Live from database. Auto-refreshes every 30s.</div>

  <div class="stats" id="stats"></div>

  <div class="row-bar">
    <input id="search" type="text" placeholder="Search name, email, ref..." oninput="applyFilter()" />
    <select id="statusFilter" onchange="applyFilter()" style="padding:8px 12px; border-radius:10px; border:1px solid #d1d5db; font-size:13px;">
      <option value="all">All statuses</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="cancelled">Cancelled</option>
    </select>
    <button onclick="loadBookings()">Refresh</button>
  </div>

  <div id="error"></div>
  <div id="table-wrap"></div>

<script>
let ALL = [];

async function loadBookings(){
  const wrap = document.getElementById('table-wrap');
  const err = document.getElementById('error');
  err.style.display='none';
  wrap.innerHTML = '<div class="empty">Loading bookings...</div>';
  try {
    const r = await fetch('/api/admin/bookings-list?ts='+Date.now());
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
async def admin_bookings_list(req: Request):
    """Fetch bookings from MongoDB for the server-rendered admin panel."""
    if not _require(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        mongo_url = os.environ.get("MONGO_URL", "")
        db_name = os.environ.get("DB_NAME", "hibiscus_shuttle")
        if not mongo_url:
            return JSONResponse({"ok": False, "error": "MONGO_URL not set", "items": []})
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        docs = await db.bookings.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)
        client.close()
        return JSONResponse({"ok": True, "count": len(docs), "items": docs})
    except Exception as e:
        logger.error(f"admin_bookings_list error: {e}")
        return JSONResponse({"ok": False, "error": str(e), "items": []})

@router.get("/admin/status")
def admin_status(req: Request):
    if not _require(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    return JSONResponse({"ok": True, "utc": datetime.utcnow().isoformat() + "Z"})
