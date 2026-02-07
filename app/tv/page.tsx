"use client";

import React, { useEffect, useMemo, useState } from "react";

type ProbeResult = {
  name: string;
  url: string;
  ok: boolean;
  status: number | null;
  ms: number;
  error?: string;
};

type Agent = { name: string; state: string };

type CiStatus = {
  provider: "github";
  ok: boolean;
  status: string;
  conclusion: string;
  branch?: string;
  updatedAt?: string;
  runNumber?: number;
  url?: string;
  error?: string;
};

type DeployStatus = {
  provider: "vercel";
  ok: boolean;
  state: string;
  createdAt?: number;
  url?: string;
  error?: string;
};

type Payload = {
  ts: number;
  status: "GREEN" | "YELLOW" | "RED";
  timeoutMs: number;
  results: ProbeResult[];
  ci: CiStatus;
  deploy: DeployStatus;
  agents: Agent[];
};

function badgeStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 700,
    letterSpacing: 0.5,
    fontSize: 12,
    border: "1px solid rgba(255,255,255,0.15)",
  };
  if (status === "GREEN") return { ...base, background: "rgba(0,255,128,0.12)", color: "rgba(0,255,128,0.95)" };
  if (status === "YELLOW") return { ...base, background: "rgba(255,214,0,0.12)", color: "rgba(255,214,0,0.95)" };
  return { ...base, background: "rgba(255,80,80,0.12)", color: "rgba(255,80,80,0.95)" };
}

function pill(ok: boolean): React.CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 12,
    background: ok ? "rgba(0,255,128,0.10)" : "rgba(255,80,80,0.10)",
    border: ok ? "1px solid rgba(0,255,128,0.20)" : "1px solid rgba(255,80,80,0.20)",
    color: ok ? "rgba(0,255,128,0.95)" : "rgba(255,80,80,0.95)",
    whiteSpace: "nowrap",
  };
}

function linkStyle(): React.CSSProperties {
  return { color: "rgba(120,180,255,0.95)", textDecoration: "none" };
}

export default function TVCockpitPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  const refreshEveryMs = 5000;

  async function load() {
    setErr(null);
    try {
      const res = await fetch(`/api/tv/state?ts=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = (await res.json()) as Payload;
      setData(j);
      setLastRefresh(Date.now());
    } catch (e: any) {
      setErr(e?.message || "Unknown error");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, refreshEveryMs);
    return () => clearInterval(t);
  }, []);

  const title = useMemo(() => {
    if (!data) return "TV Cockpit";
    return `TV Cockpit — ${data.status}`;
  }, [data]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(1200px 600px at 30% 10%, rgba(120,180,255,0.14), rgba(0,0,0,0)), linear-gradient(180deg, #05070a, #020305)",
      color: "white",
      padding: 24,
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
          <div style={{ opacity: 0.7, marginTop: 6, fontSize: 13 }}>
            Auto-refresh: {Math.round(refreshEveryMs/1000)}s • Last refresh: {lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : "—"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={load}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Refresh
          </button>
          <div style={badgeStyle(data?.status || "YELLOW")}>{data?.status || "LOADING"}</div>
        </div>
      </div>

      {err ? (
        <div style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 12,
          background: "rgba(255,80,80,0.10)",
          border: "1px solid rgba(255,80,80,0.20)",
        }}>
          <div style={{ fontWeight: 800 }}>API error</div>
          <div style={{ opacity: 0.85, marginTop: 6 }}>{err}</div>
        </div>
      ) : null}

      {/* Top row: CI + Deploy */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
        <div style={{
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          padding: 16,
        }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>CI Status (GitHub Actions)</div>

          {!data ? (
            <div style={{ opacity: 0.7 }}>Loading…</div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ opacity: 0.85 }}>
                  <div style={{ fontWeight: 850 }}>
                    {data.ci.branch ? `Branch: ${data.ci.branch}` : "Branch: —"}
                  </div>
                  <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
                    Status: {data.ci.status} • Conclusion: {data.ci.conclusion}
                  </div>
                  {data.ci.updatedAt ? (
                    <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
                      Updated: {new Date(data.ci.updatedAt).toLocaleString()}
                    </div>
                  ) : null}
                </div>

                <div style={pill(data.ci.ok)}>{data.ci.ok ? "OK" : "FAIL"}</div>
              </div>

              {data.ci.url ? (
                <div style={{ marginTop: 10, fontSize: 13 }}>
                  <a href={data.ci.url} target="_blank" rel="noreferrer" style={linkStyle()}>
                    Open latest run
                  </a>
                  {data.ci.runNumber ? <span style={{ opacity: 0.7 }}> • #{data.ci.runNumber}</span> : null}
                </div>
              ) : null}

              {data.ci.error ? (
                <div style={{ marginTop: 10, opacity: 0.8, fontSize: 12 }}>
                  Error: {data.ci.error}
                </div>
              ) : null}
            </>
          )}

          <div style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 14,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 12,
            opacity: 0.85,
          }}>
            Configure via env vars: <code>D8_GH_OWNER</code>, <code>D8_GH_REPO</code>, <code>D8_GH_BRANCH</code>, <code>D8_GH_TOKEN</code>.
          </div>
        </div>

        <div style={{
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          padding: 16,
        }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Deploy Status (Vercel)</div>

          {!data ? (
            <div style={{ opacity: 0.7 }}>Loading…</div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ opacity: 0.85 }}>
                  <div style={{ fontWeight: 850 }}>State: {data.deploy.state}</div>
                  {typeof data.deploy.createdAt === "number" ? (
                    <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
                      Created: {new Date(data.deploy.createdAt).toLocaleString()}
                    </div>
                  ) : null}
                </div>

                <div style={pill(data.deploy.ok)}>{data.deploy.ok ? "READY" : "NOT READY"}</div>
              </div>

              {data.deploy.url ? (
                <div style={{ marginTop: 10, fontSize: 13 }}>
                  <a href={data.deploy.url} target="_blank" rel="noreferrer" style={linkStyle()}>
                    Open latest deployment
                  </a>
                </div>
              ) : null}

              {data.deploy.error ? (
                <div style={{ marginTop: 10, opacity: 0.8, fontSize: 12 }}>
                  Error: {data.deploy.error}
                </div>
              ) : null}
            </>
          )}

          <div style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 14,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 12,
            opacity: 0.85,
          }}>
            Configure via env vars: <code>D8_VERCEL_TOKEN</code>, <code>D8_VERCEL_PROJECT_ID</code>, optional <code>D8_VERCEL_TEAM_ID</code>.
          </div>
        </div>
      </div>

      {/* Bottom row: Health + Agents (unchanged layout) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div style={{
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          padding: 16,
        }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>System Health</div>
          <div style={{ opacity: 0.75, fontSize: 13, marginBottom: 10 }}>
            Probes run server-side to avoid CORS. Configure via <code style={{ opacity: 0.9 }}>D8_TV_PROBES</code>.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(data?.results || []).map((r) => (
              <div key={r.name} style={{
                padding: 12,
                borderRadius: 14,
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: 999,
                      background: r.ok ? "rgba(0,255,128,0.95)" : "rgba(255,80,80,0.95)",
                      boxShadow: r.ok ? "0 0 18px rgba(0,255,128,0.35)" : "0 0 18px rgba(255,80,80,0.35)"
                    }} />
                    <span>{r.name}</span>
                  </div>
                  <div style={{ opacity: 0.65, fontSize: 12, marginTop: 4, wordBreak: "break-all" }}>{r.url}</div>
                  {r.error ? <div style={{ opacity: 0.8, fontSize: 12, marginTop: 4 }}>Error: {r.error}</div> : null}
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900 }}>{r.ok ? "OK" : "FAIL"}</div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>HTTP: {r.status ?? "—"}</div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>{r.ms} ms</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          padding: 16,
        }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Agent Activity</div>
          <div style={{ opacity: 0.75, fontSize: 13, marginBottom: 10 }}>
            Placeholder states now. Next: wire to your real agent loop telemetry (KV / control-plane).
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(data?.agents || []).map((a) => (
              <div key={a.name} style={{
                padding: 12,
                borderRadius: 14,
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}>
                <div style={{ fontWeight: 850 }}>{a.name}</div>
                <div style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}>
                  {a.state}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 14,
            background: "rgba(120,180,255,0.08)",
            border: "1px solid rgba(120,180,255,0.18)",
            fontSize: 13,
            opacity: 0.9,
          }}>
            Next wiring step (fast): have your doctor loop write a JSON snapshot somewhere (KV / endpoint),
            then replace <code>agents</code> in <code>/api/tv/state</code> with that snapshot.
          </div>
        </div>
      </div>

      <div style={{ opacity: 0.6, fontSize: 12, marginTop: 18 }}>
        Endpoint: <code>/api/tv/state</code> • Page: <code>/tv</code>
      </div>
    </div>
  );
}