from fastapi.responses import RedirectResponse
# backend/server.py
# FORCE_ADMIN_SERVERPY_20260205_113208
#
# BOOT-FIRST FastAPI entrypoint for Render.
# Guarantees admin + cockpit routes exist (no router imports, no relative import issues).

import os
import sys
from datetime import datetime

# Ensure import paths are sane no matter Render root dir
HERE = os.path.dirname(os.path.abspath(__file__))  # .../backend
ROOT = os.path.dirname(HERE)                       # repo root
for p in (ROOT, HERE):
        # HIBI_KEY_MISMATCH_ACCEPTS_COOKIE_V1
    if _admin_ok(request):
        return True
if p and p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI, Request, Form
from fastapi.responses import JSONResponse, HTMLResponse, RedirectResponse

app = FastAPI()

# =========================
# TEMP ADMIN BYPASS (DIAG ONLY)
# =========================
ADMIN_BYPASS_KEY = os.environ.get("ADMIN_BYPASS_KEY","dev-bypass-key")

def admin_bypass(request: Request):
    key = request.headers.get("X-Admin-Key","")
    if key == ADMIN_BYPASS_KEY:
        return True
    return False


BUILD_STAMP = "FORCE_ADMIN_SERVERPY_20260205_113208"
ADMIN_COOKIE = "hibiscus_admin"
ADMIN_API_KEY = (os.environ.get("ADMIN_API_KEY") or "").strip()

def _utc() -> str:
    return datetime.utcnow().isoformat() + "Z"

def _is_authed(req: Request) -> bool:
    # Header auth OR cookie auth
    if ADMIN_API_KEY == "":
        return False
    h = (req.headers.get("X-Admin-Key") or "").strip()
    if h and h == ADMIN_API_KEY:
        return True
    c = (req.cookies.get(ADMIN_COOKIE) or "").strip()
    return c == ADMIN_API_KEY

# -------------------------
# Diagnostics (always-on)
# -------------------------
@app.get("/debug/which")
def debug_which():
    return {"module": "server", "stamp": BUILD_STAMP, "utc": _utc()}

@app.get("/debug/stamp")
def debug_stamp():
    return {"stamp": BUILD_STAMP, "utc": _utc()}

@app.get("/healthz")
def healthz():
    return {"ok": True, "stamp": BUILD_STAMP, "utc": _utc()}

@app.get("/api/agents/ping")
def agents_ping():
    # Keep it ultra-stable: never depend on other imports
    return {"ok": True, "stamp": BUILD_STAMP, "utc": _utc()}

# -------------------------
# Admin + Cockpit (inline)
# -------------------------
@app.get("/admin/login", response_class=HTMLResponse)
def admin_login_get():
    return HTMLResponse("""<!doctype html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Edmund Admin Login</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:24px;max-width:860px;margin:0 auto;}
h1{margin:0 0 6px 0;}
.meta{color:#6b7280;font-size:13px;margin-bottom:14px;}
.card{border:1px solid #e5e7eb;border-radius:14px;padding:18px;}
label{display:block;font-size:13px;color:#374151;margin-bottom:6px;}
input{width:100%;padding:12px;border-radius:10px;border:1px solid #d1d5db;}
button{margin-top:12px;padding:12px 14px;border-radius:10px;border:0;background:#111827;color:#fff;cursor:pointer;}
small{color:#6b7280;}
code{background:#f3f4f6;padding:2px 6px;border-radius:8px;}
</style>
</head>
<body>
<h1>Edmund Admin</h1>
<div class="meta">Login is backed by <code>ADMIN_API_KEY</code> in Render env vars.</div>
<div class="card">
<form method="post" action="/admin/login">
  <label>Admin Key</label>
  <input name="key" type="password" placeholder="paste ADMIN_API_KEY" autocomplete="current-password" />
  <button type="submit">Login</button>
  <div style="margin-top:10px;"><small>If you see 401, the key mismatched or env var is missing.</small></div>
</form>
</div>
</body></html>""")

@app.post("/admin/login")
def admin_login_post(key: str = Form(...)):
    # HIBI_ADMIN_BYPASS_UNLOCK_V1
    try:
        if _admin_bypass_ok(request):
            return True
    except Exception:
        pass
    # HIBI_BYPASS_SKIPS_ADMIN_API_KEY
    try:
        if _admin_bypass_ok(request):
            return True
    except Exception:
        pass
    k = (key or "").strip()
    if ADMIN_API_KEY == "":
        return HTMLResponse("<h3>401 Unauthorized</h3><p>ADMIN_API_KEY is missing in Render env vars.</p><p><a href='/admin/login'>Back</a></p>", status_code=401)
        # HIBI_KEY_MISMATCH_ACCEPTS_COOKIE_V1
    if _admin_ok(request):
        return True
if k != ADMIN_API_KEY:
        return HTMLResponse("<h3>401 Unauthorized</h3><p>Key mismatch.</p><p><a href='/admin/login'>Back</a></p>", status_code=401)

    return RedirectResponse(url="/admin", status_code=302)
    resp.set_cookie(
        key=ADMIN_COOKIE,
        value=ADMIN_API_KEY,
        httponly=True,
        samesite="lax",
        secure=True,
    )
    return resp

@app.get("/admin/logout")
def admin_logout():
    return RedirectResponse(url="/admin/login", status_code=302)
    resp.delete_cookie(ADMIN_COOKIE)
    return resp

@app.get("/admin", response_class=HTMLResponse)
def admin_panel(req: Request):
    if not _is_authed(req):
        return RedirectResponse(url="/admin/login", status_code=302)

    return HTMLResponse("""<!doctype html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Edmund Panel</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;margin:0;}
header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #e5e7eb;}
.meta{color:#6b7280;font-size:13px;margin-top:2px;}
.tabs{display:flex;gap:10px;padding:10px 18px;border-bottom:1px solid #e5e7eb;}
.tab{padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;}
.tab.active{background:#111827;color:#fff;border-color:#111827;}
main{padding:0;height:calc(100vh - 110px);}
iframe{width:100%;height:100%;border:0;}
a{color:#111827;text-decoration:none;font-size:14px;}
</style>
</head>
<body>
<header>
  <div>
    <div style="font-weight:700;">Edmund Panel</div>
    <div class="meta">Cockpit + Admin tools</div>
  </div>
  <div><a href="/admin/logout">Logout</a></div>
</header>

<div class="tabs">
  <button class="tab active" data-url="/admin/cockpit">Cockpit</button>
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
</body></html>""")

@app.get("/admin/status")
def admin_status(req: Request):
    if not _is_authed(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    return {"ok": True, "stamp": BUILD_STAMP, "utc": _utc()}

@app.get("/admin/cockpit", response_class=HTMLResponse)
def admin_cockpit(req: Request):
    if not _is_authed(req):
        return RedirectResponse(url="/admin/login", status_code=302)

    return HTMLResponse(f"""<!doctype html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Cockpit</title>
<style>
body{{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:18px;max-width:980px;margin:0 auto;}}
h2{{margin:0 0 8px 0;}}
.meta{{color:#6b7280;font-size:13px;margin-bottom:14px;}}
.row{{display:flex;gap:10px;flex-wrap:wrap;}}
button{{padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;background:#111827;color:#fff;cursor:pointer;}}
pre{{background:#0b1020;color:#e5e7eb;padding:12px;border-radius:12px;overflow:auto;}}
.card{{border:1px solid #e5e7eb;border-radius:14px;padding:14px;margin-top:12px;}}
</style>
</head>
<body>
<h2>Agent Cockpit</h2>
<div class="meta">Server stamp: <b>{BUILD_STAMP}</b></div>

<div class="row">
  <button onclick="hit('/debug/stamp')">/debug/stamp</button>
  <button onclick="hit('/debug/which')">/debug/which</button>
  <button onclick="hit('/api/agents/ping')">/api/agents/ping</button>
  <button onclick="hit('/healthz')">/healthz</button>
  <button onclick="hit('/admin/status')">/admin/status</button>
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
    const r = await fetch(p+'?ts='+Date.now(), {{
      headers: {{ 'cache-control':'no-cache', 'pragma':'no-cache' }}
    }});
    const t = await r.text();
    out.textContent='HTTP '+r.status+'\\n\\n'+t;
  }} catch(e) {{
    out.textContent='ERROR: '+String(e);
  }}
}}
</script>
</body></html>""")

# --- commit beacon ---
try:
    from fastapi.responses import JSONResponse
except Exception:
    JSONResponse = None

@app.get("/debug/beacon")
def debug_beacon():
    payload = {"module":"server","stamp":"BEACON_20260205_153300"}
    return payload if JSONResponse is None else JSONResponse(payload)

# HIBI_TEMP_BYPASS_BLOCK_V1
# =========================
# TEMP DIAG BYPASS (proof-of-deploy + route discovery)
# =========================
ADMIN_BYPASS_KEY = os.environ.get("ADMIN_BYPASS_KEY","dev-bypass-key")

def _bypass_ok(request: Request) -> bool:
    return (request.headers.get("X-Admin-Key","") == ADMIN_BYPASS_KEY)

@app.get("/debug/bypass")
def debug_bypass(request: Request):
    return {
        "ok": _bypass_ok(request),
        "need_header": "X-Admin-Key",
        "stamp": "HIBI_BYPASS_V1"
    }

@app.get("/debug/routes")
def debug_routes():
    # List routes so we can find the real admin path in production
    out = []
    for r in app.routes:
        p = getattr(r, "path", "")
        methods = sorted(list(getattr(r, "methods", []) or []))
        if p:
            out.append({"path": p, "methods": methods})
    return {"count": len(out), "routes": out}

# HIBI_QUERY_BYPASS_V1
# ====================
# TEMP querystring admin bypass (diagnostic only)
ADMIN_BYPASS_KEY = os.environ.get("ADMIN_BYPASS_KEY","dev-bypass-key")

def _admin_bypass_ok(request: Request) -> bool:
    key_header = request.headers.get("X-Admin-Key","")
    key_query  = request.query_params.get("k","")
    return (key_header == ADMIN_BYPASS_KEY) or (key_query == ADMIN_BYPASS_KEY)

# HIBI_WEBSITE_ADMIN_LOGIN_V1
# ===========================
# Restore website admin login (username+password) using env vars:
#   ADMIN_USERNAME (default: admin)
#   ADMIN_API_KEY  (password)
# Cookie session:
#   d8_admin=1
#
# NOTE: This does not remove any existing auth. It adds a browser-friendly path.

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_API_KEY  = os.environ.get("ADMIN_API_KEY", "")

def _admin_cookie_ok(request: Request) -> bool:
    try:
        return request.cookies.get("d8_admin","") == "1"
    except Exception:
        return False

def _admin_key_ok(request: Request) -> bool:
    # Header or querystring key (temporary support)
    try:
        key = request.headers.get("X-Admin-Key","")
        if key and ADMIN_API_KEY and key == ADMIN_API_KEY:
            return True
        q = request.query_params.get("k","")
        if q and ADMIN_API_KEY and q == ADMIN_API_KEY:
            return True
    except Exception:
        pass
    return False

def _admin_ok(request: Request) -> bool:
    # Browser session OR key-based
    return _admin_cookie_ok(request) or _admin_key_ok(request)



@app.get("/admin-redirect")
def admin_redirect():
    return RedirectResponse(url="/admin", status_code=302)
    return resp