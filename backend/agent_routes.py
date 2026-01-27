import os
from typing import Any, Dict, Optional
from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

# Import robustly whether backend is a package or executed as a script
try:
    from .agent_runtime import run_agent_openai
except Exception:
    from agent_runtime import run_agent_openai

router = APIRouter()

def require_admin_token(x_admin_token: Optional[str]) -> None:
    expected = (os.getenv("ADMIN_TOKEN") or "").strip()
    if not expected:
        # If you want to force token always, set ADMIN_TOKEN in Render.
        return
    if not x_admin_token or x_admin_token.strip() != expected:
        raise HTTPException(status_code=401, detail="Missing/invalid X-Admin-Token")

class AgentRunIn(BaseModel):
    agentId: str
    message: str
    context: Dict[str, Any] = {}

@router.get("/api/agents/ping")
def agents_ping():
    return {"ok": True, "service": "agents", "note": "Set OPENAI_API_KEY for real runs."}

@router.post("/api/agents/run")
def agents_run(body: AgentRunIn, x_admin_token: Optional[str] = Header(default=None, convert_underscores=False)):
    require_admin_token(x_admin_token)
    return run_agent_openai(body.agentId, body.message, body.context)

class ChatIn(BaseModel):
    message: str
    context: Dict[str, Any] = {}

@router.post("/api/agents/chat")
def agents_chat(body: ChatIn, x_admin_token: Optional[str] = Header(default=None, convert_underscores=False)):
    require_admin_token(x_admin_token)
    return run_agent_openai("01_dispatcher", body.message, body.context)

@router.get("/agent-cockpit", response_class=HTMLResponse)
def agent_cockpit():
    html = r\"\"\"<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Agent Cockpit — Hibiscus</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; background:#0b0b0f; color:#fff; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 20px; }
    .card { background:#141420; border:1px solid #2a2a3b; border-radius:14px; padding:16px; margin-top:14px; }
    label { display:block; font-size:12px; opacity:.8; margin-bottom:6px; }
    input, select, textarea { width:100%; box-sizing:border-box; padding:10px; border-radius:10px; border:1px solid #2a2a3b; background:#0f0f18; color:#fff; }
    textarea { min-height: 140px; resize: vertical; }
    button { padding:10px 12px; border-radius:10px; border:1px solid #2a2a3b; background:#1e1e2f; color:#fff; cursor:pointer; }
    button:hover { background:#26263d; }
    .row { display:flex; gap:10px; flex-wrap:wrap; }
    .row > div { flex:1; min-width:220px; }
    pre { white-space: pre-wrap; word-break: break-word; background:#0f0f18; border:1px solid #2a2a3b; padding:12px; border-radius:12px; }
    .muted { opacity:.7; font-size:12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1 style="margin:0 0 6px 0;">Agent Cockpit</h1>
    <div class="muted">Mic works in Chrome/Edge via Speech Recognition. This cockpit calls your backend at /api/agents/*.</div>

    <div class="card">
      <div class="row">
        <div>
          <label>Admin Token (X-Admin-Token header)</label>
          <input id="token" placeholder="Optional (recommended). Stored in this browser." />
        </div>
        <div>
          <label>Agent</label>
          <select id="agent">
            <option value="01_dispatcher">01 Dispatcher</option>
            <option value="02_api_engineer">02 API Engineer</option>
            <option value="03_db_engineer">03 DB Engineer</option>
            <option value="04_payments_stripe">04 Payments/Stripe</option>
            <option value="05_notifications">05 Notifications</option>
            <option value="06_ops_reliability">06 Ops/Reliability</option>
            <option value="07_frontend_wiring">07 Frontend Wiring</option>
            <option value="08_security">08 Security</option>
            <option value="09_release_manager">09 Release Manager</option>
          </select>
        </div>
        <div style="display:flex; align-items:end; gap:10px;">
          <button id="mic">🎙️ Start Mic</button>
          <button id="send">Run Agent</button>
        </div>
      </div>

      <div style="margin-top:12px;">
        <label>Your instruction</label>
        <textarea id="msg" placeholder="Speak or type what you want the agent to do..."></textarea>
        <div class="muted" style="margin-top:8px;">
          Tip: Start with “What’s blocking bookings?” or “Fix Mongo on Render using my current env vars.”
        </div>
      </div>
    </div>

    <div class="card">
      <label>Agent output</label>
      <pre id="out">Ready.</pre>
    </div>
  </div>

<script>
  const tokenEl = document.getElementById("token");
  const agentEl = document.getElementById("agent");
  const msgEl   = document.getElementById("msg");
  const outEl   = document.getElementById("out");
  const micBtn  = document.getElementById("mic");
  const sendBtn = document.getElementById("send");

  tokenEl.value = localStorage.getItem("agent_token") || "";
  tokenEl.addEventListener("input", () => localStorage.setItem("agent_token", tokenEl.value));

  let rec = null;
  function supportsSpeech() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  micBtn.addEventListener("click", () => {
    if (!supportsSpeech()) {
      alert("Speech Recognition not supported in this browser. Use Chrome/Edge.");
      return;
    }
    if (rec) {
      rec.stop();
      rec = null;
      micBtn.textContent = "🎙️ Start Mic";
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    rec = new SR();
    rec.lang = "en-NZ";
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (e) => {
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + " ";
      }
      if (finalText) msgEl.value = (msgEl.value + " " + finalText).trim();
    };
    rec.onerror = () => {};
    rec.onend = () => { rec = null; micBtn.textContent = "🎙️ Start Mic"; };
    rec.start();
    micBtn.textContent = "⏹ Stop Mic";
  });

  async function run() {
    outEl.textContent = "Running...";
    const agentId = agentEl.value;
    const message = msgEl.value.trim();
    if (!message) { outEl.textContent = "Type or speak an instruction first."; return; }

    const headers = { "Content-Type": "application/json" };
    const token = (tokenEl.value || "").trim();
    if (token) headers["X-Admin-Token"] = token;

    const body = JSON.stringify({ agentId, message, context: { page: "agent-cockpit" } });

    const res = await fetch("/api/agents/run", { method:"POST", headers, body });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
      outEl.textContent = "HTTP " + res.status + "\\n" + (typeof data === "string" ? data : JSON.stringify(data, null, 2));
      return;
    }
    outEl.textContent = (typeof data === "string" ? data : JSON.stringify(data, null, 2));
  }

  sendBtn.addEventListener("click", () => run().catch(e => outEl.textContent = String(e)));
</script>
</body>
</html>\"\"\"
    return HTMLResponse(content=html, status_code=200)