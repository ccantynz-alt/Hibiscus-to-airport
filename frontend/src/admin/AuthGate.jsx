import React, { useEffect, useMemo, useState } from "react";
import SafeLogin from "./SafeLogin";

/**
 * AuthGate:
 * - Stores token in localStorage (HIBI_ADMIN_TOKEN)
 * - If token exists -> authed
 * - If not -> show login
 */
export default function AuthGate({ LoginComponent, children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("HIBI_ADMIN_TOKEN");
    if (t) setToken(t);
  }, []);

  const onAuthed = useMemo(() => {
    return (t) => {
      localStorage.setItem("HIBI_ADMIN_TOKEN", t);
      setToken(t);
      try { window.location.href = "/admin/bookings"; } catch {}
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("HIBI_ADMIN_TOKEN");
    setToken(null);
    try { window.location.href = "/admin/login"; } catch {}
  };

  if (!token) {
    if (LoginComponent) {
      // We cannot safely inject props into unknown real login components.
      // So we wrap it in a shim + provide a "Safe Login" escape hatch below.
      return (
        <div>
          <div style={{ padding: 12, background: "#111", color: "#fff", fontFamily: "system-ui", fontSize: 12 }}>
            Admin AuthGate active — STAMP: HIBI_FINAL_AUTH_REAL_BOOKINGS_COCKPIT_004_20260209
          </div>

          <div style={{ padding: 14, borderBottom: "1px solid #ddd" }}>
            <button onClick={()=>{ localStorage.removeItem("HIBI_ADMIN_TOKEN"); }} style={{ padding: "8px 10px", cursor: "pointer" }}>
              Clear Token
            </button>
          </div>

          <div style={{ padding: 10 }}>
            {LoginComponent}
          </div>

          <div style={{ padding: 10, borderTop: "1px solid #ddd" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>If real login fails, use Safe Login:</div>
            <SafeLogin onAuthed={onAuthed} />
          </div>
        </div>
      );
    }

    return <SafeLogin onAuthed={onAuthed} />;
  }

  // Logged in
  return (
    <div>
      <div style={{ padding: 10, background: "#111", color: "#fff", fontFamily: "system-ui", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>Admin Auth: OK — STAMP: HIBI_FINAL_AUTH_REAL_BOOKINGS_COCKPIT_004_20260209</div>
        <button onClick={logout} style={{ padding: "8px 10px", cursor: "pointer" }}>Logout</button>
      </div>
      {children}
    </div>
  );
}