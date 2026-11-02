import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { ProfileData } from "@/types";

// Server-side read of the signed-in person's profile (Server Components forward the session cookie).
export const getMyProfile = () => serverFetch<ProfileData>("/profile");
