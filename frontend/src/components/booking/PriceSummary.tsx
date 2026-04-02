import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Separator } from "components/ui/separator";
import { Skeleton } from "components/ui/skeleton";
import { MapPin, Users, Star, Luggage, RotateCcw } from "lucide-react";
import type { CalculatePriceResponse } from "@/types/api";

interface PriceSummaryProps {
  pricing: CalculatePriceResponse | null;
  isLoading: boolean;
  passengers: number;
  vipPickup: boolean;
  oversizedLuggage: boolean;
  returnTrip: boolean;
}

function formatNZD(amount: number): string {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(amount);
}

export function PriceSummary({
  pricing,
  isLoading,
  passengers,
  vipPickup,
  oversizedLuggage,
  returnTrip,
}: PriceSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Estimate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!pricing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enter your pickup and drop-off addresses to see pricing.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate add-ons on top of API-returned base price
  const vipFee = vipPickup ? 15 : 0;
  const luggageFee = oversizedLuggage ? 25 : 0;
  const passengerFee = Math.max(0, passengers - 1) * 5;
  const oneWayTotal = pricing.basePrice + passengerFee + vipFee + luggageFee;
  const finalTotal = returnTrip ? oneWayTotal * 2 : oneWayTotal;
  const displayTotal = Math.max(finalTotal, 100);

  return (
    <Card className="border-[#D4AF37]/30 bg-gradient-to-b from-white to-[#FFFBEB]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Distance
          </span>
          <span className="font-medium">{pricing.distance} km</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Base fare</span>
          <span>{formatNZD(pricing.basePrice)}</span>
        </div>

        {passengers > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Extra passengers ({passengers - 1})
            </span>
            <span>{formatNZD(passengerFee)}</span>
          </div>
        )}

        {vipPickup && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-3.5 w-3.5" />
              VIP Airport Pickup
            </span>
            <span>{formatNZD(vipFee)}</span>
          </div>
        )}

        {oversizedLuggage && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Luggage className="h-3.5 w-3.5" />
              Oversized Luggage
            </span>
            <span>{formatNZD(luggageFee)}</span>
          </div>
        )}

        {returnTrip && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
              Return trip (x2)
            </span>
            <span>{formatNZD(oneWayTotal)}</span>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-semibold text-base">Total</span>
          <span className="text-2xl font-bold text-[#D4AF37]">
            {formatNZD(displayTotal)}
          </span>
        </div>

        {displayTotal === 100 && finalTotal < 100 && (
          <p className="text-xs text-muted-foreground">
            Minimum fare of $100 applies
          </p>
        )}

        <p className="text-xs text-muted-foreground pt-1">
          All prices in NZD. Payment via secure Stripe checkout.
        </p>
      </CardContent>
    </Card>
  );
}
