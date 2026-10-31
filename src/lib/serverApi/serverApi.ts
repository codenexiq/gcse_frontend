import "server-only"; // build error if a client component ever imports this file
import { cookies } from "next/headers";
import { ApiError, errorMessage } from "../api";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

/**
 * fetch for Server Components. It forwards the visitor's session cookie to Express,
 * so the backend decides who they are. Throws an ApiError on failure.
 */
export async function serverFetch<T>(path: string): Promise<T> {
  const cookie = (await cookies()).toString();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    cache: "no-store",
    headers: { Cookie: cookie },
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status);
  return data as T;
}
