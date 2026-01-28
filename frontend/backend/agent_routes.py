import os
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from agent_runtime import run_agent_openai

router = APIRouter()

def require_admin_token(x_admin_token: Optional[str]) -> None:
    expected = (os.getenv("ADMIN_TOKEN") or "").strip()
    if not expected:
        return
    if not x_admin_token or x_admin_token.strip() != expected:
        raise HTTPException(status_code=401, detail="Missing/invalid X-Admin-Token")

class AgentRunIn(BaseModel):
    agentId: str
    message: str
    context: Dict[str, Any] = {}

@router.get("/agents/ping")
def agents_ping():
    return {"ok": True, "service": "agents", "note": "Set OPENAI_API_KEY for real runs."}

@router.post("/agents/run")
def agents_run(body: AgentRunIn, x_admin_token: Optional[str] = Header(default=None, convert_underscores=False)):
    require_admin_token(x_admin_token)
    return run_agent_openai(body.agentId, body.message, body.context)

class ChatIn(BaseModel):
    message: str
    context: Dict[str, Any] = {}

@router.post("/agents/chat")
def agents_chat(body: ChatIn, x_admin_token: Optional[str] = Header(default=None, convert_underscores=False)):
    require_admin_token(x_admin_token)
    return run_agent_openai("01_dispatcher", body.message, body.context)

@router.get("/agent-cockpit", response_class=HTMLResponse)
def agent_cockpit():
    p = Path(__file__).resolve().parent / "agent_cockpit.html"
    if not p.exists():
        return HTMLResponse(content="Missing backend/agent_cockpit.html", status_code=500)
    html = p.read_text(encoding="utf-8")
    return HTMLResponse(content=html, status_code=200)