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
try:
    from admin_routes import router as admin_router
    app.include_router(admin_router)
except Exception as e:
    print(f"Failed to import admin_router: {e}")

try:
    from booking_routes import router as booking_router
    app.include_router(booking_router, prefix="/api")
except Exception as e:
    print(f"Failed to import booking_router: {e}")

try:
    from cockpit_routes import cockpit_router
    app.include_router(cockpit_router, prefix="/api")
except Exception as e:
    print(f"Failed to import cockpit_router: {e}")

try:
    from bookingform_routes import router as bookingform_router
    app.include_router(bookingform_router, prefix="/api")
except Exception as e:
    print(f"Failed to import bookingform_router: {e}")

try:
    from agent_routes import router as agent_router
    app.include_router(agent_router)
except Exception as e:
    print(f"Failed to import agent_router: {e}")

@app.get("/")
def root():
    return {"message": "Hibiscus to Airport API", "status": "online"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": "2026-02-15"}

@app.get("/debug/beacon")
def debug_beacon():
    return {"module": "main", "stamp": "ADMIN_LOGIN_BOOKINGS_FIX_20260215"}
