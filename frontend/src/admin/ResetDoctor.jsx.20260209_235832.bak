import React, { useMemo, useState } from "react";
import ProbePanel from "./ProbePanel";

export default function ResetDoctor() {
  const [email, setEmail] = useState("");
  const [out, setOut] = useState("");

  const apiBase = useMemo(() => {
    return (process.env.REACT_APP_API_BASE || "https://api.hibiscustoairport.co.nz").replace(/\/+$/, "");
  }, []);

  const reset = async () => {
    setOut("POST " + apiBase + "/admin/reset-password ...");
    try {
      const res = await fetch(apiBase + "/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ email })
      });
      const txt = await res.text();
      setOut("HTTP " + res.status + "\\n" + txt);
    } catch (e) {
      setOut("ERROR: " + String(e));
    }
  };

  return (
    <div style={{ padding: 28 }}>
      <h1>Password Reset Doctor</h1>
      <p><b>STAMP:</b> HIBI_MAJOR_005_RESTORE_BOOKINGS_AND_RESET_20260209</p>
      <p>This tool proves whether the backend reset endpoint exists and what it returns.</p>

      <div style={{ maxWidth: 520, padding: 14, border: "1px solid #ddd", borderRadius: 12 }}>
        <div style={{ marginBottom: 8, fontWeight: 700 }}>Test reset:</div>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email@example.com" style={{ width:"100%", padding: 10, marginBottom: 10 }} />
        <button onClick={reset} style={{ padding:"10px 12px", cursor:"pointer" }}>Send reset request</button>
      </div>

      <pre style={{ marginTop: 12, whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 12, borderRadius: 10 }}>
{out}
      </pre>

      <ProbePanel />
    </div>
  );
}