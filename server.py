"""
HIBI BOOT SHIM
STAMP: HIBI_GUARANTEED_ADMIN_ACCESS_20260209

Purpose:
- Render start command expects: uvicorn server:app
- Real FastAPI app lives at: backend/server.py (app variable)
- This file exports app for uvicorn.

If backend.server import fails, the exception will show in logs.
"""

try:
    from backend.server import app  # noqa: F401
except Exception as e:
    # Make the failure extremely obvious in Render logs.
    raise RuntimeError(f"HIBI BOOT SHIM FAILED importing backend.server: {e}") from e