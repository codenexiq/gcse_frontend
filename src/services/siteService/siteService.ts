import { apiFetch } from "@/lib/api";
import type { Enquiry, EnquiryInput, EnquiryStatus } from "@/types";

// Browser-side calls. The contact form is open to everyone; the inbox calls are for admins.
export const sendEnquiry = (input: EnquiryInput) => apiFetch<{ sent: boolean }>("/site/enquiries", { method: "POST", body: JSON.stringify(input) });
export const setEnquiryStatus = (id: number, status: EnquiryStatus) => apiFetch<{ updated: boolean }>(`/tutor/enquiries/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
export const deleteEnquiry = (id: number) => apiFetch<{ deleted: boolean }>(`/tutor/enquiries/${id}`, { method: "DELETE" });
export type { Enquiry };
