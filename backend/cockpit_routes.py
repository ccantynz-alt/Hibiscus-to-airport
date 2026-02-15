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
    # The richer cockpit UI lives at /agent-cockpit; keep /admin/cockpit for the admin panel tab.
    return RedirectResponse(url="/agent-cockpit", status_code=302)
