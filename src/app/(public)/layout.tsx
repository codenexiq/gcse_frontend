import type { ReactNode } from "react";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/site.css";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getCurrentUser } from "@/lib/session";
import { homePathFor } from "@/lib/roles";

// Self-hosted by Next at build time (the site's security policy only allows fonts from our own address).
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-display", display: "swap" });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

// The public website: home, courses, how it works, about, blog and shop. It has its own look (see styles/site.css).
export default async function PublicLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className={`pub ${display.variable} ${body.variable}`}>
      <SiteHeader account={user ? homePathFor(user.role) : null} />
      <main id="main-content" className="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
