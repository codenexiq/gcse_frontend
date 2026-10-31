import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { Subject } from "@/types";

// Server-side version, used by Server Components.
export const getSubjects = () => serverFetch<Subject[]>("/subjects");
