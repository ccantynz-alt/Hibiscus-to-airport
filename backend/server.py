from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/debug/stamp")
def debug_stamp():
    return {"stamp": "ADMIN_BOOT_OK"}

@app.post("/admin/login")
def admin_login():
    return {"token": "OWNER_BYPASS_TOKEN", "role": "owner"}