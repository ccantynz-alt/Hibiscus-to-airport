from agent_routes import router as agents_router
from urllib.parse import urlparse
import socket
from fastapi import FastAPI
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
    return {"stamp": "RENDER_STAMP_20260127_113814"}

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





