import React, { useMemo, useState } from "react";

/**
 * SAFE LOGIN (never blocks you)
 * - If REACT_APP_ADMIN_OWNER_CODE is set, an emergency owner login is available.
 * - Otherwise, uses backend login endpoint (configurable).
 */
export default function SafeLogin({ onAuthed }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ownerCode, setOwnerCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const apiBase = useMemo(() => {
    // Prefer explicit env; fallback to your known backend domain.
    const base = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_BASE || "https://api.hibiscustoairport.co.nz";
    return base.replace(/\/+$/, "");
  }, []);

  const ownerEnabled = !!process.env.REACT_APP_ADMIN_OWNER_CODE;

  const doOwner = async () => {
    setMsg("");
    const expected = process.env.REACT_APP_ADMIN_OWNER_CODE || "";
    if (!expected) {
      setMsg("Owner code not enabled in env.");
      return;
    }
    if ((ownerCode || "").trim() !== expected.trim()) {
      setMsg("Owner code incorrect.");
      return;
    }
    localStorage.setItem("HIBI_ADMIN_TOKEN", "OWNER_OK");
    localStorage.setItem("admin_token", "OWNER_OK");
    onAuthed("OWNER_OK");
  };

  const doLogin = async () => {
    setBusy(true);
    setMsg("");
    try {
      const url = apiBase + "/api/admin/login";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const txt = await res.text();
      let data = null;
      try { data = JSON.parse(txt); } catch { data = { raw: txt }; }

      if (!res.ok) {
        setMsg("Login failed: HTTP " + res.status + " " + (data?.detail || data?.raw || ""));
        setBusy(false);
        return;
      }

      const token = data?.token || data?.access_token || data?.jwt || "OK";
      localStorage.setItem("HIBI_ADMIN_TOKEN", token);
      localStorage.setItem("admin_token", token);
      onAuthed(token);
    } catch (e) {
      setMsg("Login error: " + String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 28 }}>
      <h1>Admin Login</h1>
      <p><b>STAMP:</b> HIBI_FINAL_AUTH_REAL_BOOKINGS_COCKPIT_004_20260209</p>

      <div style={{ maxWidth: 460, marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Sign in</div>

        <label style={{ display: "block", marginBottom: 6 }}>Username</label>
        <input 
          value={username} 
          onChange={(e)=>setUsername(e.target.value)} 
          placeholder="admin"
          style={{ width: "100%", padding: 10, marginBottom: 12 }} 
        />

        <label style={{ display: "block", marginBottom: 6 }}>Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e)=>setPassword(e.target.value)} 
          placeholder="Enter your password"
          style={{ width: "100%", padding: 10, marginBottom: 12 }} 
        />

        <button onClick={doLogin} disabled={busy} style={{ padding: "10px 14px", cursor: "pointer" }}>
          {busy ? "Signing in..." : "Sign in"}
        </button>

        {msg ? <div style={{ marginTop: 12, color: "#a00" }}>{msg}</div> : null}
      </div>

      {ownerEnabled ? (
        <div style={{ maxWidth: 460, marginTop: 18, padding: 16, border: "1px dashed #888", borderRadius: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Emergency Owner Access</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>
            Enabled only if REACT_APP_ADMIN_OWNER_CODE is set in Vercel env vars.
          </div>
          <input
            placeholder="Owner code"
            value={ownerCode}
            onChange={(e)=>setOwnerCode(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />
          <button onClick={doOwner} style={{ padding: "10px 14px", cursor: "pointer" }}>
            Enter as Owner
          </button>
        </div>
      ) : null}
    </div>
  );
}