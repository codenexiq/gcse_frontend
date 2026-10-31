import { API_URL } from "../config";

/** An error from the API. `status` is the HTTP status code (401 = not logged in, ...). */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ErrorBody {
  message?: string;
  errors?: { message: string }[];
}

/** Pulls the friendliest message out of an API error response. */
export function errorMessage(data: ErrorBody | null, status: number): string {
  return data?.errors?.[0]?.message || data?.message || `Request failed (${status})`;
}

/**
 * Small wrapper around fetch for talking to the Express API from the browser.
 * - Sends the session cookie (same origin only).
 * - Sends X-Requested-With, which the backend requires on POST/PUT/DELETE (CSRF protection).
 * Throws an ApiError when the request fails.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status);
  return data as T;
}
