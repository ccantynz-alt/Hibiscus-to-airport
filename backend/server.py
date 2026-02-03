# backend/server.py
# FINISH_TODAY_A_20260204_093414
#
# Boot-first entrypoint for Render. Never crash on optional router import failures.
# Always provides /debug/stamp and /api/agents/ping for automation.

import os
import sys
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))  # .../backend
ROOT = os.path.dirname(HERE)                       # repo root

for p in (ROOT, HERE):
    if p and p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

BUILD_STAMP = "FINISH_TODAY_A_20260204_093414"

@app.get("/debug/stamp")
def _debug_stamp():
    return {"stamp": BUILD_STAMP, "utc": datetime.utcnow().isoformat() + "Z"}

@app.get("/healthz")
def _healthz():
    return {"ok": True, "stamp": BUILD_STAMP}

@app.get("/api/agents/ping")
def _agents_ping():
    return {"ok": True, "stamp": BUILD_STAMP, "utc": datetime.utcnow().isoformat() + "Z"}

def _safe_include(router, prefix=""):
    try:
        app.include_router(router, prefix=prefix)
        return True
    except Exception as e:
        print("WARN: include_router failed:", repr(e))
        return False

# Optional: attach your feature routers (absolute imports only)
try:
    from backend.agent_routes import router as agents_router
    _safe_include(agents_router, prefix="/api/agents")
except Exception as e:
    print("WARN: could not import backend.agent_routes:", repr(e))

try:
    from backend.admin_routes import router as admin_router
    _safe_include(admin_router, prefix="")
except Exception as e:
    print("WARN: could not import backend.admin_routes:", repr(e))

try:
    from backend.bookingform_routes import router as bookingform_router
    _safe_include(bookingform_router, prefix="")
except Exception as e:
    print("WARN: could not import backend.bookingform_routes:", repr(e))

