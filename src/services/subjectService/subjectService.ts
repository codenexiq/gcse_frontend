import { apiFetch } from "@/lib/api";
import type { Subject } from "@/types";

// Subjects + topics rarely change. "default" lets the browser's HTTP cache reuse the response
// (the API sends Cache-Control: max-age=3600), unlike our normal no-store requests.
export const getSubjects = () => apiFetch<Subject[]>("/subjects", { cache: "default" });
