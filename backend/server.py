# backend/server.py
# RENDER_SERVER_ENTRYPOINT_NUKE_V2_20260203
#
# Purpose: guarantee `uvicorn server:app` boots on Render regardless of working dir / PYTHONPATH.
# Avoids any fancy strings that can be corrupted by escaping.

try:
    # If running from repo root where backend is a package:
    from backend.main import app as app
except ModuleNotFoundError:
    # If running with Root Directory = backend (cwd=backend):
    from main import app as app
