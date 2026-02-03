# backend/app.py
# SAFE_WRAPPER_SHIM_FORCE_MAIN

try:
    from backend.main import app as app
except Exception:
    from main import app as app
