# backend/server.py
# RENDER_SERVER_ENTRYPOINT_FORCE_MAIN

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))  # .../backend
ROOT = os.path.dirname(HERE)                       # repo root

for p in (ROOT, HERE):
    if p and p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.main import app as app
except Exception:
    from main import app as app
