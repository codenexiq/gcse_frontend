import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { Item } from "@/types";

// Server-side version, used by Server Components (forwards the session cookie).
export const getItems = () => serverFetch<Item[]>("/items");
