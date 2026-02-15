# backend/server.py
# Main FastAPI application entry point for Hibiscus to Airport
# Deployed on Render via Docker: uvicorn backend.server:app

import os
import sys
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# sys.path: ensure the backend directory is on the path so that
# booking_routes.py, auth.py, utils.py etc. can use bare imports
# (e.g. "from auth import ...") as well as package-qualified imports.
# ---------------------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))  # .../backend
ROOT = os.path.dirname(HERE)                       # repo root

for p in (HERE, ROOT):
    if p and p not in sys.path:
        sys.path.insert(0, p)

from dotenv import load_dotenv
load_dotenv(Path(HERE) / '.env')

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# ---------------------------------------------------------------------------
# Create the app
# ---------------------------------------------------------------------------
BUILD_STAMP = "SYSTEM_ACCESS_BOOKINGS_FIX_20260215"

app = FastAPI(title="Hibiscus to Airport Booking API")

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Middleware: prevent Cloudflare/CDN caching of API responses
# ---------------------------------------------------------------------------
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

# CORS (allow all origins for the frontend)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Core diagnostic endpoints (always available, no dependencies)
# ---------------------------------------------------------------------------
def _utc() -> str:
    return datetime.utcnow().isoformat() + "Z"

@app.get("/debug/stamp")
def debug_stamp():
    return {"stamp": BUILD_STAMP, "utc": _utc()}

@app.get("/debug/which")
def debug_which():
    return {"module": "backend.server", "stamp": BUILD_STAMP, "utc": _utc()}

@app.get("/healthz")
def healthz():
    return {"ok": True, "stamp": BUILD_STAMP, "utc": _utc()}

@app.get("/debug/routes")
def debug_routes():
    out = []
    for r in app.routes:
        p = getattr(r, "path", "")
        methods = sorted(list(getattr(r, "methods", []) or []))
        if p:
            out.append({"path": p, "methods": methods})
    return {"count": len(out), "routes": out}

# ---------------------------------------------------------------------------
# Import and include routers (with resilience — each router is optional)
# ---------------------------------------------------------------------------

# 1) Booking routes under /api prefix (the React frontend expects /api/...)
try:
    from booking_routes import router as booking_router
    from fastapi import APIRouter
    api_router = APIRouter(prefix="/api")
    api_router.include_router(booking_router, tags=["bookings"])
    app.include_router(api_router)
    logger.info("booking_routes mounted under /api")
except Exception as e:
    logger.error(f"FAILED to import booking_routes: {e}")

# 2) Admin routes (HTML admin panel: /admin, /admin/login, /admin/logout, /admin/status)
try:
    from admin_routes import router as admin_router
    app.include_router(admin_router, tags=["admin"])
    logger.info("admin_routes mounted")
except Exception as e:
    logger.error(f"FAILED to import admin_routes: {e}")

# 3) Cockpit routes (/admin/cockpit)
try:
    from cockpit_routes import cockpit_router
    app.include_router(cockpit_router, tags=["cockpit"])
    logger.info("cockpit_routes mounted")
except Exception as e:
    logger.error(f"FAILED to import cockpit_routes: {e}")

# 4) Booking form editor routes (/admin/booking-form, /api/public/booking-form, /api/admin/booking-form)
try:
    from bookingform_routes import router as bookingform_router
    app.include_router(bookingform_router, tags=["bookingform"])
    logger.info("bookingform_routes mounted")
except Exception as e:
    logger.error(f"FAILED to import bookingform_routes: {e}")

# 5) Agent routes (cockpit automation: /api/cockpit/state, /api/cockpit/run, /agent-cockpit)
try:
    from agent_routes import router as agent_router
    app.include_router(agent_router, tags=["agents"])
    logger.info("agent_routes mounted")
except Exception as e:
    logger.error(f"FAILED to import agent_routes: {e}")

# ---------------------------------------------------------------------------
# Fallback /api root
# ---------------------------------------------------------------------------
@app.get("/api/")
async def api_root():
    return {"message": "Hibiscus to Airport Booking API", "status": "running", "stamp": BUILD_STAMP}

@app.get("/api/agents/ping")
def agents_ping():
    return {"ok": True, "stamp": BUILD_STAMP, "utc": _utc()}

# ---------------------------------------------------------------------------
# Scheduler: day-before reminder emails & SMS
# ---------------------------------------------------------------------------
try:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from apscheduler.triggers.cron import CronTrigger
    from motor.motor_asyncio import AsyncIOMotorClient

    scheduler = AsyncIOScheduler()

    async def send_day_before_reminders():
        """Send reminders for bookings happening tomorrow — runs daily at 6 PM NZ time."""
        try:
            logger.info("Running day-before reminder job...")
            mongo_url = os.environ.get('MONGO_URL', '')
            db_name = os.environ.get('DB_NAME', 'hibiscus_shuttle')
            if not mongo_url:
                logger.warning("MONGO_URL not set, skipping reminders")
                return
            client = AsyncIOMotorClient(mongo_url)
            db = client[db_name]
            tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime('%Y-%m-%d')
            bookings = await db.bookings.find({
                "date": tomorrow,
                "status": "confirmed",
                "payment_status": "paid",
                "reminder_sent": {"$ne": True}
            }, {"_id": 0}).to_list(100)
            logger.info(f"Found {len(bookings)} bookings for tomorrow ({tomorrow}) needing reminders")

            try:
                from utils import send_email, send_sms, format_date_nz
            except ImportError:
                logger.error("Could not import email/sms utils for reminders")
                client.close()
                return

            sent_count = 0
            for booking in bookings:
                try:
                    booking_ref = booking.get('booking_ref', 'N/A')
                    formatted_date = format_date_nz(booking['date'])
                    subject = f"Reminder: Your Airport Transfer Tomorrow - {booking_ref}"
                    body = f"""
                    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
                      <div style="background:linear-gradient(135deg,#1f2937,#111827);color:#fff;padding:30px;border-radius:10px 10px 0 0;">
                        <h1 style="margin:0;font-size:24px;">Transfer Reminder</h1>
                        <p style="margin:8px 0 0;color:#f59e0b;">Your transfer is tomorrow!</p>
                      </div>
                      <div style="background:#fff;padding:30px;border-radius:0 0 10px 10px;border:1px solid #e5e7eb;">
                        <p>Hi {booking['name']},</p>
                        <p>Just a friendly reminder that your airport transfer is scheduled for <strong>tomorrow</strong>.</p>
                        <div style="background:#f8fafc;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #f59e0b;">
                          <p><strong>Booking:</strong> {booking_ref}</p>
                          <p><strong>Date &amp; Time:</strong> {formatted_date} at {booking['time']}</p>
                          <p><strong>Pickup:</strong> {booking['pickupAddress']}</p>
                          <p><strong>Drop-off:</strong> {booking['dropoffAddress']}</p>
                        </div>
                        <p>Questions? Contact us at 021 743 321 or bookings@bookaride.co.nz</p>
                      </div>
                    </div>"""
                    send_email(booking['email'], subject, body)

                    sms_message = (
                        f"REMINDER: Your airport transfer is tomorrow!\n"
                        f"Ref: {booking_ref}\n"
                        f"Pickup: {formatted_date} at {booking['time']}\n"
                        f"From: {booking['pickupAddress'][:50]}\n"
                        f"Be ready 5-10 mins early. Questions? 021 743 321"
                    )
                    send_sms(booking['phone'], sms_message)

                    await db.bookings.update_one(
                        {"id": booking['id']},
                        {"$set": {"reminder_sent": True, "reminder_sent_at": datetime.now(timezone.utc).isoformat()}}
                    )
                    sent_count += 1
                    logger.info(f"Reminder sent for booking {booking_ref}")
                except Exception as e:
                    logger.error(f"Failed to send reminder for booking {booking.get('booking_ref')}: {e}")

            logger.info(f"Day-before reminders complete: {sent_count} sent")
            client.close()
        except Exception as e:
            logger.error(f"Error in day-before reminder job: {e}")

    @app.on_event("startup")
    async def start_scheduler():
        scheduler.add_job(
            send_day_before_reminders,
            CronTrigger(hour=5, minute=0),  # 5 AM UTC = 6 PM NZDT
            id="day_before_reminders",
            replace_existing=True
        )
        scheduler.start()
        logger.info("Scheduler started - Day-before reminders will run at 6 PM NZ time daily")

    @app.on_event("shutdown")
    async def shutdown_scheduler():
        scheduler.shutdown()
        logger.info("Scheduler shutdown")

except Exception as e:
    logger.warning(f"Scheduler not available: {e}")
