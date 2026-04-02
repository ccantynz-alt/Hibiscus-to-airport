import axios, { AxiosError } from "axios";
import type { ApiResponse, CalculatePriceRequest, CalculatePriceResponse, CreateCheckoutResponse } from "@/types/api";
import type { Booking, BookingFormData } from "@/types/booking";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

const client = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach admin token if present
client.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("admin_token") ||
    localStorage.getItem("HIBI_ADMIN_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function extractError(err: unknown): string {
  if (err instanceof AxiosError) {
    return err.response?.data?.error || err.message || "Request failed";
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

// ─── Booking APIs ────────────────────────────────────────────

export async function calculatePrice(
  params: CalculatePriceRequest
): Promise<ApiResponse<CalculatePriceResponse>> {
  try {
    const { data } = await client.post("/api/calculate-price", {
      pickupAddress: params.pickup,
      dropoffAddress: params.dropoff,
      passengers: params.passengers,
    });
    // API returns { ok: true, distance, basePrice, ... } (flat, not nested in data)
    if (data.ok) {
      const { ok: _ok, ...pricing } = data;
      return { ok: true, data: pricing as CalculatePriceResponse };
    }
    return data;
  } catch (err) {
    return { ok: false, error: extractError(err) };
  }
}

export async function createBooking(
  booking: BookingFormData & { totalPrice: number; pricing: CalculatePriceResponse }
): Promise<ApiResponse<{ booking_id: string; booking_ref: string }>> {
  try {
    const { data } = await client.post("/api/bookings", booking);
    // API returns { ok: true, booking_id, booking_ref, ... } flat
    if (data.ok) {
      return { ok: true, data: { booking_id: data.booking_id, booking_ref: data.booking_ref } };
    }
    return data;
  } catch (err) {
    return { ok: false, error: extractError(err) };
  }
}

export async function lookupBooking(
  ref: string
): Promise<ApiResponse<Booking>> {
  try {
    const { data } = await client.get(`/api/bookings/${encodeURIComponent(ref)}`);
    // API returns { ok: true, booking: {...} } flat
    if (data.ok && data.booking) {
      return { ok: true, data: data.booking };
    }
    return data;
  } catch (err) {
    return { ok: false, error: extractError(err) };
  }
}

// ─── Stripe APIs ─────────────────────────────────────────────

export async function createCheckoutSession(params: {
  bookingId: string;
  bookingRef: string;
  customerEmail: string;
  customerName: string;
  totalPrice: number;
  description: string;
}): Promise<ApiResponse<CreateCheckoutResponse>> {
  try {
    // The API expects booking_id
    const { data } = await client.post("/api/stripe/create-session", {
      booking_id: params.bookingId,
    });
    // API returns { ok: true, sessionId, url } flat
    if (data.ok) {
      return { ok: true, data: { sessionId: data.sessionId, url: data.url } };
    }
    return data;
  } catch (err) {
    return { ok: false, error: extractError(err) };
  }
}

export async function getPaymentStatus(
  sessionId: string
): Promise<ApiResponse<{ status: string; bookingRef: string }>> {
  try {
    const { data } = await client.get(`/api/stripe/payment-status?session_id=${sessionId}`);
    return data;
  } catch (err) {
    return { ok: false, error: extractError(err) };
  }
}

// ─── Admin APIs ──────────────────────────────────────────────

export async function adminLogin(
  username: string,
  password: string
): Promise<ApiResponse<{ token: string }>> {
  try {
    const { data } = await client.post("/api/admin/login", { username, password });
    return data;
  } catch (err) {
    return { ok: false, error: extractError(err) };
  }
}

export async function getAdminBookings(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ApiResponse<{ bookings: Booking[]; total: number }>> {
  try {
    const { data } = await client.get("/api/admin/bookings", { params });
    return data;
  } catch (err) {
    return { ok: false, error: extractError(err) };
  }
}

export async function updateBookingStatus(
  id: string,
  status: string
): Promise<ApiResponse<Booking>> {
  try {
    const { data } = await client.post(`/api/bookings/${id}/update-status`, { status });
    return data;
  } catch (err) {
    return { ok: false, error: extractError(err) };
  }
}

export async function cancelBooking(
  id: string,
  reason?: string
): Promise<ApiResponse<Booking>> {
  try {
    const { data } = await client.post(`/api/bookings/${id}/cancel`, { reason });
    return data;
  } catch (err) {
    return { ok: false, error: extractError(err) };
  }
}

export async function resendBookingEmail(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  try {
    const { data } = await client.post(`/api/bookings/${id}/resend-email`);
    return data;
  } catch (err) {
    return { ok: false, error: extractError(err) };
  }
}

export async function resendBookingSms(
  id: string
): Promise<ApiResponse<{ message: string }>> {
  try {
    const { data } = await client.post(`/api/bookings/${id}/resend-sms`);
    return data;
  } catch (err) {
    return { ok: false, error: extractError(err) };
  }
}

// ─── Promo Code APIs ─────────────────────────────────────────

export async function validatePromoCode(
  code: string
): Promise<ApiResponse<{ discount_type: string; discount_value: number }>> {
  try {
    const { data } = await client.get(`/api/promo?code=${encodeURIComponent(code)}`);
    return data;
  } catch (err) {
    return { ok: false, error: extractError(err) };
  }
}
