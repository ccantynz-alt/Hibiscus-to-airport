import React, { useMemo, useState } from "react";
import ProbePanel from "./ProbePanel";

export default function ResetDoctor() {
  const [email, setEmail] = useState("");
  const [out, setOut] = useState("");
  const [lastPath, setLastPath] = useState("");

  const apiBase = useMemo(() => {
    return (process.env.REACT_APP_API_BASE || "https://api.hibiscustoairport.co.nz").replace(/\/+$/, "");
  }, []);

  const resetPaths = ["/admin/reset-password","/auth/reset-password","/admin/request-password-reset","/auth/request-password-reset"];

  const tryReset = async () => {
    setOut("Trying reset paths...\\n");
    for (const path of resetPaths) {
      setLastPath(path);
      setOut((prev) => prev + ("POST " + apiBase + path + " ...\\n"));
      try {
        const res = await fetch(apiBase + path, {
          method: "POST",
          headers: { "Content-Type":"application/json" },
          body: JSON.stringify({ email })
        });
        const txt = await res.text();
        setOut((prev) => prev + ("HTTP " + res.status + " @ " + path + "\\n" + txt + "\\n\\n"));
        if (res.status !== 404) return;
      } catch (e) {
        setOut((prev) => prev + ("ERROR @ " + path + ": " + String(e) + "\\n\\n"));
      }
    }
  };

  return (
    <div style={{ padding: 28 }}>
      <h1>Password Reset Doctor</h1>
      <p><b>STAMP:</b> HIBI_MEGA_PACK_001_FINISH_ADMIN_20260209</p>
      <p><b>API Base:</b> <code>{apiBase}</code></p>
      <p><b>Last tried path:</b> <code>{lastPath}</code></p>

      <div style={{ maxWidth: 520, padding: 14, border: "1px solid #ddd", borderRadius: 12 }}>
        <div style={{ marginBottom: 8, fontWeight: 700 }}>Test reset:</div>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email@example.com" style={{ width:"100%", padding: 10, marginBottom: 10 }} />
        <button onClick={tryReset} style={{ padding:"10px 12px", cursor:"pointer" }}>Try reset (auto-fallback)</button>
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
          Paths: <code>{resetPaths.join(", ")}</code>
        </div>
      </div>

      <pre style={{ marginTop: 12, whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 12, borderRadius: 10 }}>
{out}
      </pre>

      <ProbePanel />
    </div>
  );
}