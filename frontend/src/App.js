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
  const login = () => {
    localStorage.setItem("ADMIN_OWNER", "true");
    window.location.href = "/admin/bookings";
  };

  return (
    <div style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Admin Login</h1>
      <p><b>STAMP:</b> HIBI_FINAL_FINISH_20260209</p>

      <button
        onClick={login}
        style={{
          padding: "14px 20px",
          fontSize: 18,
          cursor: "pointer",
          marginTop: 20
        }}
      >
        Enter Admin (Owner Bypass)
      </button>
    </div>
  );
}

function AdminBookings() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Bookings Admin</h1>
      <p><b>STAMP:</b> HIBI_FINAL_FINISH_20260209</p>

      <div style={{ marginTop: 20 }}>
        <a href="/admin/cockpit">Go to Cockpit</a>
      </div>
    </div>
  );
}

function CockpitPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Cockpit</h1>
      <p><b>STAMP:</b> HIBI_FINAL_FINISH_20260209</p>

      <div style={{ marginTop: 20 }}>
        <a href="/admin/bookings">Back to Bookings</a>
      </div>
    </div>
  );
}

function AdminLayout({ children }) {
  return (
    <div style={{ fontFamily: "system-ui" }}>
      <div style={{
        display: "flex",
        gap: 20,
        padding: 16,
        background: "#111",
        color: "#fff"
      }}>
        <a href="/admin/bookings" style={{ color: "#fff" }}>Bookings</a>
        <a href="/admin/cockpit" style={{ color: "#fff" }}>Cockpit</a>
        <a href="/service-areas" style={{ color: "#fff" }}>Public Site</a>
      </div>
      {children}
    </div>
  );
}

function AppRoutes() {
  const loc = useLocation();
  const path = loc?.pathname || "/";

  if (path.startsWith("/admin")) {
    return (
      <Routes>
        <Route path="/admin" element={<Navigate to="/admin/bookings" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin/bookings"
          element={
            <AdminLayout>
              <AdminBookings />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/cockpit"
          element={
            <AdminLayout>
              <CockpitPage />
            </AdminLayout>
          }
        />

        <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/service-areas" replace />} />
      <Route path="/service-areas" element={<ServiceAreas />} />
      <Route path="/dairy-flat-airport-shuttle" element={<DairyFlatAirportShuttle />} />
      <Route path="/late-night-airport-shuttle" element={<LateNightAirportShuttle />} />
      <Route path="/warkworth-airport-shuttle" element={<WarkworthAirportShuttle />} />
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