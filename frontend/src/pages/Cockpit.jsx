import React from "react";

export default function Cockpit() {
  return (
    <div style={{ padding: 32, fontFamily: "system-ui, Segoe UI, Arial" }}>
      <h1>Cockpit</h1>
      <p><b>STAMP:</b> COCKPIT_ROUTE_20260208</p>
      <p>This is the cockpit route. Next: embed this inside the real admin panel.</p>

      <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
        <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8, minWidth: 180 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Backend</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>checking…</div>
        </div>
        <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8, minWidth: 180 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Frontend</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>OK</div>
        </div>
        <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8, minWidth: 180 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Agents</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>pending</div>
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
        <h2>Controls</h2>
        <ul>
          <li>System health</li>
          <li>Auto-repair status</li>
          <li>Patch queue</li>
          <li>Deploy controls</li>
        </ul>
      </div>
    </div>
  );
}