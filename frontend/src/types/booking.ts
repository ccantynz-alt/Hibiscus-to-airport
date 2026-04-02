// Core booking types for the Hibiscus to Airport v2 system

export interface Booking {
  id: string;
  booking_ref: string;
  name: string;
  email: string;
  phone: string;
  pickupAddress: string;
  dropoffAddress: string;
  date: string;
  time: string;
  passengers: number;
  notes: string;
  serviceType: string;
  departureFlightNumber: string;
  departureTime: string;
  arrivalFlightNumber: string;
  arrivalTime: string;
  vipPickup: boolean;
  oversizedLuggage: boolean;
  returnTrip: boolean;
  pricing: PricingResult | null;
  totalPrice: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  trackingId: string | null;
  trackingStatus: string | null;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "refunded"
  | "failed";

export type ServiceType =
  | "to_airport"
  | "from_airport"
  | "round_trip";

export interface PricingResult {
  distance: number;
  basePrice: number;
  airportFee: number;
  passengerFee: number;
  oversizedLuggageFee: number;
  totalPrice: number;
  ratePerKm: number;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  pickupAddress: string;
  dropoffAddress: string;
  date: string;
  time: string;
  passengers: number;
  serviceType: ServiceType;
  departureFlightNumber: string;
  arrivalFlightNumber: string;
  vipPickup: boolean;
  oversizedLuggage: boolean;
  returnTrip: boolean;
  notes: string;
}
