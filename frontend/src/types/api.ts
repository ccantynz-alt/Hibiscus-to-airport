// API response types for consistent type-safe API calls

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  ok: true;
  data: T;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  ok: true;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Stripe-specific types
export interface CreateCheckoutRequest {
  bookingId: string;
  bookingRef: string;
  customerEmail: string;
  customerName: string;
  totalPrice: number;
  description: string;
}

export interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface PaymentStatusResponse {
  status: "paid" | "unpaid" | "failed";
  bookingRef: string;
}

// Price calculation
export interface CalculatePriceRequest {
  pickup: string;
  dropoff: string;
  passengers: number;
  vipPickup: boolean;
  oversizedLuggage: boolean;
  returnTrip: boolean;
}

export interface CalculatePriceResponse {
  distance: number;
  basePrice: number;
  airportFee: number;
  passengerFee: number;
  oversizedLuggageFee: number;
  totalPrice: number;
  ratePerKm: number;
}
