# api/index.py
# Vercel Serverless entry point — mounts the full FastAPI application.
#
# Vercel's Python runtime looks for an `app` object (ASGI/WSGI) in api/index.py.
# All requests matching /api/* are routed here via vercel.json rewrites.

import os
import sys
import logging

# ---------------------------------------------------------------------------
# sys.path: ensure api/_shared is importable with bare names
# (e.g. "from db import get_pool", "from auth import ...", "from utils import ...")
# This mirrors backend/server.py which puts the backend dir on sys.path.
# ---------------------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))          # .../api
SHARED = os.path.join(HERE, "_shared")                     # .../api/_shared

for p in (HERE, SHARED):
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI, Request, APIRouter
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime

# ---------------------------------------------------------------------------
# Create the app
# ---------------------------------------------------------------------------
BUILD_STAMP = "VERCEL_SERVERLESS_20260325"

app = FastAPI(title="Hibiscus to Airport Booking API")

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Middleware: prevent CDN caching of API responses
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

# CORS — allow the known frontend origins
_CORS_ORIGINS = os.environ.get(
    "CORS_ORIGINS",
    "https://hibiscustoairport.co.nz,https://www.hibiscustoairport.co.nz,http://localhost:3000",
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[o.strip() for o in _CORS_ORIGINS],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Diagnostic endpoints
# ---------------------------------------------------------------------------
def _utc() -> str:
    return datetime.utcnow().isoformat() + "Z"

@app.get("/api/")
async def api_root():
    return {"message": "Hibiscus to Airport Booking API", "status": "running", "stamp": BUILD_STAMP}

@app.get("/api/agents/ping")
def agents_ping():
    return {"ok": True, "stamp": BUILD_STAMP, "utc": _utc()}

@app.get("/healthz")
def healthz():
    return {"ok": True, "stamp": BUILD_STAMP, "utc": _utc()}

@app.get("/debug/stamp")
def debug_stamp():
    return {"stamp": BUILD_STAMP, "utc": _utc()}

@app.get("/debug/which")
def debug_which():
    return {"module": "api.index (Vercel)", "stamp": BUILD_STAMP, "utc": _utc()}

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
# Import and include routers
# ---------------------------------------------------------------------------

# 1) Booking routes under /api prefix
try:
    from booking_routes import router as booking_router
    api_router = APIRouter(prefix="/api")
    api_router.include_router(booking_router, tags=["bookings"])
    app.include_router(api_router)
    logger.info("booking_routes mounted under /api")
except Exception as e:
    logger.error(f"FAILED to import booking_routes: {e}")

# 2) Admin routes (HTML admin panel + bookings list API)
try:
    from admin_routes import router as admin_router
    app.include_router(admin_router, tags=["admin"])
    logger.info("admin_routes mounted")
except Exception as e:
    logger.error(f"FAILED to import admin_routes: {e}")

# 3) Cockpit routes
try:
    from cockpit_routes import cockpit_router
    app.include_router(cockpit_router, tags=["cockpit"])
    logger.info("cockpit_routes mounted")
except Exception as e:
    logger.error(f"FAILED to import cockpit_routes: {e}")

# 4) Booking form editor routes
try:
    from bookingform_routes import router as bookingform_router
    app.include_router(bookingform_router, tags=["bookingform"])
    logger.info("bookingform_routes mounted")
except Exception as e:
    logger.error(f"FAILED to import bookingform_routes: {e}")

# 5) Agent routes
try:
    from agent_routes import router as agent_router
    app.include_router(agent_router, tags=["agents"])
    logger.info("agent_routes mounted")
except Exception as e:
    logger.error(f"FAILED to import agent_routes: {e}")

# ---------------------------------------------------------------------------
# Cron: day-before reminder emails & SMS
# Vercel Cron calls GET /api/cron/reminders daily at 5:00 UTC (6 PM NZDT)
# Secured via CRON_SECRET env var — Vercel sends it as Authorization header.
# ---------------------------------------------------------------------------
@app.get("/api/cron/reminders")
async def cron_day_before_reminders(request: Request):
    """Send reminders for bookings happening tomorrow. Called by Vercel Cron."""
    # Verify cron secret
    cron_secret = os.environ.get("CRON_SECRET", "")
    auth_header = request.headers.get("authorization", "")
    if cron_secret and auth_header != f"Bearer {cron_secret}":
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)

    try:
        from db import get_pool
        from utils import send_email, send_sms, format_date_nz
        from datetime import timezone, timedelta

        pool = await get_pool()
        tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
        rows = await pool.fetch(
            """SELECT * FROM bookings
               WHERE date = $1 AND status = 'confirmed'
               AND payment_status = 'paid'
               AND (reminder_sent IS NULL OR reminder_sent = FALSE)
               LIMIT 100""",
            tomorrow,
        )
        logger.info(f"Cron: found {len(rows)} bookings for tomorrow ({tomorrow}) needing reminders")

        sent_count = 0
        for row in rows:
            booking = dict(row)
            try:
                booking_ref = booking.get("booking_ref", "N/A")
                formatted_date = format_date_nz(booking["date"])
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
                      <p><strong>Pickup:</strong> {booking['pickup_address']}</p>
                      <p><strong>Drop-off:</strong> {booking['dropoff_address']}</p>
                    </div>
                    <p>Questions? Email us at bookings@bookaride.co.nz</p>
                  </div>
                </div>"""
                send_email(booking["email"], subject, body)

                sms_message = (
                    f"REMINDER: Your airport transfer is tomorrow!\n"
                    f"Ref: {booking_ref}\n"
                    f"Pickup: {formatted_date} at {booking['time']}\n"
                    f"From: {(booking['pickup_address'] or '')[:50]}\n"
                    f"Be ready 5-10 mins early. Questions? info@bookaride.co.nz"
                )
                send_sms(booking["phone"], sms_message)

                await pool.execute(
                    "UPDATE bookings SET reminder_sent = TRUE, reminder_sent_at = $1 WHERE id = $2",
                    datetime.now(timezone.utc).isoformat(),
                    booking["id"],
                )
                sent_count += 1
                logger.info(f"Reminder sent for booking {booking_ref}")
            except Exception as e:
                logger.error(f"Failed to send reminder for booking {booking.get('booking_ref')}: {e}")

        return {"ok": True, "reminders_sent": sent_count, "date": tomorrow}
    except Exception as e:
        logger.error(f"Cron reminder error: {e}")
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)

# ---------------------------------------------------------------------------
# IndexNow: Submit URLs to search engines on demand
# Called by Vercel deploy hook or manually
# ---------------------------------------------------------------------------
@app.post("/api/indexnow/submit")
async def indexnow_submit(request: Request):
    """Submit URLs to IndexNow for instant indexing by Bing/Yandex."""
    import requests as http_requests

    cron_secret = os.environ.get("CRON_SECRET", "")
    auth_header = request.headers.get("authorization", "")
    if cron_secret and auth_header != f"Bearer {cron_secret}":
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)

    key = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    host = "hibiscustoairport.co.nz"

    urls = [
        f"https://{host}/",
        f"https://{host}/booking",
        f"https://{host}/pricing",
        f"https://{host}/faq",
        f"https://{host}/service-areas",
        f"https://{host}/north-shore-airport-shuttle",
        f"https://{host}/orewa-airport-shuttle",
        f"https://{host}/whangaparaoa-airport-shuttle",
        f"https://{host}/silverdale-airport-shuttle",
        f"https://{host}/red-beach-airport-shuttle",
        f"https://{host}/gulf-harbour-airport-shuttle",
        f"https://{host}/stanmore-bay-airport-shuttle",
        f"https://{host}/albany-airport-shuttle",
        f"https://{host}/browns-bay-airport-shuttle",
        f"https://{host}/takapuna-airport-shuttle",
        f"https://{host}/devonport-airport-shuttle",
        f"https://{host}/auckland-airport-transfers",
        f"https://{host}/corporate-airport-transfers",
        f"https://{host}/early-morning-airport-shuttle",
        f"https://{host}/late-night-airport-shuttle",
        f"https://{host}/family-airport-shuttle",
        f"https://{host}/student-airport-shuttle",
        f"https://{host}/cruise-transfers",
        f"https://{host}/best-airport-shuttle",
        f"https://{host}/my-booking",
        f"https://{host}/hibiscus-shuttles-alternative",
        f"https://{host}/business-airport-transfer",
        f"https://{host}/airport-shuttle-orewa",
        f"https://{host}/airport-arrivals",
        f"https://{host}/local-airport-shuttle",
        f"https://{host}/orewa-to-airport",
    ]

    payload = {
        "host": host,
        "key": key,
        "keyLocation": f"https://{host}/{key}.txt",
        "urlList": urls
    }

    try:
        resp = http_requests.post(
            "https://api.indexnow.org/IndexNow",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        logger.info(f"IndexNow submitted {len(urls)} URLs, status: {resp.status_code}")
        return {"ok": True, "urls_submitted": len(urls), "status": resp.status_code}
    except Exception as e:
        logger.error(f"IndexNow submit error: {e}")
        return JSONResponse({"ok": False, "error": "Failed to submit URLs"}, status_code=500)
