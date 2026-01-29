from fastapi import APIRouter, Request, Response, HTTPException
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime, timezone
import os

router = APIRouter()

PATCH_DIR = Path("/tmp/agent_patches")
PATCH_DIR.mkdir(parents=True, exist_ok=True)

def _admin_token() -> str:
    return (os.getenv("ADMIN_TOKEN") or "").strip()

def _check_auth(request: Request, token_qs: str | None):
    tok = _admin_token()
    if not tok:
        raise HTTPException(status_code=500, detail="ADMIN_TOKEN not set")

    hdr = request.headers.get("x-admin-token") or ""
    auth = request.headers.get("authorization") or ""
    bearer = auth[7:].strip() if auth.lower().startswith("bearer ") else ""

    if token_qs == tok or hdr == tok or bearer == tok:
        return

    raise HTTPException(status_code=401, detail="Unauthorized")

class PatchIn(BaseModel):
    repo: str
    instruction: str
    title: str
    patch: str

def _path(repo: str) -> Path:
    safe = "".join(c for c in repo if c.isalnum() or c in "-_") or "default"
    return PATCH_DIR / f"{safe}.latest.patch"

@router.get("/api/agent-patch/health")
async def health():
    return {"ok": True}

@router.post("/api/agent-patch/latest")
async def store(req: Request, body: PatchIn):
    _check_auth(req, req.query_params.get("token"))
    p = _path(body.repo)
    p.write_text(body.patch.replace("\r\n", "\n"), encoding="utf-8")
    return {"ok": True, "bytes": len(body.patch)}

@router.get("/api/agent-patch/latest")
async def fetch(req: Request):
    repo = req.query_params.get("repo") or "hibiscus"
    _check_auth(req, req.query_params.get("token"))
    p = _path(repo)
    if not p.exists():
        raise HTTPException(status_code=404, detail="No patch stored")
    return Response(
        content=p.read_text(encoding="utf-8"),
        media_type="text/plain",
        headers={"Cache-Control": "no-store"}
    )
