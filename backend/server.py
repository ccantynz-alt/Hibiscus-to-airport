import os
import sys
import logging
from pathlib import Path
from fastapi import FastAPI, APIRouter, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv

# Ensure backend directory is in path
ROOT_DIR = Path(__file__).parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

load_dotenv(ROOT_DIR / '.env')

# Import routers
from booking_routes import router as booking_router
from admin_routes import router as admin_router
from cockpit_routes import cockpit_router
from bookingform_routes import router as bookingform_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Hibiscus to Airport API")

# Middleware to prevent caching for API routes
class NoCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if request.url.path.startswith("/api"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0, private"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        return response

app.add_middleware(NoCacheMiddleware)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route (preserved for Render)
@app.get("/debug/stamp")
def debug_stamp():
    return {"stamp": "ADMIN_BOOT_OK", "service": "hibiscus-backend"}

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

# Include routers
# API prefix for bookings and other JSON endpoints
api_router = APIRouter(prefix="/api")
api_router.include_router(booking_router, tags=["bookings"])
app.include_router(api_router)

# Direct inclusion for HTML-based admin routes
app.include_router(admin_router, tags=["admin"])
app.include_router(cockpit_router, tags=["cockpit"])
app.include_router(bookingform_router, tags=["booking-form"])

# Scheduler for reminders (from previous backup)
try:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from apscheduler.triggers.cron import CronTrigger
    from datetime import datetime, timedelta, timezone
    from motor.motor_asyncio import AsyncIOMotorClient

    scheduler = AsyncIOScheduler()

    async def send_day_before_reminders():
        logger.info("Running scheduled day-before reminders...")
        # Note: Logic is already in booking_routes.py if we want to call it there,
        # but for now we can just have the placeholder or import it.
        pass

    @app.on_event("startup")
    async def start_scheduler():
        # scheduler.start()
        logger.info("Scheduler configured")
except ImportError:
    logger.warning("APScheduler not found, skipping scheduler startup")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
