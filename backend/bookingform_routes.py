# backend/bookingform_routes.py
# FINISH_TODAY_D_BOOKING_FORM_EDITOR

import os
import json
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from pydantic import BaseModel

router = APIRouter()

ADMIN_COOKIE = "d8_admin"
ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY", "").strip()

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HERE, "data")
CFG_PATH = os.path.join(DATA_DIR, "booking_form.json")

DEFAULT_CFG = {
  "version": 1,
  "updatedUtc": None,
  "fields": [
    {"key":"fullName","label":"Full name","type":"text","required": True},
    {"key":"phone","label":"Phone","type":"text","required": True},
    {"key":"email","label":"Email","type":"email","required": True},
    {"key":"pickup","label":"Pickup address","type":"text","required": True},
    {"key":"dropoff","label":"Dropoff address","type":"text","required": True},
    {"key":"pickupDate","label":"Pickup date","type":"date","required": True},
    {"key":"pickupTime","label":"Pickup time","type":"time","required": True},
    {"key":"flightNumber","label":"Flight number (optional)","type":"text","required": False},
    {"key":"notes","label":"Notes (optional)","type":"textarea","required": False}
  ]
}

def _ensure_default():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(CFG_PATH):
        d = dict(DEFAULT_CFG)
        d["updatedUtc"] = datetime.utcnow().isoformat() + "Z"
        with open(CFG_PATH, "w", encoding="utf-8") as f:
            json.dump(d, f, indent=2)

def _load():
    _ensure_default()
    with open(CFG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def _save(obj):
    os.makedirs(DATA_DIR, exist_ok=True)
    obj["updatedUtc"] = datetime.utcnow().isoformat() + "Z"
    with open(CFG_PATH, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)
    return obj

def _is_authed(req: Request) -> bool:
    if ADMIN_API_KEY == "":
        return False
    h = (req.headers.get("X-Admin-Key") or "").strip()
    if h and h == ADMIN_API_KEY:
        return True
    c = (req.cookies.get(ADMIN_COOKIE) or "").strip()
    return c == ADMIN_API_KEY

class SaveBody(BaseModel):
    cfg: dict

@router.get("/api/public/booking-form")
def booking_form_public():
    return JSONResponse(_load())

@router.get("/api/admin/booking-form")
def booking_form_admin_get(req: Request):
    if not _is_authed(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    return JSONResponse(_load())

@router.post("/api/admin/booking-form")
async def booking_form_admin_set(req: Request):
    if not _is_authed(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    body = await req.json()
    cfg = body.get("cfg")
    if not isinstance(cfg, dict):
        return JSONResponse({"ok": False, "error": "cfg must be an object"}, status_code=400)
    saved = _save(cfg)
    return JSONResponse({"ok": True, "saved": saved})

@router.get("/admin/booking-form", response_class=HTMLResponse)
def booking_form_editor(req: Request):
    if not _is_authed(req):
        return RedirectResponse(url="/admin/login", status_code=302)

    return HTMLResponse("""<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Booking Form Editor</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; padding:18px;}
    textarea{width:100%; min-height:360px; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
      border:1px solid #d1d5db; border-radius:12px; padding:12px;}
    button{margin-top:10px; padding:10px 12px; border-radius:10px; border:0; background:#111827; color:#fff; cursor:pointer;}
    pre{background:#0b1020; color:#e5e7eb; padding:12px; border-radius:12px; overflow:auto;}
    .row{display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;}
    .meta{color:#6b7280; font-size:13px;}
  </style>
</head>
<body>
  <h2>Booking Form Editor</h2>
  <div class="meta">Edit JSON config. Save applies immediately. Public endpoint: <code>/api/public/booking-form</code></div>

  <div class="row">
    <button onclick="loadCfg()">Load</button>
    <button onclick="saveCfg()">Save</button>
  </div>

  <textarea id="t"></textarea>

  <h3>Result</h3>
  <pre id="out">(none)</pre>

<script>
async function loadCfg(){
  const out=document.getElementById('out');
  out.textContent='Loading...';
  const r = await fetch('/api/admin/booking-form?ts='+Date.now());
  const j = await r.json();
  document.getElementById('t').value = JSON.stringify(j, null, 2);
  out.textContent = 'HTTP '+r.status;
}
async function saveCfg(){
  const out=document.getElementById('out');
  out.textContent='Saving...';
  let cfg=null;
  try{ cfg = JSON.parse(document.getElementById('t').value); }
  catch(e){ out.textContent='JSON parse error: '+String(e); return; }
  const r = await fetch('/api/admin/booking-form?ts='+Date.now(), {
    method:'POST',
    headers:{'content-type':'application/json'},
    body: JSON.stringify({cfg})
  });
  const t = await r.text();
  out.textContent='HTTP '+r.status+'\\n\\n'+t;
}
loadCfg();
</script>
</body>
</html>""")
