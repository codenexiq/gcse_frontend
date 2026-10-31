import { apiFetch } from "@/lib/api";
import type { Item, NewItem } from "@/types";

// Browser-side calls. (For loading items in a Server Component use itemService.server.ts.)
export const createItem = (item: NewItem) =>
  apiFetch<Item>("/items", { method: "POST", body: JSON.stringify(item) });
