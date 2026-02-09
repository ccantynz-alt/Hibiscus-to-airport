import React, { useMemo, useState } from "react";

export default function Cockpit() {
  const [out, setOut] = useState("");
  const apiBase = useMemo(() => {
    return (process.env.REACT_APP_API_BASE || "https://api.hibiscustoairport.co.nz").replace(/\/+$/, "");
  }, []);

  const probe = async (path) => {
    setOut("Probing " + path + " ...");
    try {
      const res = await fetch(apiBase + path, { method: "GET" });
      const txt = await res.text();
      setOut("HTTP " + res.status + "\n" + txt);
    } catch (e) {
      setOut("Probe error: " + String(e));
    }
  };

  return (
    <div style={{ padding: 28 }}>
      <h1>Cockpit</h1>
      <p><b>STAMP:</b> HIBI_FINAL_AUTH_REAL_BOOKINGS_COCKPIT_004_20260209</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <button onClick={()=>probe("/debug/which")} style={{ padding: "10px 12px", cursor: "pointer" }}>
          Probe /debug/which
        </button>
        <button onClick={()=>probe("/debug/stamp")} style={{ padding: "10px 12px", cursor: "pointer" }}>
          Probe /debug/stamp
        </button>
      </div>

      <pre style={{ marginTop: 14, whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 12, borderRadius: 10 }}>
{out}
      </pre>
    </div>
  );
}