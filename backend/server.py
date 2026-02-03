# backend/server.py
# RENDER_NUKE_V10_20260204_085914
#
# Boot-first entrypoint for Render: always binds a port, never dies on router import issues.

import os
import sys
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))  # .../backend
ROOT = os.path.dirname(HERE)                       # repo root

for p in (ROOT, HERE):
    if p and p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/debug/stamp")
def _debug_stamp():
    return {"stamp": "RENDER_NUKE_V10_20260204_085914", "utc": datetime.utcnow().isoformat() + "Z"}

@app.get("/api/agents/ping")
def _agents_ping():
    return {"ok": True, "stamp": "RENDER_NUKE_V10_20260204_085914", "utc": datetime.utcnow().isoformat() + "Z"}

def _safe_include(router, prefix=""):
    try:
        app.include_router(router, prefix=prefix)
        return True
    except Exception as e:
        # Never crash boot
        print("WARN: include_router failed:", repr(e))
        return False

# Try to attach your real routers (absolute imports only)
try:
    from backend.agent_routes import router as agents_router
    _safe_include(agents_router, prefix="/api/agents")
except Exception as e:
    print("WARN: could not import backend.agent_routes:", repr(e))

try:
    from backend.cockpit_routes import cockpit_router
    _safe_include(cockpit_router, prefix="")
except Exception as e:
    print("WARN: could not import backend.cockpit_routes:", repr(e))
