from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include all routers
# Try both import styles for compatibility
try:
    try:
        from backend.admin_routes import router as admin_router
    except ImportError:
        from admin_routes import router as admin_router
    app.include_router(admin_router)
    print("✓ Loaded admin_router")
except Exception as e:
    print(f"✗ Failed to import admin_router: {e}")

try:
    try:
        from backend.booking_routes import router as booking_router
    except ImportError:
        from booking_routes import router as booking_router
    app.include_router(booking_router, prefix="/api")
    print("✓ Loaded booking_router")
except Exception as e:
    print(f"✗ Failed to import booking_router: {e}")

try:
    try:
        from backend.cockpit_routes import cockpit_router
    except ImportError:
        from cockpit_routes import cockpit_router
    app.include_router(cockpit_router, prefix="/api")
    print("✓ Loaded cockpit_router")
except Exception as e:
    print(f"✗ Failed to import cockpit_router: {e}")

try:
    try:
        from backend.bookingform_routes import router as bookingform_router
    except ImportError:
        from bookingform_routes import router as bookingform_router
    app.include_router(bookingform_router, prefix="/api")
    print("✓ Loaded bookingform_router")
except Exception as e:
    print(f"✗ Failed to import bookingform_router: {e}")

try:
    try:
        from backend.agent_routes import router as agent_router
    except ImportError:
        from agent_routes import router as agent_router
    app.include_router(agent_router)
    print("✓ Loaded agent_router")
except Exception as e:
    print(f"✗ Failed to import agent_router: {e}")

@app.get("/")
def root():
    return {"message": "Hibiscus to Airport API", "status": "online"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": "2026-02-15"}

@app.get("/debug/beacon")
def debug_beacon():
    return {"module": "main", "stamp": "ADMIN_LOGIN_BOOKINGS_FIX_20260215"}
