import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import ServiceAreas from "./pages/ServiceAreas";
import DairyFlatAirportShuttle from "./pages/DairyFlatAirportShuttle";
import LateNightAirportShuttle from "./pages/LateNightAirportShuttle";
import WarkworthAirportShuttle from "./pages/WarkworthAirportShuttle";

import AdminShell from "./admin/AdminShell";
import Cockpit from "./admin/Cockpit";
import SafeBookings from "./admin/SafeBookings";


// -PinLoginImport — STAMP: HIBI_MEGA_PACK_003_FINISH_OVERNIGHT_20260210
import PinLoginImport from "./pages/AdminLogin";
import RealAdminBookings from "./pages/AdminDashboard";

function ClearAdminSession() {
  React.useEffect(() => {
    try {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("HIBI_ADMIN_TOKEN");
    } catch {}
    // Replace avoids a back-button loop.
    window.location.replace("/admin/login");
  }, []);

  return (
    <div style={{ padding: 28 }}>
      <h1>Clearing admin session…</h1>
      <p><b>STAMP:</b> HIBI_MEGA_PACK_003_FINISH_OVERNIGHT_20260210</p>
      <p>If you are not redirected, <a href="/admin/login">click here</a>.</p>
    </div>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<Navigate to="/admin/bookings" replace />} />
      <Route path="/admin/login" element={<PinLoginImport />} />
      <Route path="/admin/clear" element={<ClearAdminSession />} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin/bookings" replace />} />

      <Route
        path="/admin/bookings"
        element={
          <AdminShell>
            <RealAdminBookings />
          </AdminShell>
        }
      />

      <Route
        path="/admin/cockpit"
        element={
          <AdminShell>
            <Cockpit />
          </AdminShell>
        }
      />

      <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

function PublicRoutes() {
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

function RouterSwitch() {
  const loc = useLocation();
  const path = loc?.pathname || "/";
  if (path.startsWith("/admin")) return <AdminRoutes />;
  return <PublicRoutes />;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouterSwitch />
    </BrowserRouter>
  );
}