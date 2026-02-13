# backend/admin_routes.py
# FINISH_TODAY_B_ADMIN_LOGIN

import os
from datetime import datetime
from fastapi import APIRouter, Request, Response, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse

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
    return HTMLResponse(\"\"\"<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Hibiscus Admin Login</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; padding:24px; max-width:820px; margin:0 auto;}
    .card{border:1px solid #e5e7eb; border-radius:14px; padding:18px;}
    input{width:100%; padding:12px; border-radius:10px; border:1px solid #d1d5db; margin-top:8px;}
    button{margin-top:12px; padding:12px 14px; border-radius:10px; border:0; background:#111827; color:#fff; cursor:pointer;}
    .hint{color:#6b7280; font-size:13px; margin-top:10px;}
  </style>
</head>
<body>
  <h1>Hibiscus Admin</h1>
  <div class="card">
    <form method="post" action="/admin/login">
      <label>Admin Key</label>
      <input name="key" type="password" placeholder="paste ADMIN_API_KEY" autocomplete="current-password" />
      <button type="submit">Login</button>
      <div class="hint">Uses ADMIN_API_KEY from Render env. Sets a cookie for this browser.</div>
    </form>
  </div>
</body>
</html>\"\"\")

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

    return HTMLResponse(\"\"\"<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Hibiscus Panel</title>
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
      <div style="font-weight:700;">Hibiscus Panel</div>
      <div class="meta">Admin + Cockpit + Booking Form Editor</div>
    </div>
    <div class="right"><a href="/admin/logout">Logout</a></div>
  </header>

  <div class="tabs">
    <button class="tab active" data-url="/admin/cockpit">Cockpit</button>
    <button class="tab" data-url="/admin/booking-form">Booking Form</button>
    <button class="tab" data-url="/admin/status">Status</button>
  </div>

  <main>
    <iframe id="frame" src="/admin/cockpit"></iframe>
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
</html>\"\"\")

@router.get("/admin/status")
def admin_status(req: Request):
    if not _require(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    return JSONResponse({"ok": True, "utc": datetime.utcnow().isoformat() + "Z"})
