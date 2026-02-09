import React, { useState } from "react";

export default function OwnerLogin() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  const expected = (process.env.REACT_APP_ADMIN_OWNER_CODE || "").trim();

  const enter = () => {
    setMsg("");
    if (!expected) {
      setMsg("Owner code is NOT set. Add REACT_APP_ADMIN_OWNER_CODE in Vercel env vars, then redeploy.");
      return;
    }
    if (code.trim() !== expected) {
      setMsg("Incorrect owner code.");
      return;
    }
    localStorage.setItem("HIBI_ADMIN_TOKEN", "OWNER_OK");
    window.location.href = "/admin/bookings";
  };

  return (
    <div style={{ padding: 32, fontFamily: "system-ui, Segoe UI, Arial" }}>
      <h1>Admin Login</h1>
      <p><b>STAMP:</b> HIBI_GUARANTEED_ADMIN_ACCESS_20260209</p>

      <div style={{ maxWidth: 520, marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Emergency Owner Access</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>
          Enabled only if REACT_APP_ADMIN_OWNER_CODE is set in Vercel env vars.
        </div>

        <input
          value={code}
          onChange={(e)=>setCode(e.target.value)}
          placeholder="Owner code"
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />
        <button onClick={enter} style={{ padding: "10px 14px", cursor: "pointer" }}>
          Enter Admin
        </button>

        {msg ? <div style={{ marginTop: 12, color: "#a00" }}>{msg}</div> : null}
      </div>
    </div>
  );
}