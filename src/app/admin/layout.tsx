import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/admin.css";
import PageHead from "@/components/adm/admin/shell/PageHead";
import AppHeader from "@/components/adm/shell/AppHeader";
import NavTabs from "@/components/adm/shell/NavTabs";
import { ToastProvider } from "@/components/adm/ui/Toast";
import { serverFetch } from "@/lib/serverApi";
import { requireAdmin } from "@/lib/session";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-adm", display: "swap" });

// Everything under /admin: only administrators get in. The header, title and tabs stay while the page below changes.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const { count } = await serverFetch<{ count: number }>("/admin/overview/attention");
  return (
    <div className={`adm ${font.variable}`}>
      <ToastProvider>
        <AppHeader area="Admin" />
        <main className="wrap">
          <PageHead />
          <NavTabs
            tabs={[
              { href: "/admin", match: "exact", label: "Overview", icon: "chart", count },
              { href: "/admin/people/students", match: "/admin/people", label: "People", icon: "users" },
              { href: "/admin/messages", match: "/admin/messages", label: "Messages", icon: "message" },
              { href: "/admin/settings/levels", match: "/admin/settings", label: "Settings", icon: "settings" },
            ]}
          />
          {children}
        </main>
      </ToastProvider>
    </div>
  );
}
