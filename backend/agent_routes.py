"""
backend/agent_routes.py

Admin-only "Cockpit" + 9 specialist agent prompts.

This is intentionally SAFE:
- Agents can generate plans, content, and patch suggestions.
- Agents do not execute code changes or shell commands on the server.
"""

import asyncio
import os
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from pydantic import BaseModel

from agent_runtime import run_agent_openai
from config_env import env_presence_report

router = APIRouter()

AGENTS_DIR = Path(__file__).resolve().parent / "agents"

ADMIN_COOKIE = "d8_admin"
ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY", "").strip()

_JOBS: List[Dict[str, Any]] = []  # newest first (in-memory, per instance)


def _now() -> int:
    return int(time.time())


def _is_authed(req: Request) -> bool:
    if ADMIN_API_KEY == "":
        return False
    h = (req.headers.get("X-Admin-Key") or "").strip()
    if h and h == ADMIN_API_KEY:
        return True
    c = (req.cookies.get(ADMIN_COOKIE) or "").strip()
    return c == ADMIN_API_KEY


def _agent_files() -> List[Path]:
    if not AGENTS_DIR.exists():
        return []
    files = [p for p in AGENTS_DIR.iterdir() if p.is_file() and p.suffix.lower() == ".md"]
    files.sort(key=lambda p: p.name)
    return files


def _agent_list() -> List[Dict[str, str]]:
    out: List[Dict[str, str]] = []
    for p in _agent_files():
        agent_id = p.stem
        title = agent_id
        try:
            first = (p.read_text(encoding="utf-8").splitlines() or [""])[0].strip()
            if first.startswith("#"):
                title = first.lstrip("#").strip()
        except Exception:
            pass
        out.append({"id": agent_id, "title": title})
    return out


def _add_job(kind: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    job = {"id": str(uuid.uuid4()), "ts": _now(), "kind": kind, "payload": payload, "status": "running"}
    _JOBS.insert(0, job)
    del _JOBS[80:]
    return job


async def _run_agent(agent_id: str, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
    # run_agent_openai is synchronous; keep the event loop responsive.
    return await asyncio.to_thread(run_agent_openai, agent_id, message, context)


class CockpitRun(BaseModel):
    action: str
    prompt: Optional[str] = ""
    meta: Optional[Dict[str, Any]] = None


class AgentRun(BaseModel):
    agentId: str
    message: str
    context: Optional[Dict[str, Any]] = None


@router.get("/__cockpit_stamp__")
def cockpit_stamp(req: Request):
    if not _is_authed(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    return {"ok": True, "stamp": "HIBISCUS_COCKPIT_003", "ts": _now(), "agentsCount": len(_agent_files())}


@router.get("/agent-cockpit", response_class=HTMLResponse)
def agent_cockpit(req: Request):
    if not _is_authed(req):
        return RedirectResponse(url="/admin/login", status_code=302)

    # Single-page admin tool. Uses the existing /admin/login cookie (d8_admin).
    html = r"""<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Agent Cockpit</title>
  <style>
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:#070A12;color:#fff;display:flex;justify-content:center;padding:18px}
    .card{width:min(1040px,96vw);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:16px}
    h1{margin:6px 0 10px;font-size:28px}
    .small{color:rgba(255,255,255,.60);font-size:12px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px}
    .box{background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px}
    label{display:block;font-size:12px;color:rgba(255,255,255,.65);margin-bottom:6px}
    select,textarea,input{width:100%;box-sizing:border-box;background:#0c1020;color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:10px}
    textarea{min-height:140px;resize:vertical}
    button{border:0;border-radius:12px;padding:10px 12px;font-weight:700;color:#fff;cursor:pointer;background:#2563eb}
    button.secondary{background:#111827;border:1px solid rgba(255,255,255,.12)}
    button:disabled{opacity:.6;cursor:not-allowed}
    .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    pre{white-space:pre-wrap;word-break:break-word;background:#0c1020;border:1px solid rgba(255,255,255,.10);padding:12px;border-radius:12px;max-height:420px;overflow:auto}
    .jobs{max-height:240px;overflow:auto;display:flex;flex-direction:column;gap:8px}
    .job{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px}
    .pill{display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.10);font-size:12px}
    a{color:#93c5fd}
  </style>
</head>
<body>
  <div class="card">
    <div class="small">Admin-only. Uses /admin/login cookie. No secrets displayed.</div>
    <h1>Agent Cockpit</h1>

    <div class="row small" style="margin-bottom:10px;">
      <span class="pill" id="agentsCount">agents: ...</span>
      <span class="pill" id="envStatus">env: ...</span>
      <a href="/admin/diagnostics" target="_blank" rel="noreferrer">Open Diagnostics</a>
      <a href="/admin/mongo-scan" target="_blank" rel="noreferrer">Open Recovery Scan</a>
    </div>

    <div class="grid">
      <div class="box">
        <div class="row">
          <div style="flex:1;min-width:220px;">
            <label>Agent (01-09)</label>
            <select id="agent"></select>
          </div>
          <div class="row" style="align-items:flex-end;">
            <button class="secondary" id="presetRepair">Preset: Repair/Recover</button>
            <button class="secondary" id="presetSEO">Preset: Eco SEO</button>
            <button class="secondary" id="presetTikTok">Preset: TikTok Pack</button>
          </div>
        </div>

        <div style="margin-top:12px;">
          <label>Instruction</label>
          <textarea id="msg" placeholder="Example: Find why bookings are missing. Then propose the minimum safe fix."></textarea>
        </div>

        <div class="row" style="margin-top:12px;">
          <button id="run">Run Agent</button>
          <button class="secondary" id="check">Quick Checks</button>
        </div>

        <div class="small" style="margin-top:10px;">
          If you want real AI output, set <b>OPENAI_API_KEY</b> on Render. Otherwise the server returns a safe stub.
        </div>
      </div>

      <div class="box">
        <b>Activity</b>
        <div class="jobs" id="jobs"></div>
      </div>
    </div>

    <div class="box" style="margin-top:14px;">
      <b>Output</b>
      <pre id="out">Ready.</pre>
    </div>
  </div>

<script>
const agentEl = document.getElementById('agent');
const msgEl = document.getElementById('msg');
const outEl = document.getElementById('out');
const jobsEl = document.getElementById('jobs');
const agentsCountEl = document.getElementById('agentsCount');
const envStatusEl = document.getElementById('envStatus');

function esc(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

async function api(path, opts){
  const u = path + (path.includes('?')?'&':'?') + 'ts=' + Math.floor(Date.now()/1000);
  const r = await fetch(u, opts||{});
  const t = await r.text();
  let j=null; try{ j=JSON.parse(t);}catch{}
  return {ok:r.ok, status:r.status, json:j, text:t};
}

function renderJobs(list){
  jobsEl.innerHTML='';
  if(!list || !list.length){
    jobsEl.innerHTML='<div class="job"><b>No jobs yet</b><div class="small">Run something.</div></div>';
    return;
  }
  for(const x of list){
    const d=document.createElement('div'); d.className='job';
    const when = x.ts ? new Date(x.ts*1000).toLocaleString() : '';
    d.innerHTML = '<b>'+esc(x.kind)+'</b> <span class="small">('+esc(x.status)+') '+esc(when)+'</span>'
      + '<div class="small">'+esc(JSON.stringify(x.payload||{}).slice(0,220))+'</div>';
    jobsEl.appendChild(d);
  }
}

async function refresh(){
  const s = await api('/api/cockpit/state');
  if(s.ok && s.json){
    renderJobs(s.json.jobs||[]);
    const agents = s.json.agents || {};
    const n = (agents.list||[]).length;
    agentsCountEl.textContent = 'agents: ' + n;
    envStatusEl.textContent = 'mongo: ' + ((s.json.env && s.json.env.MONGO_URL && s.json.env.MONGO_URL.set) ? 'SET' : 'MISSING');
  }
}

async function loadAgents(){
  const r = await api('/api/agents/list');
  if(!r.ok || !r.json || !r.json.ok){ throw new Error(r.json?.error || ('HTTP '+r.status)); }
  agentEl.innerHTML='';
  for(const a of (r.json.items||[])){
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = a.title || a.id;
    agentEl.appendChild(opt);
  }
}

async function runAgent(){
  const agentId = (agentEl.value||'').trim();
  const message = (msgEl.value||'').trim();
  if(!agentId){ outEl.textContent='Choose an agent.'; return; }
  if(!message){ outEl.textContent='Type an instruction first.'; return; }
  outEl.textContent='Running '+agentId+'...';
  const payload = {agentId, message, context: {from:'agent-cockpit', url: location.href}};
  const r = await api('/api/agents/run', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload)});
  await refresh();
  if(!r.ok){ outEl.textContent='HTTP '+r.status+'\\n\\n'+(r.text||''); return; }
  outEl.textContent = JSON.stringify(r.json, null, 2);
}

async function quickChecks(){
  const paths = ['/debug/stamp','/debug/routes','/admin/status','/api/admin/diagnostics'];
  outEl.textContent = 'Running quick checks...';
  let all='';
  for(const p of paths){
    const r = await api(p);
    all += '=== '+p+' (HTTP '+r.status+') ===\\n';
    all += (r.text||'') + '\\n\\n';
  }
  outEl.textContent = all;
}

document.getElementById('run').onclick = ()=>runAgent().catch(e=>outEl.textContent=String(e));
document.getElementById('check').onclick = ()=>quickChecks().catch(e=>outEl.textContent=String(e));

document.getElementById('presetRepair').onclick = ()=>{
  agentEl.value = '06_ops_reliability';
  msgEl.value = 'Diagnose why bookings are missing and propose the minimum safe fix. Include exact Render env vars needed (MONGO_URL + DB_NAME), and a checklist.';
};
document.getElementById('presetSEO').onclick = ()=>{
  agentEl.value = '01_dispatcher';
  msgEl.value = 'Create an aggressive local SEO campaign focused on eco-friendly airport transfers for Hibiscus to Airport. Deliver: 10 landing page topics, 30 GBP post ideas, 20 FAQ snippets, and a 7-day execution checklist.';
};
document.getElementById('presetTikTok').onclick = ()=>{
  agentEl.value = '01_dispatcher';
  msgEl.value = 'Generate a TikTok content pack for Hibiscus to Airport (eco angle). Deliver: 20 hooks, 10 full 30-45s scripts, 10 b-roll shotlists, and caption + hashtag sets.';
};

(async ()=>{
  try{
    await loadAgents();
    await refresh();
    setInterval(refresh, 5000);
  }catch(e){
    outEl.textContent = 'Failed loading cockpit: ' + String(e);
  }
})();
</script>
</body>
</html>"""
    return HTMLResponse(html)


@router.get("/api/agents/ping")
def agents_ping(req: Request):
    if not _is_authed(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    items = _agent_list()
    return JSONResponse({"ok": True, "ts": _now(), "count": len(items), "items": items})


@router.get("/api/agents/list")
def agents_list(req: Request):
    if not _is_authed(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    items = _agent_list()
    return JSONResponse({"ok": True, "ts": _now(), "count": len(items), "items": items})


@router.post("/api/agents/run")
async def agents_run(req: Request, body: AgentRun):
    if not _is_authed(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)

    agent_id = (body.agentId or "").strip()
    message = (body.message or "").strip()
    if not agent_id or not message:
        return JSONResponse({"ok": False, "error": "agentId and message required"}, status_code=400)

    context = dict(body.context or {})
    context["env"] = env_presence_report()

    job = _add_job(kind=f"agent:{agent_id}", payload={"agentId": agent_id, "message": message[:400]})
    try:
        result = await _run_agent(agent_id, message, context)
        job["status"] = "done"
        job["result"] = result
        return JSONResponse({"ok": True, "job": job, "result": result})
    except Exception as e:
        job["status"] = "error"
        job["error"] = str(e)
        return JSONResponse({"ok": False, "error": str(e), "job": job}, status_code=500)


@router.get("/api/cockpit/state")
def state(req: Request):
    if not _is_authed(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)
    agents = _agent_list()
    return JSONResponse(
        {
            "ok": True,
            "ts": _now(),
            "jobs": _JOBS[:20],
            "jobsCount": len(_JOBS),
            "agents": {"count": len(agents), "list": agents, "run": "/api/agents/run", "listEndpoint": "/api/agents/list"},
            "env": env_presence_report(),
        }
    )


@router.post("/api/cockpit/run")
async def run(req: Request, body: CockpitRun):
    if not _is_authed(req):
        return JSONResponse({"ok": False, "error": "unauthorized"}, status_code=401)

    action = (body.action or "").strip()
    prompt = (body.prompt or "").strip()
    meta = body.meta or {}

    # Backward compatible action runner.
    action_map = {
        "repair_pack": ("06_ops_reliability", "Diagnose and propose the minimum safe repair plan.\n\n" + prompt),
        "patch_builder": ("02_api_engineer", "Propose a minimal patch plan (include unified diff if possible).\n\n" + prompt),
        "dispatch_pr": ("09_release_manager", "Summarize changes and a safe release/rollout checklist.\n\n" + prompt),
        "seo_run": ("01_dispatcher", "Create an SEO + content execution plan.\n\n" + prompt),
    }

    if action not in action_map:
        return JSONResponse({"ok": False, "error": f"Unknown action: {action}"}, status_code=400)

    agent_id, message = action_map[action]
    context = {"from": "cockpit_action", "action": action, "meta": meta, "env": env_presence_report()}

    job = _add_job(kind=action, payload={"prompt": prompt[:400], "meta": meta, "agentId": agent_id})
    try:
        result = await _run_agent(agent_id, message, context)
        job["status"] = "done"
        job["result"] = result
        return JSONResponse({"ok": True, "job": job, "result": result})
    except Exception as e:
        job["status"] = "error"
        job["error"] = str(e)
        return JSONResponse({"ok": False, "error": str(e), "job": job}, status_code=500)

