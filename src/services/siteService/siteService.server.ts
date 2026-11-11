import "server-only";
import { serverFetch } from "@/lib/serverApi";
import type { Enquiry, SitePost, SiteProduct, SiteReviews, SiteTutor } from "@/types";

// Server-side only. The website content is public; the enquiries need an admin session.
export const getPosts = (limit?: number) => serverFetch<SitePost[]>(`/site/posts${limit ? `?limit=${limit}` : ""}`);
export const getProducts = () => serverFetch<SiteProduct[]>("/site/products");
export const getTeam = () => serverFetch<SiteTutor[]>("/site/team");
export const getReviews = () => serverFetch<SiteReviews>("/site/reviews");
export const getEnquiries = () => serverFetch<Enquiry[]>("/tutor/enquiries");
