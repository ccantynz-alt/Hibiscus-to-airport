# Render entrypoint shim.
# Render runs: uvicorn server:app
# Our real app lives in backend/server.py
from backend.server import app  # noqa: F401