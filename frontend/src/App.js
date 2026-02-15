import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import ServiceAreas from "./pages/ServiceAreas";
import DairyFlatAirportShuttle from "./pages/DairyFlatAirportShuttle";
import LateNightAirportShuttle from "./pages/LateNightAirportShuttle";
import WarkworthAirportShuttle from "./pages/WarkworthAirportShuttle";

import AdminShell from "./admin/AdminShell";
import Cockpit from "./admin/Cockpit";
import SafeBookings from "./admin/SafeBookings";
import SafeLogin from "./admin/SafeLogin";

import RealAdminBookings from "./pages/AdminDashboard";

function AdminRoutes() {
  const [isAuthed, setIsAuthed] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem("HIBI_ADMIN_TOKEN") || localStorage.getItem("admin_token");
    setIsAuthed(!!token);
  }, []);

  const handleAuth = (token) => {
    localStorage.setItem("HIBI_ADMIN_TOKEN", token);
    localStorage.setItem("admin_token", token);
    setIsAuthed(true);
  };

  return (
    <Routes>
      <Route path="/admin" element={<Navigate to="/admin/bookings" replace />} />
      <Route path="/admin/login" element={
        isAuthed ? <Navigate to="/admin/bookings" replace /> : <SafeLogin onAuthed={handleAuth} />
      } />

      <Route
        path="/admin/bookings"
        element={
          isAuthed ? (
            <AdminShell>
              <RealAdminBookings />
            </AdminShell>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />

      <Route
        path="/admin/cockpit"
        element={
          isAuthed ? (
            <AdminShell>
              <Cockpit />
            </AdminShell>
          ) : (
            <Navigate to="/admin/login" replace />
          )
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