# ===== HIBISCUS_COCKPIT_006_FIXED =====
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Any, Dict, Optional
import time, uuid

cockpit_router = APIRouter()
_JOBS = []  # newest first

class CockpitRun(BaseModel):
    action: str
    prompt: Optional[str] = ""
    meta: Optional[Dict[str, Any]] = None

def _now() -> int:
    return int(time.time())

@cockpit_router.get("/__cockpit_stamp__")
def cockpit_stamp():
    return {"ok": True, "stamp": "HIBISCUS_COCKPIT_006_FIXED", "ts": _now()}

@cockpit_router.get("/agent-cockpit", response_class=HTMLResponse)
def agent_cockpit():
    html = r"""
<!doctype html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Hibiscus Cockpit</title>
<style>
body{margin:0;font-family:system-ui;background:#070A12;color:#fff;display:flex;justify-content:center;padding:24px}
.card{width:min(980px,96vw);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);
border-radius:22px;padding:18px 18px 14px}
h1{margin:10px 0 14px;text-align:center;font-size:40px}
.bar{display:flex;gap:10px;align-items:center;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.10);
border-radius:999px;padding:12px 12px}
input{flex:1;background:transparent;border:0;outline:none;color:#fff;font-size:16px;padding:6px 8px}
button{border:0;border-radius:999px;padding:10px 18px;font-weight:700;color:#fff;cursor:pointer;
background:linear-gradient(180deg,#60A5FA,#3B82F6)}
.grid{display:grid;grid-template-columns:1.1fr .9fr;gap:14px;margin-top:14px}
.box{background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:12px}
.row{display:flex;justify-content:space-between;gap:10px;padding:10px;border-radius:14px}
.row:hover{background:rgba(255,255,255,.04)}
.small{color:rgba(255,255,255,.55);font-size:12px}
.jobs{max-height:240px;overflow:auto;display:flex;flex-direction:column;gap:8px}
.job{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:10px}
</style></head>
<body>
<div class="card" data-stamp="HIBISCUS_COCKPIT_006_FIXED">
  <div class="small">api.hibiscustoairport.co.nz • HIBISCUS_COCKPIT_006_FIXED</div>
  <h1>What would you like to run?</h1>
  <div class="bar">
    <input id="p" placeholder="repair failing CI, build patch, run SEO..."/>
    <button id="go">GENERATE</button>
  </div>
  <div class="grid">
    <div class="box">
      <div class="row"><div><b>Repair Pack</b><div class="small">9 agents</div></div><button onclick="run('repair_pack')">Run</button></div>
      <div class="row"><div><b>Patch Builder</b><div class="small">unified diff</div></div><button onclick="run('patch_builder')">Run</button></div>
      <div class="row"><div><b>PR Dispatch</b><div class="small">Agent PR workflow</div></div><button onclick="run('dispatch_pr')">Run</button></div>
      <div class="row"><div><b>SEO / Website</b><div class="small">only if endpoint exists</div></div><button onclick="run('seo_run')">Run</button></div>
    </div>
    <div class="box">
      <b>Activity</b>
      <div class="jobs" id="jobs"></div>
    </div>
  </div>
</div>
<script>
async function api(path, opts){
  const u = path + (path.includes('?')?'&':'?') + 'ts=' + Math.floor(Date.now()/1000);
  const r = await fetch(u, opts||{});
  const t = await r.text();
  let j=null; try{ j=JSON.parse(t);}catch{}
  return {ok:r.ok, status:r.status, json:j, text:t};
}
function render(list){
  const root=document.getElementById('jobs'); root.innerHTML='';
  if(!list || !list.length){ root.innerHTML='<div class="job"><b>No jobs yet</b><div class="small">Run something.</div></div>'; return; }
  for(const x of list){
    const d=document.createElement('div'); d.className='job';
    d.innerHTML = '<b>'+x.kind+'</b> • '+x.status+'<div class="small">'+JSON.stringify(x.payload).slice(0,180)+'</div>';
    root.appendChild(d);
  }
}
async function refresh(){
  const s = await api('/api/cockpit/state');
  if(s.ok && s.json) render(s.json.jobs||[]);
}
async function run(action){
  const prompt = (document.getElementById('p').value||'');
  const payload = {action, prompt, meta:{from:'cockpit'}};
  const r = await api('/api/cockpit/run',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
  await refresh();
  if(!r.ok) alert('Run failed: '+r.status+'\n'+(r.text||''));
}
document.getElementById('go').onclick=()=>run('repair_pack');
refresh(); setInterval(refresh, 5000);
</script>
</body></html>
"""
    return HTMLResponse(html)

@cockpit_router.get("/api/cockpit/state")
def state():
    return JSONResponse({
        "ok": True,
        "ts": _now(),
        "jobs": _JOBS[:15],
        "jobsCount": len(_JOBS),
        "agents": {"ping": "/api/agents/ping", "repair": "/api/agents/repair", "patchBuilder": "/api/agents/patch-builder"},
    })

@cockpit_router.post("/api/cockpit/run")
async def run(body: CockpitRun, request: Request):
    job = {
        "id": str(uuid.uuid4()),
        "ts": _now(),
        "kind": body.action,
        "payload": {"prompt": body.prompt or "", "meta": body.meta or {}},
        "status": "queued",
    }
    _JOBS.insert(0, job)
    del _JOBS[50:]
    return JSONResponse({"ok": True, "job": job})
