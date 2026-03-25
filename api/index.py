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
