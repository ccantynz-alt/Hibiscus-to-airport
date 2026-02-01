# ===== HIBISCUS_COCKPIT_UI_001 =====
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Any, Dict, Optional
import time
import os
import uuid

router = APIRouter()

# Simple in-memory job log (OK for v1; later replace with DB/queue)
_JOBS = []  # newest first

class CockpitRun(BaseModel):
    action: str                       # "repair_pack" | "patch_builder" | "custom"
    prompt: Optional[str] = ""
    meta: Optional[Dict[str, Any]] = None

def _now():
    return int(time.time())

def _push_job(kind: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    job = {
        "id": str(uuid.uuid4()),
        "kind": kind,
        "ts": _now(),
        "payload": payload,
        "status": "queued"
    }
    _JOBS.insert(0, job)
    del _JOBS[50:]  # cap
    return job

@router.get("/agent-cockpit", response_class=HTMLResponse)
def agent_cockpit():
    # Single-file UI (no build step). Polished dark "glass" cockpit.
    html = r"""
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Hibiscus Agent Cockpit</title>
  <style>
    :root{
      --bg0:#070A12; --bg1:#0B1020; --glass:rgba(255,255,255,.08);
      --line:rgba(255,255,255,.10); --text:rgba(255,255,255,.92);
      --muted:rgba(255,255,255,.62); --muted2:rgba(255,255,255,.40);
      --blue:#3B82F6; --blue2:#60A5FA; --green:#22C55E; --orange:#F59E0B;
      --shadow: 0 24px 60px rgba(0,0,0,.55);
      --radius:18px;
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji","Segoe UI Emoji";
      background: radial-gradient(1000px 600px at 50% -20%, rgba(96,165,250,.28), transparent 60%),
                  radial-gradient(900px 520px at 80% 40%, rgba(34,197,94,.18), transparent 60%),
                  linear-gradient(180deg, var(--bg1), var(--bg0));
      color: var(--text);
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:32px 18px;
    }
    .frame{
      width:min(1060px, 96vw);
      background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.06));
      border: 1px solid var(--line);
      border-radius: 26px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      padding: 22px 22px 16px;
      position:relative;
      overflow:hidden;
    }
    .brand{
      position:absolute; left:20px; top:16px;
      font-size:14px; color: var(--muted2); letter-spacing:.2px;
      user-select:none;
    }
    .title{
      text-align:center;
      font-size:44px;
      font-weight:650;
      margin: 30px 0 18px;
      color: rgba(255,255,255,.92);
    }
    .bar{
      display:flex;
      align-items:center;
      gap: 14px;
      background: rgba(0,0,0,.22);
      border: 1px solid rgba(255,255,255,.10);
      border-radius: 999px;
      padding: 12px 14px;
      width:min(820px, 92%);
      margin: 0 auto 22px;
    }
    .icon{
      width:34px; height:34px; border-radius:999px;
      display:grid; place-items:center;
      background: rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.10);
      color: rgba(255,255,255,.82);
    }
    input{
      flex:1;
      background: transparent;
      border: none;
      outline: none;
      color: rgba(255,255,255,.92);
      font-size:16px;
      padding: 6px 8px;
    }
    input::placeholder{ color: rgba(255,255,255,.38); }
    .btn{
      border:none;
      border-radius: 999px;
      padding: 10px 18px;
      background: linear-gradient(180deg, var(--blue2), var(--blue));
      color:white;
      font-weight:650;
      cursor:pointer;
      box-shadow: 0 10px 24px rgba(59,130,246,.25);
    }
    .grid{
      display:grid;
      grid-template-columns: 1.1fr .9fr;
      gap: 16px;
      margin-top: 10px;
    }
    .card{
      background: rgba(0,0,0,.20);
      border: 1px solid rgba(255,255,255,.10);
      border-radius: var(--radius);
      padding: 14px 14px;
    }
    .card h3{
      margin:0 0 10px;
      font-size:14px;
      letter-spacing:.2px;
      color: rgba(255,255,255,.78);
      font-weight:600;
    }
    .row{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      padding: 10px 10px;
      border-radius: 14px;
    }
    .row + .row{ margin-top:8px; }
    .row:hover{ background: rgba(255,255,255,.04); }
    .left{
      display:flex; align-items:center; gap:10px; min-width:0;
    }
    .dot{
      width:28px; height:28px; border-radius:10px;
      display:grid; place-items:center;
      background: rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.10);
      color: rgba(255,255,255,.86);
      flex:0 0 auto;
      font-size:14px;
    }
    .name{
      font-weight:650; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .sub{ font-size:12px; color: var(--muted2); margin-top:2px; }
    .meta{
      display:flex; align-items:center; gap:10px; color: var(--muted2); font-size:12px;
      white-space:nowrap;
    }
    .pill{
      padding: 6px 10px; border-radius:999px;
      background: rgba(34,197,94,.14);
      border: 1px solid rgba(34,197,94,.30);
      color: rgba(187,247,208,.92);
      font-weight:650;
      font-size:12px;
    }
    .pill.orange{
      background: rgba(245,158,11,.14);
      border-color: rgba(245,158,11,.30);
      color: rgba(253,230,138,.92);
    }
    .prog{
      width: 270px; height: 8px;
      background: rgba(255,255,255,.08);
      border-radius: 99px;
      overflow:hidden;
      border: 1px solid rgba(255,255,255,.10);
    }
    .prog > span{ display:block; height:100%; width:40%; background: linear-gradient(90deg, rgba(96,165,250,.95), rgba(34,197,94,.85)); }
    .small{
      font-size:12px; color: var(--muted2);
    }
    .dock{
      margin-top: 14px;
      display:flex;
      gap: 10px;
      justify-content:space-between;
      padding: 10px 8px 6px;
      border-top: 1px solid rgba(255,255,255,.08);
    }
    .dock .item{
      flex:1;
      background: rgba(0,0,0,.18);
      border: 1px solid rgba(255,255,255,.10);
      border-radius: 16px;
      padding: 12px 10px;
      display:flex;
      align-items:center;
      justify-content:center;
      gap: 10px;
      cursor:pointer;
      user-select:none;
      transition: transform .08s ease;
    }
    .dock .item:active{ transform: translateY(1px); }
    .dock .ico{
      width:34px; height:34px;
      border-radius: 12px;
      display:grid; place-items:center;
      background: rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.10);
    }
    .dock .lbl{ font-size:13px; color: rgba(255,255,255,.78); font-weight:600; }
    .rightCol .card{ height:100%; display:flex; flex-direction:column; }
    .jobs{ display:flex; flex-direction:column; gap:8px; overflow:auto; max-height: 235px; padding-right:4px; }
    .job{ padding:10px 10px; border-radius: 14px; border:1px solid rgba(255,255,255,.10); background: rgba(255,255,255,.04); }
    .job .t{ font-size:13px; font-weight:650; }
    .job .d{ font-size:12px; color: var(--muted2); margin-top:3px; }
    .footerline{
      margin-top: 8px;
      text-align:center;
      font-size:12px;
      color: rgba(255,255,255,.32);
      user-select:none;
    }
    @media (max-width: 900px){
      .title{ font-size:34px; }
      .grid{ grid-template-columns: 1fr; }
      .prog{ width: 200px; }
      .dock{ flex-wrap:wrap; }
      .dock .item{ flex: 1 1 calc(50% - 10px); }
    }
  </style>
</head>
<body>
  <div class="frame" data-stamp="HIBISCUS_COCKPIT_UI_001">
    <div class="brand">hibiscustoairport.co.nz</div>

    <div class="title">What would you like to run?</div>

    <div class="bar">
      <div class="icon">🚀</div>
      <input id="prompt" placeholder="Describe your task… (e.g., repair failing CI, build patch, run 9-agent pack)"/>
      <button class="btn" id="go">GENERATE</button>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Deployments</h3>

        <div class="row">
          <div class="left">
            <div class="dot">🛰️</div>
            <div>
              <div class="name">api.hibiscustoairport.co.nz</div>
              <div class="sub">Backend service health</div>
            </div>
          </div>
          <div class="meta">
            <div class="small" id="apiUptime">checking…</div>
            <div class="pill" id="apiPill">LIVE</div>
          </div>
        </div>

        <div class="row">
          <div class="left">
            <div class="dot">🧠</div>
            <div>
              <div class="name">9-Agent Repair Pack</div>
              <div class="sub">Orchestrator + CI + Patch-Builder + Gate</div>
            </div>
          </div>
          <div class="meta">
            <div class="prog"><span id="packProg" style="width:48%"></span></div>
            <div class="pill orange" id="packPill">READY</div>
          </div>
        </div>

        <div class="row">
          <div class="left">
            <div class="dot">🧾</div>
            <div>
              <div class="name">Latest jobs</div>
              <div class="sub">Queued / running / completed</div>
            </div>
          </div>
          <div class="meta">
            <div class="small" id="jobCount">0</div>
          </div>
        </div>
      </div>

      <div class="rightCol">
        <div class="card">
          <h3>Activity</h3>
          <div class="jobs" id="jobs"></div>
          <div class="footerline" id="foot">HIBISCUS_COCKPIT_UI_001</div>
        </div>
      </div>
    </div>

    <div class="dock">
      <div class="item" data-action="deploy"><div class="ico">🚀</div><div class="lbl">Deploy</div></div>
      <div class="item" data-action="domains"><div class="ico">🌐</div><div class="lbl">Domains</div></div>
      <div class="item" data-action="ssl"><div class="ico">🔒</div><div class="lbl">SSL</div></div>
      <div class="item" data-action="monitor"><div class="ico">📈</div><div class="lbl">Monitor</div></div>
      <div class="item" data-action="repair"><div class="ico">🛠️</div><div class="lbl">Fix</div></div>
      <div class="item" data-action="automate"><div class="ico">⚡</div><div class="lbl">Automate</div></div>
      <div class="item" data-action="integrate"><div class="ico">🧩</div><div class="lbl">Integrate</div></div>
      <div class="item" data-action="settings"><div class="ico">⚙️</div><div class="lbl">Settings</div></div>
    </div>
  </div>

<script>
  const $ = (id) => document.getElementById(id);

  async function api(path, opts){
    const u = path + (path.includes('?') ? '&' : '?') + 'ts=' + Math.floor(Date.now()/1000);
    const res = await fetch(u, opts || {});
    const txt = await res.text();
    let j = null;
    try { j = JSON.parse(txt); } catch {}
    return { ok: res.ok, status: res.status, json: j, text: txt };
  }

  function renderJobs(list){
    const root = $("jobs");
    root.innerHTML = "";
    if (!list || !list.length){
      const el = document.createElement("div");
      el.className="job";
      el.innerHTML = '<div class="t">No jobs yet</div><div class="d">Run a task to see activity here.</div>';
      root.appendChild(el);
      return;
    }
    for (const j of list){
      const el = document.createElement("div");
      el.className="job";
      const when = new Date((j.ts||0)*1000).toLocaleTimeString();
      el.innerHTML = `<div class="t">${j.kind} • ${j.status}</div>
                      <div class="d">${when} • ${JSON.stringify(j.payload||{}).slice(0,160)}</div>`;
      root.appendChild(el);
    }
  }

  async function refresh(){
    const st = await api("/api/cockpit/state");
    if (st.ok && st.json){
      $("jobCount").textContent = String(st.json.jobsCount || 0);
      $("apiUptime").textContent = st.json.apiStamp ? ("stamp " + st.json.apiStamp) : "ok";
      renderJobs(st.json.jobs || []);
    } else {
      $("apiUptime").textContent = "unreachable";
    }
  }

  async function run(action, prompt){
    const payload = { action, prompt: prompt || "", meta: { from: "cockpit-ui" } };
    const res = await api("/api/cockpit/run", {
      method:"POST",
      headers: {"content-type":"application/json"},
      body: JSON.stringify(payload)
    });
    await refresh();
    if (!res.ok){
      alert("Run failed: HTTP " + res.status + "\n" + (res.text || ""));
    }
  }

  $("go").addEventListener("click", async () => {
    const p = $("prompt").value || "";
    await run("repair_pack", p);
  });

  document.querySelectorAll(".dock .item").forEach(el => {
    el.addEventListener("click", async () => {
      const act = el.getAttribute("data-action");
      const p = $("prompt").value || "";
      if (act === "repair") return run("repair_pack", p);
      return run(act, p);
    });
  });

  refresh();
  setInterval(refresh, 5000);
</script>

</body>
</html>
"""
    return HTMLResponse(html)

@router.get("/api/cockpit/state")
async def cockpit_state():
    # Basic status: agent availability + latest jobs + api stamp health
    api_stamp = None
    # If your /debug/stamp exists, we can show it if you later wire it server-side.
    return JSONResponse({
        "ok": True,
        "ts": _now(),
        "apiStamp": api_stamp,
        "agents": {
            "enabled": True,
            "count": 9,
            "endpoints": {
                "ping": "/api/agents/ping",
                "repair": "/api/agents/repair",
                "patchBuilder": "/api/agents/patch-builder"
            }
        },
        "jobsCount": len(_JOBS),
        "jobs": _JOBS[:15]
    })

@router.post("/api/cockpit/run")
async def cockpit_run(body: CockpitRun, request: Request):
    # This is the orchestrator hook. For v1 we simply enqueue a job record.
    # Next: call internal agents here (repair, patch-builder, PR dispatcher).
    job = _push_job(body.action, {
        "prompt": body.prompt or "",
        "meta": body.meta or {},
        "ip": request.client.host if request.client else None
    })
    job["status"] = "running"
    # Minimal simulated completion (so you see activity immediately)
    job["status"] = "queued"
    return JSONResponse({"ok": True, "job": job})