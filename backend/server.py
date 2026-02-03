import os
# ===== D8_AUTO_AGENT_IMPORTS_START =====
# Required for cockpit/agents automation
import os
import json
from typing import Any, Dict, Optional, List
from fastapi import Request, Header
from fastapi.responses import PlainTextResponse
# ===== D8_AUTO_AGENT_IMPORTS_END =====

from agent_routes import router as agents_router
from urllib.parse import urlparse
import socket
from fastapi import FastAPI
from backend.cockpit_routes import cockpit_router
from .cockpit_routes import cockpit_router, APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse
import time
from backend.cockpit_routes import router as cockpit_router
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import os
import logging
from pathlib import Path

# Import booking routes
from booking_routes import router as booking_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# --------------------
# App
# --------------------
app = FastAPI(title="Hibiscus to Airport API OPENAPI_STAMP_2026-01-27_19-47-59")




@app.get("/__cockpit_stamp__")
def __cockpit_stamp__():
    return JSONResponse({"cockpit_stamp":"COCKPIT_APP_WIRED","ts": int(time.time())})

@app.get("/agent-cockpit", response_class=HTMLResponse)
def agent_cockpit():
    return HTMLResponse("""
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Agent Cockpit</title></head>
  <body style="font-family: system-ui; padding: 16px;">
    <h1>Agent Cockpit (LIVE)</h1>
    <p>If you can see this, the cockpit routes are mounted in the live FastAPI app.</p>
    <ul>
      <li><code>/__cockpit_stamp__</code> (proof)</li>
      <li><code>/api/agents/ping</code> (agents)</li>
    </ul>
  </body>
</html>
""")
# ===== HIBISCUS_COCKPIT_MOUNT_001 =====
app.include_router(cockpit_router)
# -------------------------------
# DIAGNOSTICS (SAFE / NO SECRETS)
# -------------------------------

@app.get("/api/health")
def api_health():
    return {"ok": True, "service": "hibiscus-to-airport", "status": "running"}

@app.get("/api/debug/mongo")
def debug_mongo():
    uri = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or os.getenv("DATABASE_URL") or ""
    dbname = os.getenv("MONGODB_DB") or os.getenv("DB_NAME") or "hibiscus_to_airport"

    parsed = None
    host = None
    scheme = None
    if uri:
        try:
            parsed = urlparse(uri)
            scheme = parsed.scheme
            host = parsed.hostname
        except Exception:
            scheme = None
            host = None

    # DNS check (fast, best-effort)
    dns_ok = None
    dns_error = None
    if host:
        try:
            socket.getaddrinfo(host, 27017)
            dns_ok = True
        except Exception as e:
            dns_ok = False
            dns_error = str(e)

    return {
        "hasUri": bool(uri),
        "scheme": scheme,
        "host": host,
        "db": dbname,
        "dnsOk": dns_ok,
        "dnsError": dns_error,
        "note": "Does not expose username/password."
    }
# --------------------
# API Router (MUST be defined before any @api_router decorators)
# --------------------
api_router = APIRouter(prefix="/api")

# --------------------
# Debug endpoints (app-level)
# --------------------
@app.get("/debug/stamp")
async def debug_stamp():
    return {"stamp": "RENDER_STAMP_20260203_192939"}

# ===== HIBISCUS_WHOAMI_START =====
# --- Proof endpoint to confirm which code is running in prod ---
@app.get("/debug/whoami")
async def debug_whoami():
    return {
        "ok": True,
        "ts": int(time.time()),
        "module": __name__,
        "file": __file__,
        "app_title": getattr(app, "title", None),
        "debug_stamp": "RENDER_STAMP_20260203_192939"
    }
# ===== HIBISCUS_WHOAMI_END =====

# ===== HIBISCUS_ADMIN_ENTRYPOINT_START =====
# --- Admin guard (X-Admin-Key) + Admin API + Admin HTML entrypoint ---

def _hib_require_admin(x_admin_key: str = ""):
    expected = (os.environ.get("ADMIN_API_KEY") or "").strip()
    if not expected:
        # Bring-up mode if no key is set in Render env vars
        return None
    if (x_admin_key or "").strip() != expected:
        return JSONResponse(status_code=401, content={"ok": False, "error": "unauthorized"})
    return None

@app.get("/api/admin/ping")
async def api_admin_ping(x_admin_key: str = Header(default="")):
    deny = _hib_require_admin(x_admin_key)
    if deny:
        return deny
    return {"ok": True, "admin": "online", "ts": int(time.time())}

@app.get("/api/admin/authcheck")
async def api_admin_authcheck(x_admin_key: str = Header(default="")):
    deny = _hib_require_admin(x_admin_key)
    if deny:
        return deny
    return {"ok": True, "ts": int(time.time()), "note": "X-Admin-Key accepted"}

@app.get("/admin", response_class=HTMLResponse)
async def admin_home(x_admin_key: str = Header(default="")):
    deny = _hib_require_admin(x_admin_key)
    if deny:
        return HTMLResponse("<h1>401</h1><p>Missing/invalid X-Admin-Key</p>", status_code=401)

    return HTMLResponse(f\"\"\"
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Admin</title><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="font-family: system-ui; padding: 16px;">
    <h1>Admin (Backend)</h1>
    <p>If you can see this, the admin entrypoint is live.</p>
    <ul>
      <li><a href="/admin/panel">/admin/panel</a> (panel)</li>
      <li><a href="/admin/cockpit">/admin/cockpit</a> (cockpit embed)</li>
      <li><a href="/agent-cockpit">/agent-cockpit</a> (raw cockpit)</li>
      <li><code>/api/admin/ping</code> (proof)</li>
      <li><code>/api/agents/ping</code> (agents)</li>
      <li><code>/api/cockpit/state</code> (state)</li>
      <li><code>/debug/stamp</code> (stamp)</li>
    </ul>
  </body>
</html>
\"\"\")

@app.get("/admin/panel", response_class=HTMLResponse)
async def admin_panel(x_admin_key: str = Header(default="")):
    deny = _hib_require_admin(x_admin_key)
    if deny:
        return HTMLResponse("<h1>401</h1><p>Missing/invalid X-Admin-Key</p>", status_code=401)

    return HTMLResponse(f\"\"\"
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Admin Panel</title><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="margin:0; font-family: system-ui;">
    <div style="padding:12px; border-bottom:1px solid #ddd;">
      <strong>Admin Panel</strong>
      <span style="margin-left:10px; color:#666;">Backend-served</span>
    </div>
    <div style="padding:16px;">
      <p><b>Status:</b> Use the links below to verify agents/cockpit.</p>
      <ul>
        <li><a href="/admin/cockpit">Open Admin Cockpit</a></li>
        <li><a href="/agent-cockpit">Open Agent Cockpit</a></li>
      </ul>
    </div>
  </body>
</html>
\"\"\")
# ===== HIBISCUS_ADMIN_ENTRYPOINT_END =====

# ===== HIBISCUS_ADMIN_API_START =====
# ---- Admin Guard + Admin API (X-Admin-Key) ----

def _hib_require_admin(x_admin_key: str = ""):
    expected = (os.environ.get("ADMIN_API_KEY") or "").strip()
    if not expected:
        # If no key set, allow (bring-up mode). Set ADMIN_API_KEY in Render to lock this down.
        return None
    if (x_admin_key or "").strip() != expected:
        return JSONResponse(status_code=401, content={"ok": False, "error": "unauthorized"})
    return None

@app.get("/api/admin/ping")
async def admin_ping(x_admin_key: str = Header(default="")):
    deny = _hib_require_admin(x_admin_key)
    if deny:
        return deny
    return {"ok": True, "admin": "online", "ts": int(time.time())}

@app.get("/api/admin/cockpit")
async def admin_cockpit_info(x_admin_key: str = Header(default="")):
    deny = _hib_require_admin(x_admin_key)
    if deny:
        return deny
    return {
        "ok": True,
        "ts": int(time.time()),
        "urls": {
            "agent_cockpit": "/agent-cockpit",
            "admin_cockpit": "/admin/cockpit",
            "cockpit_state": "/api/cockpit/state",
            "agents_ping": "/api/agents/ping"
        }
    }

@app.get("/api/admin/bookings/count")
async def admin_bookings_count(x_admin_key: str = Header(default="")):
    deny = _hib_require_admin(x_admin_key)
    if deny:
        return deny

    # Best-effort DB lookup without assumptions.
    # Tries a couple common imports and returns helpful errors if not configured.
    db = None
    err = None
    try:
        from database import db as _db  # type: ignore
        db = _db
    except Exception as e1:
        err = str(e1)
        try:
            from backend.database import db as _db  # type: ignore
            db = _db
        except Exception as e2:
            err = (err + " | " + str(e2)) if err else str(e2)

    if db is None:
        return JSONResponse(status_code=500, content={
            "ok": False,
            "error": "db_not_available",
            "details": err,
            "hint": "Confirm Mongo URI/env vars and database module wiring."
        })

    # Try common collection names
    for colname in ["bookings", "Bookings", "booking", "orders"]:
        try:
            col = db[colname]
            n = await col.count_documents({})  # type: ignore
            return {"ok": True, "collection": colname, "count": n, "ts": int(time.time())}
        except Exception:
            continue

    return JSONResponse(status_code=500, content={
        "ok": False,
        "error": "no_known_booking_collection",
        "hint": "Update this endpoint to point at your actual bookings collection name."
    })

# Lock down admin-facing HTML endpoint as well:
@app.get("/admin/cockpit", response_class=HTMLResponse)
async def admin_cockpit(x_admin_key: str = Header(default="")):
    deny = _hib_require_admin(x_admin_key)
    if deny:
        return HTMLResponse("<h1>401</h1><p>Missing/invalid X-Admin-Key</p>", status_code=401)

    return HTMLResponse(\"\"\"
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Admin Cockpit</title><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="margin:0; font-family: system-ui;">
    <div style="padding:12px; border-bottom:1px solid #ddd;">
      <strong>Admin Cockpit</strong>
      <span style="margin-left:10px; color:#666;">/agent-cockpit embedded</span>
    </div>
    <iframe src="/agent-cockpit" style="width:100%; height: calc(100vh - 49px); border:0;" title="Agent Cockpit"></iframe>
  </body>
</html>
\"\"\")
# ===== HIBISCUS_ADMIN_API_END =====

# ===== D8_APPLEVEL_COCKPIT_API_START =====
# App-level cockpit endpoints (no router ambiguity)

def _d8_require_admin_key(x_admin_key: str = ""):
    expected = (os.environ.get("ADMIN_API_KEY") or "").strip()
    if not expected:
        return None
    if (x_admin_key or "").strip() != expected:
        return JSONResponse(status_code=401, content={"ok": False, "error": "unauthorized"})
    return None

_D8_ACTIONS = []

@app.get("/api/agents/ping")
async def d8_agents_ping():
    return {"ok": True, "agents": "online", "ts": int(time.time())}

@app.get("/api/cockpit/state")
async def d8_cockpit_state(x_admin_key: str = Header(default="")):
    deny = _d8_require_admin_key(x_admin_key)
    if deny:
        return deny
    last = _D8_ACTIONS[-1] if _D8_ACTIONS else None
    return {"ok": True, "ts": int(time.time()), "actions_count": len(_D8_ACTIONS), "last_action": last}

@app.post("/api/agents/run")
async def d8_agents_run(request: Request, x_admin_key: str = Header(default="")):
    deny = _d8_require_admin_key(x_admin_key)
    if deny:
        return deny
    try:
        body = await request.json()
    except Exception:
        body = {}
    action = (body.get("action") or "noop").strip().lower()
    payload = body.get("payload")
    entry = {"ts": int(time.time()), "action": action, "payload": payload}
    _D8_ACTIONS.append(entry)
    if len(_D8_ACTIONS) > 200:
        del _D8_ACTIONS[0:len(_D8_ACTIONS)-200]
    return {"ok": True, "entry": entry}

@app.get("/admin/cockpit", response_class=HTMLResponse)
async def d8_admin_cockpit(x_admin_key: str = Header(default="")):
    deny = _d8_require_admin_key(x_admin_key)
    if deny:
        return HTMLResponse("<h1>401</h1><p>Missing/invalid X-Admin-Key</p>", status_code=401)
    return HTMLResponse(\"\"\"
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Admin Cockpit</title><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="margin:0; font-family: system-ui;">
    <div style="padding:12px; border-bottom:1px solid #ddd;">
      <strong>Admin Cockpit</strong>
      <span style="margin-left:10px; color:#666;">/agent-cockpit embedded</span>
    </div>
    <iframe src="/agent-cockpit" style="width:100%; height: calc(100vh - 49px); border:0;" title="Agent Cockpit"></iframe>
  </body>
</html>
\"\"\")
# ===== D8_APPLEVEL_COCKPIT_API_END =====

@app.get("/debug/mongo")
async def debug_mongo():
    try:
        db = None
        err = None

        try:
            from database import db as _db  # type: ignore
            db = _db
        except Exception as e1:
            err = str(e1)
            try:
                from backend.database import db as _db  # type: ignore
                db = _db
            except Exception as e2:
                err = (err + " | " + str(e2)) if err else str(e2)

        if db is None:
            return JSONResponse(
                status_code=500,
                content={"ok": False, "error": "Could not import db object", "details": err},
            )

        info = {}

        try:
            info["database_name"] = getattr(db, "name", None)
        except Exception:
            info["database_name"] = None

        try:
            client = getattr(db, "client", None)
            info["client"] = str(client)
        except Exception:
            info["client"] = None

        try:
            cols = await db.list_collection_names()
            info["collections"] = cols
        except Exception as e:
            info["collections_error"] = str(e)

        return {"ok": True, **info}
    except Exception as e:
        return JSONResponse(status_code=500, content={"ok": False, "error": str(e)})

# --------------------
# No-cache middleware for /api
# --------------------
class NoCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if request.url.path.startswith("/api"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0, private"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
            response.headers["Surrogate-Control"] = "no-store"
            response.headers["CDN-Cache-Control"] = "no-store"
            response.headers["Cloudflare-CDN-Cache-Control"] = "no-store"
        return response

app.add_middleware(NoCacheMiddleware)

# --------------------
# API routes
# --------------------
@api_router.get("/")
async def root():
    return {"message": "Hibiscus to Airport Booking API STAMP_2026-01-27_19-46-46", "status": "running"}

@api_router.get("/health")
async def health():
    return {"ok": True}

# Include booking routes under /api
api_router.include_router(booking_router, tags=["bookings"])

api_router.include_router(agents_router, tags=["agents"])
# Attach router
# --- Deploy/version stamp (safe) ---
@app.get("/api/version")
def api_version():
    return {"ok": True, "git": "e27b4315e32db3a713cf7374395422aaad4661ff"}
# -----------------------------------
app.include_router(api_router)
# --------------------
# CORS Middleware
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# Logging
# --------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ============================================
# AUTOMATIC DAY-BEFORE REMINDER SCHEDULER
# ============================================
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient

scheduler = AsyncIOScheduler()

async def send_day_before_reminders():
    """Send reminders for bookings happening tomorrow - runs daily at 6 PM NZ time"""
    try:
        logger.info("Running day-before reminder job...")

        mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        db_name = os.environ.get("DB_NAME", "hibiscus_to_airport")
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]

        tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")

        bookings = await db.bookings.find(
            {
                "date": tomorrow,
                "status": "confirmed",
                "payment_status": "paid",
                "reminder_sent": {"$ne": True},
            },
            {"_id": 0},
        ).to_list(100)

        logger.info(f"Found {len(bookings)} bookings for tomorrow ({tomorrow}) needing reminders")

        from utils import send_email, send_sms, format_date_nz

        sent_count = 0
        for booking in bookings:
            try:
                booking_ref = booking.get("booking_ref", "N/A")
                formatted_date = format_date_nz(booking["date"])

                subject = f"Reminder: Your Airport Transfer Tomorrow - {booking_ref}"
                body = f"""
                <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                  <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Transfer Reminder</h1>
                    <p style="margin: 8px 0 0; color: #f59e0b;">Your transfer is tomorrow!</p>
                  </div>
                  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                    <p>Hi {booking["name"]},</p>
                    <p>Just a friendly reminder that your airport transfer is scheduled for <strong>tomorrow</strong>.</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                      <p><strong>Booking:</strong> {booking_ref}</p>
                      <p><strong>Date & Time:</strong> {formatted_date} at {booking["time"]}</p>
                      <p><strong>Pickup:</strong> {booking["pickupAddress"]}</p>
                      <p><strong>Drop-off:</strong> {booking["dropoffAddress"]}</p>
                    </div>
                    <p style="background: #fef3c7; padding: 15px; border-radius: 8px;">
                      Please be ready 5-10 minutes before your pickup time.
                    </p>
                    <p>Questions? Contact us at 021 743 321 or bookings@bookaride.co.nz</p>
                  </div>
                </div>
                """
                send_email(booking["email"], subject, body)

                sms_message = f"""REMINDER: Your airport transfer is tomorrow!

Ref: {booking_ref}
Pickup: {formatted_date} at {booking["time"]}
Be ready 5-10 mins early.
Questions? 021 743 321"""
                send_sms(booking["phone"], sms_message)

                await db.bookings.update_one(
                    {"id": booking["id"]},
                    {"$set": {"reminder_sent": True, "reminder_sent_at": datetime.now(timezone.utc).isoformat()}},
                )

                sent_count += 1
                logger.info(f"Reminder sent for booking {booking_ref}")

            except Exception as e:
                logger.error(f"Failed to send reminder for booking {booking.get('booking_ref')}: {str(e)}")

        logger.info(f"Day-before reminders complete: {sent_count} sent")
        client.close()

    except Exception as e:
        logger.error(f"Error in day-before reminder job: {str(e)}")

@app.on_event("startup")
async def start_scheduler():
    scheduler.add_job(
        send_day_before_reminders,
        CronTrigger(hour=5, minute=0),  # 5 AM UTC = 6 PM NZDT (during NZDT)
        id="day_before_reminders",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started - Day-before reminders will run at 6 PM NZ time daily")

@app.on_event("shutdown")
async def shutdown_scheduler():
    scheduler.shutdown()
    logger.info("Scheduler shutdown")

# ===== D8_AUTO_AGENT_HELPERS_START =====
# ---- Automation guard + lightweight state ----

def _d8_now_ts() -> int:
    return int(time.time())

def _d8_require_admin_key(x_admin_key: Optional[str]) -> Optional[JSONResponse]:
    """
    If ADMIN_API_KEY is set, require it via header X-Admin-Key.
    If not set, allow (useful for initial bring-up).
    """
    expected = os.environ.get("ADMIN_API_KEY", "").strip()
    if not expected:
        return None
    if (x_admin_key or "").strip() != expected:
        return JSONResponse(status_code=401, content={"ok": False, "error": "unauthorized"})
    return None

# in-memory state (resets on deploy; enough for automation/proof)
_D8_STATE: Dict[str, Any] = {
    "boot_ts": _d8_now_ts(),
    "last_action_ts": None,
    "last_action": None,
    "actions": [],  # list of {ts, kind, payload}
}

def _d8_log_action(kind: str, payload: Any) -> None:
    entry = {"ts": _d8_now_ts(), "kind": kind, "payload": payload}
    _D8_STATE["last_action_ts"] = entry["ts"]
    _D8_STATE["last_action"] = entry
    _D8_STATE["actions"].append(entry)
    # cap log to prevent runaway memory
    if len(_D8_STATE["actions"]) > 200:
        _D8_STATE["actions"] = _D8_STATE["actions"][-200:]
# ===== D8_AUTO_AGENT_HELPERS_END =====

# ===== D8_AUTO_ADMIN_COCKPIT_START =====
# ---- Admin: cockpit embedded page ----

@app.get("/admin/cockpit", response_class=HTMLResponse)
async def admin_cockpit(request: Request, x_admin_key: Optional[str] = Header(default=None, convert_underscores=False)):
    deny = _d8_require_admin_key(x_admin_key)
    if deny:
        # show a tiny HTML so browsers don’t just download JSON
        return HTMLResponse("<h1>401</h1><p>Missing/invalid X-Admin-Key</p>", status_code=401)

    # Embed the existing cockpit page. Keep it simple and fast.
    return HTMLResponse(f"""
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Admin Cockpit</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0; font-family: system-ui;">
    <div style="padding:12px; border-bottom:1px solid #ddd;">
      <strong>Admin Cockpit</strong>
      <span style="margin-left:10px; color:#666;">/agent-cockpit embedded</span>
    </div>
    <iframe
      src="/agent-cockpit"
      style="width:100%; height: calc(100vh - 49px); border:0;"
      title="Agent Cockpit"></iframe>
  </body>
</html>
""")
# ===== D8_AUTO_ADMIN_COCKPIT_END =====




import os


