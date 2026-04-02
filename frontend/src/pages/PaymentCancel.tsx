import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { XCircle, Phone, ArrowLeft } from "lucide-react";

import Header from "components/Header";
import Footer from "components/Footer";
import { Card, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const bookingRef = searchParams.get("booking_ref");

  return (
    <>
      <Helmet>
        <title>Payment Cancelled | Hibiscus to Airport</title>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-[#FAFAFA] pt-20 pb-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <Card className="mt-8">
            <CardContent className="pt-8 text-center">
              <XCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-[#1E293B] mb-2">
                Payment Cancelled
              </h1>
              <p className="text-[#64748B] mb-6">
                Your payment was not completed. No charges have been made to your card.
                {bookingRef && (
                  <> Your booking reference <strong>{bookingRef}</strong> has been saved — you can complete payment at any time.</>
                )}
              </p>

              <div className="flex flex-col gap-3">
                <Button asChild className="bg-[#D4AF37] hover:bg-[#C4A030]">
                  <Link to="/booking">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Try Again
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Need help? We're available 24/7
                </p>
                <a
                  href="tel:021743321"
                  className="inline-flex items-center gap-2 text-[#D4AF37] font-semibold text-sm hover:text-[#C4A030] transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  021 743 321
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
}
