import { apiFetch } from "@/lib/api";
import type { DiagnosticIntroContent, StartupCategory, StartupOption } from "@/types";

// Browser-side calls for managing the Student Start-up Screen choices (tutor / admin only).
export const addStartupOption = (category: StartupCategory, label: string) =>
  apiFetch<StartupOption>("/tutor/startup-options", { method: "POST", body: JSON.stringify({ category, label }) });

export const renameStartupOption = (id: number, label: string) =>
  apiFetch<StartupOption>(`/tutor/startup-options/${id}`, { method: "PUT", body: JSON.stringify({ label }) });

export const deleteStartupOption = (id: number) =>
  apiFetch<null>(`/tutor/startup-options/${id}`, { method: "DELETE" });

export const saveDiagnosticIntro = (content: DiagnosticIntroContent) =>
  apiFetch<DiagnosticIntroContent>("/tutor/startup-content", { method: "PUT", body: JSON.stringify(content) });
