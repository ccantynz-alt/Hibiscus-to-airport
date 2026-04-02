import { z } from "zod";

// NZ phone number validation
const nzPhoneRegex = /^(\+?64|0)\d{7,10}$/;

function cleanPhone(phone: string): string {
  return phone.replace(/[\s\-()]+/g, "");
}

export const bookingFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => nzPhoneRegex.test(cleanPhone(val)),
      "Please enter a valid NZ phone number (e.g. 021 743 321)"
    ),
  pickupAddress: z
    .string()
    .min(5, "Please enter a pickup address"),
  dropoffAddress: z
    .string()
    .min(5, "Please enter a drop-off address"),
  date: z
    .string()
    .min(1, "Please select a date"),
  time: z
    .string()
    .min(1, "Please select a time"),
  passengers: z
    .number()
    .min(1, "At least 1 passenger required")
    .max(11, "Maximum 11 passengers"),
  serviceType: z.enum(["to_airport", "from_airport", "round_trip"]),
  departureFlightNumber: z.string(),
  arrivalFlightNumber: z.string(),
  vipPickup: z.boolean(),
  oversizedLuggage: z.boolean(),
  returnTrip: z.boolean(),
  notes: z.string().max(500, "Notes must be under 500 characters"),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
