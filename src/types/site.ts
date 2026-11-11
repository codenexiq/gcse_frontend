// The public website: what the API sends for the blog, shop, team and reviews, and the contact form.

export type SiteColor = "sky" | "rose" | "cream" | "lav";

export interface SitePost {
  id: number;
  title: string;
  excerpt: string;
  tag: string;
  author: string;
  /** "2026-05-22" */
  publishedOn: string;
  url: string;
  color: SiteColor;
  featured: boolean;
}

export interface SiteProductImage {
  url: string;
  alt: string;
}

export interface SiteProduct {
  id: number;
  slug: string;
  eyebrow: string;
  title: string;
  price: string;
  lead: string;
  tagsTitle: string;
  tags: string[];
  included: string[];
  perfect: string[];
  why: string[];
  note: string;
  images: SiteProductImage[];
}

export interface SiteTutor {
  id: number;
  name: string;
  subjects: string;
  icon: string;
  color: SiteColor;
  bio: string[];
  photoUrl: string | null;
}

export interface SiteVideoReview {
  id: number;
  name: string;
  about: string;
  videoUrl: string | null;
  posterUrl: string | null;
}

export interface SiteGoogleReview {
  id: number;
  name: string;
  about: string;
  text: string;
}

export interface SiteReviews {
  videos: SiteVideoReview[];
  google: SiteGoogleReview[];
}

export const YEAR_GROUPS = ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12", "Year 13"] as const;
export const ENQUIRY_SUBJECTS = ["Maths", "Physics", "Chemistry", "Biology", "Science (KS3)", "More than one"] as const;

export interface EnquiryInput {
  parentName: string;
  studentName: string;
  email: string;
  phone: string;
  yearGroup: string;
  subject: string;
  message: string;
}

export type EnquiryStatus = "new" | "contacted" | "closed";

/** A message from the contact form, as the admin inbox shows it. */
export interface Enquiry extends EnquiryInput {
  id: number;
  status: EnquiryStatus;
  createdAt: string;
}
