from fastapi import FastAPI
app=FastAPI()


# --- commit beacon ---
try:
    from fastapi.responses import JSONResponse
except Exception:
    JSONResponse = None

@app.get("/debug/beacon")
def debug_beacon():
    payload = {"module":"main","stamp":"BEACON_20260205_153300"}
    return payload if JSONResponse is None else JSONResponse(payload)
