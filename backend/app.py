# Auto-generated entrypoint so Render can run: uvicorn backend.app:app
# DO NOT put business logic here.
try:
    try:
    from backend.main import app as app
except ModuleNotFoundError:
    # When running with cwd=backend (or PYTHONPATH=backend), 'backend' won't resolve.
    from main import app as app
except ModuleNotFoundError:
    # When running with cwd=backend (or PYTHONPATH=backend), 'backend' won't resolve.
    from main import app as app
from backend.cockpit_routes import cockpit_router

# Mount cockpit routes onto the real app
app.include_router(cockpit_router)


