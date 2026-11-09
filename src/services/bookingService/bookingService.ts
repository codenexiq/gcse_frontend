import { apiFetch } from "@/lib/api";
import type { Booking, BookingInput, BookingLogInput } from "@/types";

// Browser-side calls for the tutor's calendar.
export const listBookings = (from: string, to: string) => apiFetch<Booking[]>(`/tutor/bookings?from=${from}&to=${to}`);
export const createBookings = (input: BookingInput) => apiFetch<Booking[]>("/tutor/bookings", { method: "POST", body: JSON.stringify(input) });
/** wholeSeries: this session and every later one in its weekly series. */
export const cancelBooking = (id: number, wholeSeries = false) => apiFetch<{ cancelled: number }>(`/tutor/bookings/${id}${wholeSeries ? "?series=1" : ""}`, { method: "DELETE" });
export const logBooking = (id: number, input: BookingLogInput) => apiFetch<Booking>(`/tutor/bookings/${id}/log`, { method: "POST", body: JSON.stringify(input) });
