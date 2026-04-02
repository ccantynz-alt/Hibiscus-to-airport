import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";

import Header from "components/Header";
import Footer from "components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";
import { Alert, AlertDescription } from "components/ui/alert";
import { Skeleton } from "components/ui/skeleton";
import { lookupBooking } from "lib/api";
import type { Booking } from "@/types/booking";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingRef = searchParams.get("booking_ref");

  const fetchBooking = useCallback(async (ref: string, attempt = 0) => {
    const result = await lookupBooking(ref);

    if (result.ok && result.data) {
      setBooking(result.data);
      setLoading(false);
      return;
    }

    // Stripe webhook may not have processed yet — retry up to 5 times
    if (attempt < 5) {
      setTimeout(() => fetchBooking(ref, attempt + 1), 2000);
    } else {
      setError("We received your payment but couldn't load booking details. Your booking reference is " + ref + ". Please contact us if you need assistance.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!bookingRef) {
      setError("No booking reference found. Please check your email for confirmation details.");
      setLoading(false);
      return;
    }
    fetchBooking(bookingRef);
  }, [bookingRef, fetchBooking]);

  return (
    <>
      <Helmet>
        <title>Payment Confirmed | Hibiscus to Airport</title>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-[#FAFAFA] pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {loading ? (
            <Card className="mt-8">
              <CardContent className="pt-8 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37] mx-auto mb-4" />
                <p className="text-[#64748B]">Loading your booking details...</p>
                <Skeleton className="h-4 w-64 mx-auto mt-4" />
                <Skeleton className="h-4 w-48 mx-auto mt-2" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="mt-8">
              <CardContent className="pt-8">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-6 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Need help? Contact us:
                  </p>
                  <a
                    href="tel:021743321"
                    className="flex items-center justify-center gap-2 text-[#D4AF37] font-semibold"
                  >
                    <Phone className="h-4 w-4" />
                    021 743 321
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : booking ? (
            <div className="space-y-6 mt-8">
              {/* Success Banner */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-[#1E293B] mb-2">
                    Booking Confirmed!
                  </h1>
                  <p className="text-[#64748B]">
                    Your airport transfer has been booked successfully.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-white rounded-lg px-4 py-2 border">
                    <span className="text-sm text-[#64748B]">Reference:</span>
                    <span className="text-lg font-bold text-[#D4AF37]">
                      {booking.booking_ref}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Details</CardTitle>
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
                    <span className="text-sm text-muted-foreground">Total Paid</span>
                    <span className="text-xl font-bold text-[#D4AF37]">
                      ${booking.totalPrice?.toFixed(2)} NZD
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* What's Next */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What Happens Next</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-[#D4AF37] mt-0.5 shrink-0" />
                    <p className="text-sm text-[#64748B]">
                      A confirmation email has been sent to <strong>{booking.email}</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-[#D4AF37] mt-0.5 shrink-0" />
                    <p className="text-sm text-[#64748B]">
                      You'll receive an SMS reminder before your pickup
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1 bg-[#D4AF37] hover:bg-[#C4A030]">
                  <Link to={`/my-booking?ref=${booking.booking_ref}`}>
                    View My Booking
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </>
  );
}
