import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import ServiceAreas from "./pages/ServiceAreas";
import DairyFlatAirportShuttle from "./pages/DairyFlatAirportShuttle";
import LateNightAirportShuttle from "./pages/LateNightAirportShuttle";
import WarkworthAirportShuttle from "./pages/WarkworthAirportShuttle";

import AdminLogin from "./pages/AdminLogin";
import AdminShell from "./admin/AdminShell";
import Cockpit from "./admin/Cockpit";

import RealAdminBookings from "./pages/AdminDashboard";

/**
 * Simple auth check: if an admin token exists in localStorage the user is
 * considered logged in.  The actual token is validated server-side on every
 * API call, so this is purely a UX guard.
 */
function RequireAuth({ children }) {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("HIBI_ADMIN_TOKEN");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function AdminRoutes() {
  return (
    <Routes>
      {/* Login — always accessible */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Redirect bare /admin to /admin/bookings */}
      <Route path="/admin" element={<Navigate to="/admin/bookings" replace />} />

      {/* Protected admin pages */}
      <Route
        path="/admin/bookings"
        element={
          <RequireAuth>
            <AdminShell>
              <RealAdminBookings />
            </AdminShell>
          </RequireAuth>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <RequireAuth>
            <AdminShell>
              <RealAdminBookings />
            </AdminShell>
          </RequireAuth>
        }
      />

      <Route
        path="/admin/cockpit"
        element={
          <RequireAuth>
            <AdminShell>
              <Cockpit />
            </AdminShell>
          </RequireAuth>
        }
      />

      {/* Catch-all for unknown /admin/* paths */}
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
