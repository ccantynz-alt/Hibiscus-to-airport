# backend/server.py
# RENDER_SERVER_ENTRYPOINT_PATHFORCE_V3_20260203
#
# Goal: make `uvicorn server:app` work regardless of Render Root Directory / working dir.
# - Adds both repo root and backend/ to sys.path
# - Tries import in safe order
# - Raises a clear error if app cannot be found

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))          # .../backend
ROOT = os.path.dirname(HERE)                               # repo root

# Put both on sys.path (front of list)
for p in (ROOT, HERE):
    if p and p not in sys.path:
        sys.path.insert(0, p)

_app = None
_last_err = None

# Attempt 1: repo-root style package import
try:
    from backend.main import app as _app
except Exception as e:
    _last_err = e

# Attempt 2: backend-root style module import (when cwd=backend or HERE in sys.path)
if _app is None:
    try:
        from main import app as _app
    except Exception as e:
        _last_err = e

# Attempt 3: app.py wrapper patterns (some repos define backend/app.py exporting app)
if _app is None:
    try:
        from backend.app import app as _app
    except Exception as e:
        _last_err = e

if _app is None:
    raise RuntimeError("FATAL: Could not import FastAPI 'app'. Checked backend.main, main, backend.app. Last error: %r" % (_last_err,))

app = _app
