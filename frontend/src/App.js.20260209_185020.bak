import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import ServiceAreas from "./pages/ServiceAreas";
import DairyFlatAirportShuttle from "./pages/DairyFlatAirportShuttle";
import LateNightAirportShuttle from "./pages/LateNightAirportShuttle";
import WarkworthAirportShuttle from "./pages/WarkworthAirportShuttle";

function AdminLoginPage() {
  return (
    <div style={{ padding: 32, fontFamily: "system-ui, Segoe UI, Arial" }}>
      <h1>Admin Login</h1>
      <p><b>STAMP:</b> ADMIN_GUARD_MODE_20260208</p>
      <p>If you see this, /admin/login is protected from all site redirects.</p>

      <div style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 10, maxWidth: 520 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Login (placeholder)</div>
        <label style={{ display: "block", marginBottom: 6 }}>Email</label>
        <input style={{ width: "100%", padding: 10, marginBottom: 12 }} placeholder="you@example.com" />
        <label style={{ display: "block", marginBottom: 6 }}>Password</label>
        <input style={{ width: "100%", padding: 10, marginBottom: 12 }} type="password" placeholder="••••••••" />
        <button style={{ padding: "10px 14px", cursor: "pointer" }}>Sign in</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <a href="/admin/cockpit" style={{ marginRight: 14 }}>Go to Cockpit</a>
        <a href="/service-areas">Go to Site</a>
      </div>
    </div>
  );
}

function CockpitPage() {
  return (
    <div style={{ padding: 32, fontFamily: "system-ui, Segoe UI, Arial" }}>
      <h1>Cockpit</h1>
      <p><b>STAMP:</b> ADMIN_GUARD_MODE_20260208</p>
      <p>This is the cockpit route inside the protected admin namespace.</p>

      <div style={{ marginTop: 20 }}>
        <a href="/admin/login" style={{ marginRight: 14 }}>Back to Admin Login</a>
        <a href="/service-areas">Go to Site</a>
      </div>
    </div>
  );
}

function AppRoutes() {
  const loc = useLocation();
  const path = (loc && loc.pathname) ? loc.pathname : "/";

  // ============================
  // ADMIN GUARD MODE (SLEDGEHAMMER)
  // If /admin* then do NOT render the marketing site router at all.
  // This prevents ANY existing redirects/useEffects from firing.
  // ============================
  if (path.startsWith("/admin")) {
    return (
      <Routes>
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/cockpit" element={<CockpitPage />} />
        {/* Admin fallback stays inside admin */}
        <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  // ============================
  // MARKETING SITE ROUTES
  // ============================
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/service-areas" replace />} />

      <Route path="/service-areas" element={<ServiceAreas />} />
      <Route path="/dairy-flat-airport-shuttle" element={<DairyFlatAirportShuttle />} />
      <Route path="/late-night-airport-shuttle" element={<LateNightAirportShuttle />} />
      <Route path="/warkworth-airport-shuttle" element={<WarkworthAirportShuttle />} />

      {/* Site fallback */}
      <Route path="*" element={<Navigate to="/service-areas" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}