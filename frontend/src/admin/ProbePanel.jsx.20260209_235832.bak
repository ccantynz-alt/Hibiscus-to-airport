import React, { useMemo, useState } from "react";

export default function ProbePanel() {
  const [out, setOut] = useState("");
  const apiBase = useMemo(() => {
    return (process.env.REACT_APP_API_BASE || "https://api.hibiscustoairport.co.nz").replace(/\/+$/, "");
  }, []);

  const hit = async (path, method="GET", body=null) => {
    setOut(method + " " + apiBase + path + " ...");
    try {
      const res = await fetch(apiBase + path, {
        method,
        headers: body ? { "Content-Type":"application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      const txt = await res.text();
      setOut("HTTP " + res.status + "\\n" + txt);
    } catch (e) {
      setOut("ERROR: " + String(e));
    }
  };

  return (
    <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Backend Probes</div>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>
        API Base: <code>{apiBase}</code>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={()=>hit("/debug/which")} style={{ padding:"8px 10px", cursor:"pointer" }}>/debug/which</button>
        <button onClick={()=>hit("/debug/stamp")} style={{ padding:"8px 10px", cursor:"pointer" }}>/debug/stamp</button>
        <button onClick={()=>hit("/auth/health")} style={{ padding:"8px 10px", cursor:"pointer" }}>/auth/health</button>
      </div>

      <pre style={{ marginTop: 10, whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 12, borderRadius: 10 }}>
{out}
      </pre>
    </div>
  );
}