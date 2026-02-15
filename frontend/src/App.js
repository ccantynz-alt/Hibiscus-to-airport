import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import ServiceAreas from "./pages/ServiceAreas";
import DairyFlatAirportShuttle from "./pages/DairyFlatAirportShuttle";
import LateNightAirportShuttle from "./pages/LateNightAirportShuttle";
import WarkworthAirportShuttle from "./pages/WarkworthAirportShuttle";
import OrewaShuttle from "./pages/OrewaShuttle";
import SilverdaleShuttle from "./pages/SilverdaleShuttle";
import WhangaparaoaShuttle from "./pages/WhangaparaoaShuttle";
import RedBeachShuttle from "./pages/RedBeachShuttle";
import GulfHarbourShuttle from "./pages/GulfHarbourShuttle";
import MillwaterAirportShuttle from "./pages/MillwaterAirportShuttle";

import AdminShell from "./admin/AdminShell";
import Cockpit from "./admin/Cockpit";
import RealAdminBookings from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import BookingPage from "./pages/BookingPage";

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<Navigate to="/admin/bookings" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />

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
      <Route path="/book-now" element={<BookingPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/dairy-flat-airport-shuttle" element={<DairyFlatAirportShuttle />} />
      <Route path="/late-night-airport-shuttle" element={<LateNightAirportShuttle />} />
      <Route path="/warkworth-airport-shuttle" element={<WarkworthAirportShuttle />} />
      <Route path="/orewa-airport-shuttle" element={<OrewaShuttle />} />
      <Route path="/silverdale-airport-shuttle" element={<SilverdaleShuttle />} />
      <Route path="/whangaparaoa-airport-shuttle" element={<WhangaparaoaShuttle />} />
      <Route path="/red-beach-airport-shuttle" element={<RedBeachShuttle />} />
      <Route path="/gulf-harbour-airport-shuttle" element={<GulfHarbourShuttle />} />
      <Route path="/millwater-airport-shuttle" element={<MillwaterAirportShuttle />} />
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