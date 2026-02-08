import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ServiceAreas from "./pages/ServiceAreas";
import DairyFlatAirportShuttle from "./pages/DairyFlatAirportShuttle";
import LateNightAirportShuttle from "./pages/LateNightAirportShuttle";
import WarkworthAirportShuttle from "./pages/WarkworthAirportShuttle";

function StatusTile({ title, value }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: 16,
      borderRadius: 8,
      background: "#fafafa",
      minWidth: 180
    }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function AdminPage() {
  const [backend, setBackend] = useState("checking…");

  useEffect(() => {
    fetch("https://api.hibiscustoairport.co.nz/debug/stamp")
      .then(r => r.json())
      .then(d => setBackend("OK"))
      .catch(() => setBackend("offline"));
  }, []);

  return (
    <div style={{ padding: 32, fontFamily: "system-ui, Segoe UI, Arial" }}>
      <h1>Admin Cockpit</h1>
      <p><b>System overview</b></p>

      <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
        <StatusTile title="Backend" value={backend} />
        <StatusTile title="Frontend" value="OK" />
        <StatusTile title="Auth" value="temporary bypass" />
        <StatusTile title="Agents" value="not installed" />
      </div>

      <div style={{
        marginTop: 30,
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 10
      }}>
        <h2>Cockpit</h2>
        <p>This is where the agent control panel will appear.</p>
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/service-areas" replace />} />
        <Route path="/service-areas" element={<ServiceAreas />} />
        <Route path="/dairy-flat-airport-shuttle" element={<DairyFlatAirportShuttle />} />
        <Route path="/late-night-airport-shuttle" element={<LateNightAirportShuttle />} />
        <Route path="/warkworth-airport-shuttle" element={<WarkworthAirportShuttle />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/service-areas" replace />} />
      </Routes>
    </BrowserRouter>
  );
}