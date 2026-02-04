# backend/server.py
# FORCE_ADMIN_V1_20260204_172000
#
# BOOT-FIRST + ADMIN-INLINE (guarantees /admin/* exists even if other routers are broken)

import os
import sys
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))  # .../backend
ROOT = os.path.dirname(HERE)                       # repo root
for p in (ROOT, HERE):
    if p and p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI, Request, Form
from fastapi.responses import JSONResponse, HTMLResponse, RedirectResponse

app = FastAPI()
BUILD_STAMP = "FORCE_ADMIN_V1_20260204_172000"

ADMIN_COOKIE = "d8_admin"
ADMIN_API_KEY = (os.environ.get("ADMIN_API_KEY") or "").strip()

def _is_authed(req: Request) -> bool:
    if ADMIN_API_KEY == "":
        return False
    h = (req.headers.get("X-Admin-Key") or "").strip()
    if h and h == ADMIN_API_KEY:
        return True
    c = (req.cookies.get(ADMIN_COOKIE) or "").strip()
    return c == ADMIN_API_KEY

# ---- Always-on diagnostics ----
@app.get("/debug/stamp")
def debug_stamp():
    return {"stamp": BUILD_STAMP, "utc": datetime.utcnow().isoformat() + "Z"}

@app.get("/healthz")
def healthz():
    return {"ok": True, "stamp": BUILD_STAMP}

@app.get("/api/agents/ping")
def agents_ping():
    return {"ok": True, "stamp": BUILD_STAMP, "utc": datetime.utcnow().isoformat() + "Z"}

# ---- ADMIN: Edmund Login ----
@app.get("/admin/login", response_class=HTMLResponse)
def admin_login_get():
    return HTMLResponse(\"\"\"<!doctype html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Edmund Admin Login</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:24px;max-width:820px;margin:0 auto;}
.card{border:1px solid #e5e7eb;border-radius:14px;padding:18px;}
input{width:100%;padding:12px;border-radius:10px;border:1px solid #d1d5db;margin-top:8px;}
button{margin-top:12px;padding:12px 14px;border-radius:10px;border:0;background:#111827;color:#fff;cursor:pointer;}
.hint{color:#6b7280;font-size:13px;margin-top:10px;}
</style>
</head>
<body>
<h1>Edmund Admin</h1>
<div class="card">
<form method="post" action="/admin/login">
<label>Admin Key</label>
<input name="key" type="password" placeholder="paste ADMIN_API_KEY" autocomplete="current-password" />
<button type="submit">Login</button>
<div class="hint">ADMIN_API_KEY must be set in Render env vars.</div>
</form>
</div>
</body></html>\"\"\")

@app.post("/admin/login")
def admin_login_post(key: str = Form(...)):
    k = (key or "").strip()
    if ADMIN_API_KEY == "" or k != ADMIN_API_KEY:
        return HTMLResponse("<h3>401 Unauthorized</h3><p>Key mismatch or ADMIN_API_KEY missing.</p><p><a href='/admin/login'>Back</a></p>", status_code=401)
    resp = RedirectResponse(url="/admin", status_code=302)
    resp.set_cookie(key=ADMIN_COOKIE, value=ADMIN_API_KEY, httponly=True, samesite="lax", secure=True)
    return resp

@app.get("/admin/logout")
def admin_logout():
    resp = RedirectResponse(url="/admin/login", status_code=302)
    resp.delete_cookie(ADMIN_COOKIE)
    return resp

@app.get("/admin", response_class=HTMLResponse)
def admin_shell(req: Request):
    if not _is_authed(req):
        return RedirectResponse(url="/admin/login", status_code=302)

    return HTMLResponse(\"\"\"<!doctype html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Edmund Panel</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;margin:0;}
header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #e5e7eb;}
.tabs{display:flex;gap:10px;padding:10px 18px;border-bottom:1px solid #e5e7eb;}
.tab{padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;}
.tab.active{background:#111827;color:#fff;border-color:#111827;}
main{padding:0;height:calc(100vh - 110px);}
iframe{width:100%;height:100%;border:0;}
.right a{color:#111827;text-decoration:none;font-size:14px;}
.meta{color:#6b7280;font-size:13px;}
</style>
</head>
<body>
<header>
  <div>
    <div style="font-weight:700;">Edmund Panel</div>
    <div class="meta">Admin + Cockpit + Booking Form (today)</div>
  </div>
  <div class="right"><a href="/admin/logout">Logout</a></div>
</header>

<div class="tabs">
  <button class="tab active" data-url="/admin/cockpit">Cockpit</button>
  <button class="tab" data-url="/admin/booking-form">Booking Form</button>
  <button class="tab" data-url="/admin/status">Status</button>
</div>

<main><iframe id="frame" src="/admin/cockpit"></iframe></main>

<script>
const tabs=[...document.querySelectorAll('.tab')];
const frame=document.getElementById('frame');
tabs.forEach(t=>{
  t.addEventListener('click', ()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    frame.src=t.dataset.url;
  });
});
</script>
</body></html>\"\"\")

@app.get("/admin/status")
def admin_status(req: Request):
    if not _is_authed(req):
        return JSONResponse({"ok": False, "error":"unauthorized"}, status_code=401)
    return JSONResponse({"ok": True, "stamp": BUILD_STAMP, "utc": datetime.utcnow().isoformat() + "Z"})

@app.get("/admin/cockpit", response_class=HTMLResponse)
def admin_cockpit(req: Request):
    if not _is_authed(req):
        return RedirectResponse(url="/admin/login", status_code=302)

    return HTMLResponse(f\"\"\"<!doctype html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Cockpit</title>
<style>
body{{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:18px;}}
.row{{display:flex;gap:10px;flex-wrap:wrap;}}
button{{padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;background:#111827;color:#fff;cursor:pointer;}}
pre{{background:#0b1020;color:#e5e7eb;padding:12px;border-radius:12px;overflow:auto;}}
.meta{{color:#6b7280;font-size:13px;}}
.card{{border:1px solid #e5e7eb;border-radius:14px;padding:14px;margin-top:12px;}}
</style>
</head>
<body>
<h2>Agent Cockpit</h2>
<div class="meta">This cockpit is inline in server.py (cannot 404 unless server.py isn't running).</div>
<div class="row" style="margin-top:10px;">
  <button onclick="hit('/debug/stamp')">/debug/stamp</button>
  <button onclick="hit('/api/agents/ping')">/api/agents/ping</button>
  <button onclick="hit('/healthz')">/healthz</button>
</div>
<div class="card">
  <div style="font-weight:700;">Output</div>
  <pre id="out">(click a button)</pre>
</div>
<script>
async function hit(p){{
  const out=document.getElementById('out');
  out.textContent='Loading '+p+'...';
  try {{
    const r = await fetch(p+'?ts='+Date.now());
    const t = await r.text();
    out.textContent='HTTP '+r.status+'\\n\\n'+t;
  }} catch(e) {{
    out.textContent='ERROR: '+String(e);
  }}
}}
</script>
</body></html>\"\"\")
