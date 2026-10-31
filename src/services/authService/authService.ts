import { apiFetch } from "@/lib/api";
import type { AuthResponse, Credentials } from "@/types";

const send = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });

export const login = (credentials: Credentials) => send<AuthResponse>("/auth/login", credentials);
export const tutorLogin = (credentials: Credentials) => send<AuthResponse>("/auth/tutor/login", credentials);
export const register = (credentials: Credentials) =>
  send<AuthResponse>("/auth/register", credentials);
export const logout = () => send<{ message: string }>("/auth/logout", {});
