import { NextResponse } from "next/server";

type ProbeResult = {
  name: string;
  url: string;
  ok: boolean;
  status: number | null;
  ms: number;
  error?: string;
};

type CiStatus = {
  provider: "github";
  ok: boolean;
  status: string;        // queued|in_progress|completed|unknown|error
  conclusion: string;    // success|failure|cancelled|skipped|neutral|timed_out|action_required|stale|startup_failure|unknown|error
  branch?: string;
  updatedAt?: string;
  runNumber?: number;
  url?: string;
  error?: string;
};

type DeployStatus = {
  provider: "vercel";
  ok: boolean;
  state: string;         // READY|BUILDING|ERROR|CANCELED|QUEUED|unknown|error (Vercel states vary)
  createdAt?: number;
  url?: string;          // https://{deployment.url}
  error?: string;
};

function parseProbes(raw: string | undefined): Array<{ name: string; url: string }> {
  const fallback = [
    { name: "Dominat8.com", url: "https://www.dominat8.com/api/d8/health" },
    { name: "Dominat8.io",  url: "https://dominat8.io/api/io/health" },
  ];

  if (!raw || !raw.trim()) return fallback;

  const parts = raw.split(";").map(s => s.trim()).filter(Boolean);
  const out: Array<{ name: string; url: string }> = [];

  for (const p of parts) {
    const eq = p.indexOf("=");
    if (eq <= 0) continue;
    const name = p.slice(0, eq).trim();
    const url = p.slice(eq + 1).trim();
    if (!name || !url) continue;
    out.push({ name, url });
  }

  return out.length ? out : fallback;
}

async function probeOne(name: string, url: string, timeoutMs: number): Promise<ProbeResult> {
  const start = Date.now();
  let status: number | null = null;

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
      signal: controller.signal,
    });

    clearTimeout(t);
    status = res.status;

    const ms = Date.now() - start;
    return { name, url, ok: res.ok, status, ms };
  } catch (e: any) {
    const ms = Date.now() - start;
    const msg = (e && e.name === "AbortError") ? "timeout" : (e?.message || "unknown error");
    return { name, url, ok: false, status, ms, error: msg };
  }
}

function classify(results: ProbeResult[], ci: CiStatus, deploy: DeployStatus) {
  const probeTotal = results.length;
  const probeOk = results.filter(r => r.ok).length;

  const ciOk = ci.ok;
  const deployOk = deploy.ok;

  const allGreen = (probeOk === probeTotal) && ciOk && deployOk;
  if (allGreen) return "GREEN";

  const everythingDead = (probeOk === 0) && (!ciOk) && (!deployOk);
  if (everythingDead) return "RED";

  return "YELLOW";
}

async function getGithubCiStatus(): Promise<CiStatus> {
  const owner = process.env.D8_GH_OWNER;
  const repo = process.env.D8_GH_REPO;
  const branch = process.env.D8_GH_BRANCH || "main";
  const token = process.env.D8_GH_TOKEN;

  if (!owner || !repo) {
    return {
      provider: "github",
      ok: false,
      status: "unknown",
      conclusion: "unknown",
      branch,
      error: "Missing D8_GH_OWNER/D8_GH_REPO",
    };
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=1&branch=${encodeURIComponent(branch)}`;

  try {
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github+json",
      "User-Agent": "D8-TV-Cockpit",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) {
      return {
        provider: "github",
        ok: false,
        status: "error",
        conclusion: "error",
        branch,
        error: `GitHub API HTTP ${res.status}`,
      };
    }

    const j: any = await res.json();
    const run = j?.workflow_runs?.[0];
    if (!run) {
      return {
        provider: "github",
        ok: false,
        status: "unknown",
        conclusion: "unknown",
        branch,
        error: "No workflow runs found",
      };
    }

    const status = String(run.status || "unknown");
    const conclusion = String(run.conclusion || (status === "completed" ? "unknown" : "unknown"));
    const ok = (status !== "completed") ? true : (conclusion === "success");

    return {
      provider: "github",
      ok,
      status,
      conclusion,
      branch,
      updatedAt: run.updated_at || run.run_started_at || undefined,
      runNumber: run.run_number || undefined,
      url: run.html_url || undefined,
    };
  } catch (e: any) {
    return {
      provider: "github",
      ok: false,
      status: "error",
      conclusion: "error",
      branch,
      error: e?.message || "Unknown error",
    };
  }
}

async function getVercelDeployStatus(): Promise<DeployStatus> {
  const token = process.env.D8_VERCEL_TOKEN;
  const projectId = process.env.D8_VERCEL_PROJECT_ID;
  const teamId = process.env.D8_VERCEL_TEAM_ID;

  if (!token) {
    return {
      provider: "vercel",
      ok: false,
      state: "unknown",
      error: "Missing D8_VERCEL_TOKEN",
    };
  }

  // Prefer project-scoped lookup for correctness
  // API: GET /v6/deployments?projectId=...&limit=1
  const qs: string[] = [];
  if (projectId) qs.push(`projectId=${encodeURIComponent(projectId)}`);
  qs.push("limit=1");
  if (teamId) qs.push(`teamId=${encodeURIComponent(teamId)}`);

  const url = `https://api.vercel.com/v6/deployments?${qs.join("&")}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        provider: "vercel",
        ok: false,
        state: "error",
        error: `Vercel API HTTP ${res.status}`,
      };
    }

    const j: any = await res.json();
    const dep = j?.deployments?.[0];
    if (!dep) {
      return {
        provider: "vercel",
        ok: false,
        state: "unknown",
        error: "No deployments found",
      };
    }

    const state = String(dep.state || dep.readyState || "unknown");
    const ok = (state === "READY");

    const depUrl = dep.url ? `https://${dep.url}` : undefined;

    return {
      provider: "vercel",
      ok,
      state,
      createdAt: dep.createdAt || undefined,
      url: depUrl,
    };
  } catch (e: any) {
    return {
      provider: "vercel",
      ok: false,
      state: "error",
      error: e?.message || "Unknown error",
    };
  }
}

export async function GET() {
  const timeoutMs = Number(process.env.D8_TV_TIMEOUT_MS || "6000");
  const probes = parseProbes(process.env.D8_TV_PROBES);

  const [probeResults, ci, deploy] = await Promise.all([
    Promise.all(probes.map(p => probeOne(p.name, p.url, timeoutMs))),
    getGithubCiStatus(),
    getVercelDeployStatus(),
  ]);

  // Placeholder agent states (same as before)
  const agents = [
    { name: "Dispatcher", state: "OK" },
    { name: "API Engineer", state: "OK" },
    { name: "DB Engineer", state: "OK" },
    { name: "UI Engineer", state: "OK" },
    { name: "Ops Doctor", state: "OK" },
  ];

  const status = classify(probeResults, ci, deploy);

  const body = {
    ts: Date.now(),
    status,
    timeoutMs,
    results: probeResults,
    ci,
    deploy,
    agents,
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
    },
  });
}