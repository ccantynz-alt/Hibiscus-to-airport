import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Users,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CreditCard,
} from "lucide-react";

import Header from "components/Header";
import Footer from "components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";
import { Alert, AlertDescription } from "components/ui/alert";
import { Badge } from "components/ui/badge";
import { lookupBooking } from "lib/api";
import type { Booking } from "@/types/booking";

function statusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
    case "completed":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "in_progress":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

function paymentBadge(status: string) {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    case "refunded":
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Refunded</Badge>;
    default:
      return <Badge variant="outline">Unpaid</Badge>;
  }
}

export default function MyBooking() {
  const [searchParams] = useSearchParams();
  const [refInput, setRefInput] = useState(searchParams.get("ref") || "");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if ref is in URL (runs once on mount)
  const initialRef = searchParams.get("ref");
  useEffect(() => {
    if (initialRef) {
      handleSearch(initialRef);
    }
  }, [initialRef]);

  async function handleSearch(ref?: string) {
    const searchRef = (ref || refInput).trim().toUpperCase();
    if (!searchRef) {
      setError("Please enter your booking reference.");
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);
    setSearched(true);

    const result = await lookupBooking(searchRef);
    setLoading(false);

    if (result.ok && result.data) {
      setBooking(result.data);
    } else {
      setError(result.error || "Booking not found. Please check your reference and try again.");
    }
  }

  return (
    <>
      <Helmet>
        <title>My Booking | Hibiscus to Airport</title>
        <meta name="description" content="Look up your airport transfer booking with your reference number." />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-[#FAFAFA] pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Search Section */}
          <div className="text-center mb-8 mt-8">
            <h1 className="text-3xl font-bold text-[#1E293B] mb-2">My Booking</h1>
            <p className="text-[#64748B]">Enter your booking reference to view your transfer details</p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="flex gap-3"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={refInput}
                    onChange={(e) => setRefInput(e.target.value)}
                    placeholder="e.g. H123"
                    className="flex h-10 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#D4AF37] hover:bg-[#C4A030] text-white"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Booking Details */}
          {booking && (
            <div className="space-y-6">
              {/* Status Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Booking Reference</p>
                      <p className="text-2xl font-bold text-[#D4AF37]">{booking.booking_ref}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {statusBadge(booking.status)}
                      {paymentBadge(booking.payment_status)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trip Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trip Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-[#D4AF37] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="text-sm font-medium">{booking.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-[#D4AF37] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Drop-off</p>
                        <p className="text-sm font-medium">{booking.dropoffAddress}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Calendar className="h-4 w-4 text-[#D4AF37]" />
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{booking.date}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Clock className="h-4 w-4 text-[#D4AF37]" />
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium">{booking.time}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Users className="h-4 w-4 text-[#D4AF37]" />
                      <p className="text-xs text-muted-foreground">Passengers</p>
                      <p className="text-sm font-medium">{booking.passengers}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      Total
                    </span>
                    <span className="text-xl font-bold text-[#D4AF37]">
                      ${booking.totalPrice?.toFixed(2)} NZD
                    </span>
                  </div>

                  {booking.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Need to change your booking? Contact us:
                  </p>
                  <a
                    href="tel:021743321"
                    className="inline-flex items-center gap-2 text-[#D4AF37] font-semibold hover:text-[#C4A030] transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    021 743 321
                  </a>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty state */}
          {searched && !loading && !error && !booking && (
            <Card>
              <CardContent className="pt-8 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No booking found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
