import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import ServiceAreas from "./pages/ServiceAreas";
import DairyFlatAirportShuttle from "./pages/DairyFlatAirportShuttle";
import LateNightAirportShuttle from "./pages/LateNightAirportShuttle";
import WarkworthAirportShuttle from "./pages/WarkworthAirportShuttle";

import ErrorBoundary from "./admin/ErrorBoundary";
import AuthGate from "./admin/AuthGate";
import AdminShell from "./admin/AdminShell";
import Cockpit from "./admin/Cockpit";
import SafeBookings from "./admin/SafeBookings";
import RealAdminLogin from "./pages/AdminLogin";
import RealAdminBookings from "./pages/AdminDashboard";

function AdminRoutes() {
  return (
    <AuthGate LoginComponent={<RealAdminLogin />}>
      <Routes>
        <Route path="/admin" element={<Navigate to="/admin/bookings" replace />} />

        {/* Login route always exists; AuthGate will show login if no token */}
        <Route path="/admin/login" element={<Navigate to="/admin/bookings" replace />} />

        <Route
          path="/admin/bookings"
          element={
            <AdminShell>
              <ErrorBoundary>
                <RealAdminBookings />
              </ErrorBoundary>
            </AdminShell>
          }
        />

        <Route
          path="/admin/cockpit"
          element={
            <AdminShell>
              <ErrorBoundary>
                <Cockpit />
              </ErrorBoundary>
            </AdminShell>
          }
        />

        <Route path="/admin/*" element={<Navigate to="/admin/bookings" replace />} />
      </Routes>
    </AuthGate>
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

  // ADMIN GUARD MODE: keep admin completely isolated from public redirects
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