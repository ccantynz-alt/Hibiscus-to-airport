# backend/cockpit_routes.py
# FINISH_TODAY_C_COCKPIT

import os
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse

cockpit_router = APIRouter()

ADMIN_COOKIE = "d8_admin"
ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY", "").strip()

def _is_authed(req: Request) -> bool:
    if ADMIN_API_KEY == "":
        return False
    h = (req.headers.get("X-Admin-Key") or "").strip()
    if h and h == ADMIN_API_KEY:
        return True
    c = (req.cookies.get(ADMIN_COOKIE) or "").strip()
    return c == ADMIN_API_KEY

@cockpit_router.get("/admin/cockpit", response_class=HTMLResponse)
def cockpit(req: Request):
    if not _is_authed(req):
        return RedirectResponse(url="/admin/login", status_code=302)

    return HTMLResponse(f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Cockpit</title>
  <style>
    body{{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; padding:18px;}}
    .row{{display:flex; gap:10px; flex-wrap:wrap;}}
    button{{padding:10px 12px; border-radius:10px; border:1px solid #e5e7eb; background:#111827; color:#fff; cursor:pointer;}}
    pre{{background:#0b1020; color:#e5e7eb; padding:12px; border-radius:12px; overflow:auto;}}
    .card{{border:1px solid #e5e7eb; border-radius:14px; padding:14px; margin-top:12px;}}
    .meta{{color:#6b7280; font-size:13px;}}
  </style>
</head>
<body>
  <h2>Agent Cockpit</h2>
  <div class="meta">Boot is green. This panel checks core endpoints and prepares agent automation.</div>

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
async function hit(path){{
  const out=document.getElementById('out');
  out.textContent='Loading '+path+' ...';
  try {{
    const r = await fetch(path+'?ts='+(Date.now()));
    const t = await r.text();
    out.textContent = 'HTTP '+r.status+'\\n\\n'+t;
  }} catch(e) {{
    out.textContent = 'ERROR: '+String(e);
  }}
}}
</script>

</body>
</html>""")
