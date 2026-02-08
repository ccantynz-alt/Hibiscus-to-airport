import os
import sys
from fastapi import FastAPI

ROOT = os.path.dirname(os.path.abspath(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

app = FastAPI()

@app.get("/debug/which")
def debug_which():
    return {"service": "hibiscus-backend", "root": ROOT}

@app.get("/debug/stamp")
def debug_stamp():
    return {"stamp": "ADMIN_BOOT_OK"}

# ---- TEMP ADMIN LOGIN ----
@app.post("/admin/login")
def admin_login():
    return {
        "ok": True,
        "token": "TEMP_ADMIN_TOKEN",
        "user": {
            "email": "admin@local",
            "role": "admin"
        }
    }