# backend/server.py
# This is the entry point for the Render deployment
# Import the properly configured app from main.py

try:
    from backend.main import app
except ImportError:
    try:
        from main import app
    except ImportError:
        # Fallback if neither works
        from fastapi import FastAPI
        app = FastAPI()
        
        @app.get("/")
        def root():
            return {"error": "Could not import main app", "status": "configuration_error"}
        
        @app.get("/debug/stamp")
        def debug_stamp():
            return {"stamp": "FALLBACK_MODE_CHECK_IMPORTS"}