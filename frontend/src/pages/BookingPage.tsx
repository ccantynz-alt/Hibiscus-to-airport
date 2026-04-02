import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import {
  Plane,
  PlaneLanding,
  ArrowRightLeft,
  CalendarIcon,
  Clock,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Header from "components/Header";
import Footer from "components/Footer";

import { Card, CardContent } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";
import { Label } from "components/ui/label";
import { Calendar } from "components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "components/ui/popover";
import { Switch } from "components/ui/switch";
import { Separator } from "components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import {
  Alert,
  AlertDescription,
} from "components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "components/ui/form";

import { AddressInput } from "components/booking/AddressInput";
import { PriceSummary } from "components/booking/PriceSummary";
import { bookingFormSchema, type BookingFormValues } from "lib/schemas/booking";
import { calculatePrice, createBooking, createCheckoutSession } from "lib/api";
import { cn } from "lib/utils";
import type { CalculatePriceResponse } from "@/types/api";

const PASSENGER_OPTIONS = Array.from({ length: 11 }, (_, i) => i + 1);

// Helper to spread RHF field props into HTML inputs (coerces value to string)
function textFieldProps(field: { onChange: (...e: unknown[]) => void; onBlur: () => void; value: unknown; name: string; ref: React.Ref<unknown> }) {
  return { ...field, value: String(field.value ?? "") };
}

const TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of ["00", "15", "30", "45"]) {
    const hour = String(h).padStart(2, "0");
    TIME_SLOTS.push(`${hour}:${m}`);
  }
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${m} ${ampm}`;
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<CalculatePriceResponse | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      pickupAddress: "",
      dropoffAddress: "",
      date: "",
      time: "",
      passengers: 1,
      serviceType: "to_airport",
      departureFlightNumber: "",
      arrivalFlightNumber: "",
      vipPickup: false,
      oversizedLuggage: false,
      returnTrip: false,
      notes: "",
    },
  });

  const pickupAddress = form.watch("pickupAddress");
  const dropoffAddress = form.watch("dropoffAddress");
  const passengers = form.watch("passengers");
  const vipPickup = form.watch("vipPickup");
  const oversizedLuggage = form.watch("oversizedLuggage");
  const returnTrip = form.watch("returnTrip");
  const serviceType = form.watch("serviceType");

  // Auto-fill airport address based on service type
  const setFormValue = form.setValue;
  useEffect(() => {
    const airport = "Auckland Airport (AKL), Ray Emery Drive, Mangere, Auckland";
    if (serviceType === "to_airport" && !dropoffAddress) {
      setFormValue("dropoffAddress", airport);
    } else if (serviceType === "from_airport" && !pickupAddress) {
      setFormValue("pickupAddress", airport);
    }
  }, [serviceType, dropoffAddress, pickupAddress, setFormValue]);

  // Debounced price calculation
  const fetchPrice = useCallback(
    (pickup: string, dropoff: string, pax: number) => {
      if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
      if (!pickup || pickup.length < 5 || !dropoff || dropoff.length < 5) {
        setPricing(null);
        return;
      }

      priceTimerRef.current = setTimeout(async () => {
        setPricingLoading(true);
        const result = await calculatePrice({
          pickup: pickup,
          dropoff: dropoff,
          passengers: pax,
          vipPickup: false,
          oversizedLuggage: false,
          returnTrip: false,
        });
        setPricingLoading(false);

        if (result.ok && result.data) {
          setPricing(result.data);
        }
      }, 600);
    },
    []
  );

  useEffect(() => {
    fetchPrice(pickupAddress, dropoffAddress, passengers);
  }, [pickupAddress, dropoffAddress, passengers, fetchPrice]);

  // Calculate final total for submission
  function getFinalTotal(): number {
    if (!pricing) return 0;
    const vipFee = vipPickup ? 15 : 0;
    const luggageFee = oversizedLuggage ? 25 : 0;
    const passengerFee = Math.max(0, passengers - 1) * 5;
    const oneWay = pricing.basePrice + passengerFee + vipFee + luggageFee;
    const total = returnTrip ? oneWay * 2 : oneWay;
    return Math.max(total, 100);
  }

  async function onSubmit(values: BookingFormValues) {
    if (!pricing) {
      setSubmitError("Please wait for the price to calculate.");
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);

    const totalPrice = getFinalTotal();

    // Step 1: Create booking
    const bookingResult = await createBooking({
      ...values,
      totalPrice,
      pricing: { ...pricing, totalPrice },
    });

    if (!bookingResult.ok || !bookingResult.data) {
      setSubmitError(bookingResult.error || "Failed to create booking. Please try again.");
      setSubmitLoading(false);
      return;
    }

    const { booking_id, booking_ref } = bookingResult.data;

    // Step 2: Create Stripe checkout session
    const stripeResult = await createCheckoutSession({
      bookingId: booking_id,
      bookingRef: booking_ref || "",
      customerEmail: values.email,
      customerName: values.name,
      totalPrice,
      description: `Airport Transfer ${booking_ref}: ${values.pickupAddress} to ${values.dropoffAddress}`,
    });

    if (!stripeResult.ok || !stripeResult.data) {
      setSubmitError(stripeResult.error || "Failed to start payment. Please try again.");
      setSubmitLoading(false);
      return;
    }

    // Step 3: Redirect to Stripe
    window.location.href = stripeResult.data.url;
  }

  const selectedDate = form.watch("date")
    ? new Date(form.watch("date") + "T00:00:00")
    : undefined;

  return (
    <>
      <Helmet>
        <title>Book Your Airport Transfer | Hibiscus to Airport</title>
        <meta
          name="description"
          content="Book a reliable airport transfer from the Hibiscus Coast to Auckland Airport. 24/7 service, competitive prices, professional drivers."
        />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-[#FAFAFA] pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-2">
              Book Your Transfer
            </h1>
            <p className="text-[#64748B] max-w-xl mx-auto">
              Reliable airport transfers from the Hibiscus Coast. Available 24/7, including public holidays.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                      {/* Service Type */}
                      <div>
                        <Label className="text-sm font-semibold text-[#1E293B] mb-3 block">
                          Service Type
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: "to_airport" as const, label: "To Airport", icon: Plane },
                            { value: "from_airport" as const, label: "From Airport", icon: PlaneLanding },
                            { value: "round_trip" as const, label: "Round Trip", icon: ArrowRightLeft },
                          ].map(({ value, label, icon: Icon }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => form.setValue("serviceType", value)}
                              className={cn(
                                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                                serviceType === value
                                  ? "border-[#D4AF37] bg-[#FFFBEB] text-[#1E293B]"
                                  : "border-gray-200 hover:border-gray-300 text-[#64748B]"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              <span className="text-sm font-medium">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Addresses */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pickupAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pickup Address</FormLabel>
                              <FormControl>
                                <AddressInput
                                  value={field.value as string}
                                  onChange={field.onChange}
                                  placeholder="e.g. 12 Orewa Road, Orewa"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dropoffAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Drop-off Address</FormLabel>
                              <FormControl>
                                <AddressInput
                                  value={field.value as string}
                                  onChange={field.onChange}
                                  placeholder="e.g. Auckland Airport"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Date & Time */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value
                                        ? format(new Date(field.value + "T00:00:00"), "EEE, d MMMM yyyy")
                                        : "Select date"}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date: Date | undefined) => {
                                      if (date) {
                                        const yyyy = date.getFullYear();
                                        const mm = String(date.getMonth() + 1).padStart(2, "0");
                                        const dd = String(date.getDate()).padStart(2, "0");
                                        field.onChange(`${yyyy}-${mm}-${dd}`);
                                      }
                                      setCalendarOpen(false);
                                    }}
                                    disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value as string}>
                                <FormControl>
                                  <SelectTrigger>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <SelectValue placeholder="Select time" />
                                    </div>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-64">
                                  {TIME_SLOTS.map((slot) => (
                                    <SelectItem key={slot} value={slot}>
                                      {formatTime12h(slot)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Passengers */}
                      <FormField
                        control={form.control}
                        name="passengers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passengers</FormLabel>
                            <Select
                              onValueChange={(v) => field.onChange(parseInt(v, 10))}
                              value={String(field.value)}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full sm:w-48">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PASSENGER_OPTIONS.map((n) => (
                                  <SelectItem key={n} value={String(n)}>
                                    {n} {n === 1 ? "Passenger" : "Passengers"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      {/* Contact Details */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#1E293B] mb-4">
                          Your Details
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Smith" {...textFieldProps(field)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="john@example.com" {...textFieldProps(field)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2 sm:max-w-xs">
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input className="pl-10" placeholder="021 123 4567" {...textFieldProps(field)} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Flight Details */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#1E293B] mb-4">
                          Flight Details <span className="font-normal text-[#94A3B8]">(optional)</span>
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {(serviceType === "to_airport" || serviceType === "round_trip") && (
                            <FormField
                              control={form.control}
                              name="departureFlightNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Departure Flight Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. NZ123" {...textFieldProps(field)} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {(serviceType === "from_airport" || serviceType === "round_trip") && (
                            <FormField
                              control={form.control}
                              name="arrivalFlightNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Arrival Flight Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. QF145" {...textFieldProps(field)} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Add-ons */}
                      <div>
                        <h3 className="text-sm font-semibold text-[#1E293B] mb-4">
                          Add-ons
                        </h3>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="vipPickup"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                  <FormLabel className="text-sm font-medium">
                                    VIP Airport Pickup
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Meet & greet at arrivals with name sign (+$15)
                                  </p>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={Boolean(field.value)}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="oversizedLuggage"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                  <FormLabel className="text-sm font-medium">
                                    Oversized Luggage
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Surfboards, bikes, extra-large bags (+$25)
                                  </p>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={Boolean(field.value)}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="returnTrip"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                  <FormLabel className="text-sm font-medium">
                                    Return Trip
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Add a return journey (price x2)
                                  </p>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={Boolean(field.value)}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Notes */}
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Special Requests <span className="font-normal text-[#94A3B8]">(optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Child seat needed, specific pickup instructions, etc."
                                className="resize-none"
                                rows={3}
                                {...textFieldProps(field)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Error Alert */}
                      {submitError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{submitError}</AlertDescription>
                        </Alert>
                      )}

                      {/* Submit */}
                      <Button
                        type="submit"
                        size="lg"
                        disabled={submitLoading || !pricing}
                        className="w-full bg-[#D4AF37] hover:bg-[#C4A030] text-white font-semibold text-base h-12"
                      >
                        {submitLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Proceed to Payment
                          </>
                        )}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground">
                        You'll be redirected to Stripe for secure payment. We accept all major cards.
                      </p>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <PriceSummary
                pricing={pricing}
                isLoading={pricingLoading}
                passengers={passengers}
                vipPickup={vipPickup}
                oversizedLuggage={oversizedLuggage}
                returnTrip={returnTrip}
              />

              {/* Help Card */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-sm mb-3 text-[#1E293B]">
                    Need Help?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Our team is available 24/7 to assist you with your booking.
                  </p>
                  <a
                    href="tel:021743321"
                    className="flex items-center gap-2 text-[#D4AF37] hover:text-[#C4A030] font-semibold text-sm transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    021 743 321
                  </a>
                  <a
                    href="mailto:info@bookaride.co.nz"
                    className="block text-sm text-muted-foreground hover:text-[#1E293B] mt-2 transition-colors"
                  >
                    info@bookaride.co.nz
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
