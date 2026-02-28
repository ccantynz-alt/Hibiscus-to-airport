import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

// --- Public pages ---
import HomePage from "./pages/HomePage";
import ServiceAreas from "./pages/ServiceAreas";
import BookingPage from "./pages/BookingPage";
import FAQ from "./pages/FAQ";

// Suburb shuttle pages
import OrewaShuttle from "./pages/OrewaShuttle";
import OrewaToAirport from "./pages/OrewaToAirport";
import SilverdaleShuttle from "./pages/SilverdaleShuttle";
import WhangaparaoaShuttle from "./pages/WhangaparaoaShuttle";
import RedBeachShuttle from "./pages/RedBeachShuttle";
import GulfHarbourShuttle from "./pages/GulfHarbourShuttle";
import StanmoreBayShuttle from "./pages/StanmoreBayShuttle";
import ArklesBayShuttle from "./pages/ArklesBayShuttle";
import ArmyBayShuttle from "./pages/ArmyBayShuttle";
import HatfieldsBeachShuttle from "./pages/HatfieldsBeachShuttle";
import ManlyShuttle from "./pages/ManlyShuttle";
import AlbanyShuttle from "./pages/AlbanyShuttle";
import TakapunaShuttle from "./pages/TakapunaShuttle";
import BrownsBayShuttle from "./pages/BrownsBayShuttle";
import MairangiBayShuttle from "./pages/MairangiBayShuttle";
import DevonportShuttle from "./pages/DevonportShuttle";
import DairyFlatAirportShuttle from "./pages/DairyFlatAirportShuttle";
import WarkworthAirportShuttle from "./pages/WarkworthAirportShuttle";
import MillwaterAirportShuttle from "./pages/MillwaterAirportShuttle";
import OmahaAirportShuttle from "./pages/OmahaAirportShuttle";
import PuhoiAirportShuttle from "./pages/PuhoiAirportShuttle";
import SnellsBeachAirportShuttle from "./pages/SnellsBeachAirportShuttle";
import WellsfordAirportShuttle from "./pages/WellsfordAirportShuttle";
import LeighAirportShuttle from "./pages/LeighAirportShuttle";

// Service type pages
import AucklandAirportTransfers from "./pages/AucklandAirportTransfers";
import CorporateTransfers from "./pages/CorporateTransfers";
import StudentAirportTransfers from "./pages/StudentAirportTransfers";
import ExecutiveAirportTransfers from "./pages/ExecutiveAirportTransfers";
import FamilyAirportShuttle from "./pages/FamilyAirportShuttle";
import BusinessAirportTransfer from "./pages/BusinessAirportTransfer";
import CruiseTransfers from "./pages/CruiseTransfers";
import BestAirportShuttle from "./pages/BestAirportShuttle";
import HibiscusShuttlesAlternative from "./pages/HibiscusShuttlesAlternative";
import LocalAirportShuttle from "./pages/LocalAirportShuttle";
import AirportShuttleOrewa from "./pages/AirportShuttleOrewa";
import LateNightAirportShuttle from "./pages/LateNightAirportShuttle";
import EarlyMorningShuttle from "./pages/EarlyMorningShuttle";
import EarlyMorningFlightShuttle from "./pages/EarlyMorningFlightShuttle";
import AirportArrivals from "./pages/AirportArrivals";

// School pages
import OrewaCollegeShuttle from "./pages/OrewaCollegeShuttle";
import WhangaparaoaCollegeShuttle from "./pages/WhangaparaoaCollegeShuttle";
import KingswaySchoolShuttle from "./pages/KingswaySchoolShuttle";
import LongBayCollegeShuttle from "./pages/LongBayCollegeShuttle";
import RangitotoCollegeShuttle from "./pages/RangitotoCollegeShuttle";

// Matakana pages
import MatakanaShuttle from "./pages/MatakanaShuttle";
import MatakanaEventsShuttle from "./pages/MatakanaEventsShuttle";
import MatakanaConcertShuttle from "./pages/MatakanaConcertShuttle";
import MatakanaFarmersMarketShuttle from "./pages/MatakanaFarmersMarketShuttle";
import MatakanaWineryShuttle from "./pages/MatakanaWineryShuttle";
import MatakanaVillageShuttle from "./pages/MatakanaVillageShuttle";

// Payment pages
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

// Driver / tracking pages
import DriverPortal from "./pages/DriverPortal";
import DriverJobResponse from "./pages/DriverJobResponse";
import DriverTracking from "./pages/DriverTracking";
import CustomerTracking from "./pages/CustomerTracking";
import FlightTracker from "./pages/FlightTracker";

// --- Admin pages ---
import AdminLogin from "./pages/AdminLogin";
import AdminShell from "./admin/AdminShell";
import Cockpit from "./admin/Cockpit";
import RealAdminBookings from "./pages/AdminDashboard";
import AdminCreateBooking from "./pages/AdminCreateBooking";
import AdminEditBooking from "./pages/AdminEditBooking";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminSEO from "./pages/AdminSEO";
import ChangePassword from "./pages/ChangePassword";

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

      <Route
        path="/admin/create-booking"
        element={
          <RequireAuth>
            <AdminShell>
              <AdminCreateBooking />
            </AdminShell>
          </RequireAuth>
        }
      />

      <Route
        path="/admin/edit-booking/:id"
        element={
          <RequireAuth>
            <AdminShell>
              <AdminEditBooking />
            </AdminShell>
          </RequireAuth>
        }
      />

      <Route
        path="/admin/reset-password"
        element={
          <RequireAuth>
            <AdminShell>
              <AdminResetPassword />
            </AdminShell>
          </RequireAuth>
        }
      />

      <Route
        path="/admin/change-password"
        element={
          <RequireAuth>
            <AdminShell>
              <ChangePassword />
            </AdminShell>
          </RequireAuth>
        }
      />

      <Route
        path="/admin/seo"
        element={
          <RequireAuth>
            <AdminShell>
              <AdminSEO />
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
      {/* Home — full landing page with Hero, Services, Fleet, About, Contact */}
      <Route path="/" element={<HomePage />} />
      <Route path="/service-areas" element={<ServiceAreas />} />

      {/* Booking */}
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/book-now" element={<BookingPage />} />

      {/* FAQ */}
      <Route path="/faq" element={<FAQ />} />

      {/* Payment */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />

      {/* Suburb shuttle pages - Hibiscus Coast */}
      <Route path="/orewa-airport-shuttle" element={<OrewaShuttle />} />
      <Route path="/orewa-to-auckland-airport-shuttle" element={<OrewaToAirport />} />
      <Route path="/silverdale-airport-shuttle" element={<SilverdaleShuttle />} />
      <Route path="/whangaparaoa-airport-shuttle" element={<WhangaparaoaShuttle />} />
      <Route path="/red-beach-airport-shuttle" element={<RedBeachShuttle />} />
      <Route path="/gulf-harbour-airport-shuttle" element={<GulfHarbourShuttle />} />
      <Route path="/stanmore-bay-airport-shuttle" element={<StanmoreBayShuttle />} />
      <Route path="/arkles-bay-airport-shuttle" element={<ArklesBayShuttle />} />
      <Route path="/army-bay-airport-shuttle" element={<ArmyBayShuttle />} />
      <Route path="/hatfields-beach-airport-shuttle" element={<HatfieldsBeachShuttle />} />
      <Route path="/dairy-flat-airport-shuttle" element={<DairyFlatAirportShuttle />} />
      <Route path="/millwater-airport-shuttle" element={<MillwaterAirportShuttle />} />

      {/* North Shore suburbs */}
      <Route path="/manly-airport-shuttle" element={<ManlyShuttle />} />
      <Route path="/albany-airport-shuttle" element={<AlbanyShuttle />} />
      <Route path="/takapuna-airport-shuttle" element={<TakapunaShuttle />} />
      <Route path="/browns-bay-airport-shuttle" element={<BrownsBayShuttle />} />
      <Route path="/mairangi-bay-airport-shuttle" element={<MairangiBayShuttle />} />
      <Route path="/devonport-airport-shuttle" element={<DevonportShuttle />} />

      {/* Northern towns */}
      <Route path="/warkworth-airport-shuttle" element={<WarkworthAirportShuttle />} />
      <Route path="/wellsford-airport-shuttle" element={<WellsfordAirportShuttle />} />
      <Route path="/leigh-airport-shuttle" element={<LeighAirportShuttle />} />
      <Route path="/omaha-airport-shuttle" element={<OmahaAirportShuttle />} />
      <Route path="/puhoi-airport-shuttle" element={<PuhoiAirportShuttle />} />
      <Route path="/snells-beach-airport-shuttle" element={<SnellsBeachAirportShuttle />} />

      {/* Service type pages */}
      <Route path="/auckland-airport-transfers" element={<AucklandAirportTransfers />} />
      <Route path="/corporate-airport-transfers" element={<CorporateTransfers />} />
      <Route path="/student-airport-transfers" element={<StudentAirportTransfers />} />
      <Route path="/executive-airport-transfers" element={<ExecutiveAirportTransfers />} />
      <Route path="/family-airport-shuttle" element={<FamilyAirportShuttle />} />
      <Route path="/business-airport-transfer" element={<BusinessAirportTransfer />} />
      <Route path="/cruise-ship-transfers" element={<CruiseTransfers />} />
      <Route path="/best-airport-shuttle-hibiscus-coast" element={<BestAirportShuttle />} />
      <Route path="/hibiscus-shuttles-alternative" element={<HibiscusShuttlesAlternative />} />
      <Route path="/local-airport-shuttle" element={<LocalAirportShuttle />} />
      <Route path="/airport-shuttle-orewa" element={<AirportShuttleOrewa />} />
      <Route path="/late-night-airport-shuttle" element={<LateNightAirportShuttle />} />
      <Route path="/early-morning-airport-shuttle" element={<EarlyMorningShuttle />} />
      <Route path="/early-morning-flight-shuttle" element={<EarlyMorningFlightShuttle />} />
      <Route path="/airport-arrivals" element={<AirportArrivals />} />

      {/* School pages */}
      <Route path="/orewa-college-airport-shuttle" element={<OrewaCollegeShuttle />} />
      <Route path="/whangaparaoa-college-airport-shuttle" element={<WhangaparaoaCollegeShuttle />} />
      <Route path="/kingsway-school-airport-shuttle" element={<KingswaySchoolShuttle />} />
      <Route path="/long-bay-college-airport-shuttle" element={<LongBayCollegeShuttle />} />
      <Route path="/rangitoto-college-airport-shuttle" element={<RangitotoCollegeShuttle />} />

      {/* Matakana pages */}
      <Route path="/matakana-shuttle" element={<MatakanaShuttle />} />
      <Route path="/matakana-events-shuttle" element={<MatakanaEventsShuttle />} />
      <Route path="/matakana-concert-shuttle" element={<MatakanaConcertShuttle />} />
      <Route path="/matakana-farmers-market-shuttle" element={<MatakanaFarmersMarketShuttle />} />
      <Route path="/matakana-winery-shuttle" element={<MatakanaWineryShuttle />} />
      <Route path="/matakana-village-shuttle" element={<MatakanaVillageShuttle />} />

      {/* Driver / tracking pages */}
      <Route path="/driver-portal" element={<DriverPortal />} />
      <Route path="/driver/job/:id" element={<DriverJobResponse />} />
      <Route path="/driver-tracking" element={<DriverTracking />} />
      <Route path="/customer-tracking" element={<CustomerTracking />} />
      <Route path="/tracking/:ref" element={<CustomerTracking />} />
      <Route path="/flight-tracker" element={<FlightTracker />} />

      {/* Catch-all: redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
