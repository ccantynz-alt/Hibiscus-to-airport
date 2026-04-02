import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Button } from "components/ui/button";
import { cn } from "lib/utils";

const NAV_ITEMS = [
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/cockpit", label: "Cockpit", icon: LayoutDashboard },
];

function AdminNav() {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          to={href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            location.pathname === href
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("HIBI_ADMIN_TOKEN");
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#111111] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link to="/admin/bookings" className="text-white font-semibold text-sm tracking-wider">
                HIBISCUS ADMIN
              </Link>
              <AdminNav />
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-white text-xs transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                View Site
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
