# backend/server.py
# This is the entry point for the Render deployment
# Import the properly configured app from main.py

print("=" * 60)
print("SERVER.PY - Loading application")
print("=" * 60)

app = None
import_error = None

try:
    print("Attempting import: backend.main")
    from backend.main import app
    print("✓ Successfully imported from backend.main")
except ImportError as e:
    import_error = str(e)
    print(f"✗ Failed to import from backend.main: {e}")
    try:
        print("Attempting import: main")
        from main import app
        print("✓ Successfully imported from main")
    except ImportError as e2:
        print(f"✗ Failed to import from main: {e2}")
        # Fallback if neither works
        print("⚠ Creating fallback app - imports failed!")
        from fastapi import FastAPI
        app = FastAPI()
        
        @app.get("/")
        def root():
            return {"error": "Could not import main app", "status": "configuration_error", "details": import_error}
        
        @app.get("/debug/stamp")
        def debug_stamp():
            return {"stamp": "FALLBACK_MODE_CHECK_IMPORTS", "error": import_error}

if app is not None:
    print(f"✓ App loaded successfully: {type(app)}")
    # Try to list routes
    try:
        routes = [r.path for r in app.routes]
        print(f"✓ Loaded {len(routes)} routes: {routes[:10]}")
    except:
        pass
else:
    print("✗ App is None - this should not happen!")

print("=" * 60)