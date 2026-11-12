import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/admin.css";
import AppHeader from "@/components/adm/shell/AppHeader";
import NavTabs from "@/components/adm/shell/NavTabs";
import { ViewAsBar, ViewAsPicker } from "@/components/adm/shell/ViewAs";
import TutorPageHead from "@/components/adm/tutor/shell/TutorPageHead";
import { ToastProvider } from "@/components/adm/ui/Toast";
import { serverFetch } from "@/lib/serverApi";
import { requireTutor } from "@/lib/session";
import type { ViewAsData } from "@/types/student";
import type { TutorSummary } from "@/types/tutor";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-adm", display: "swap" });

// Everything under /tutor: teachers get in, and so do administrators (who see it exactly as the teacher they choose does).
export default async function TutorLayout({ children }: { children: ReactNode }) {
  const user = await requireTutor();
  const isAdmin = user.role === "admin";
  const viewAs = isAdmin ? await serverFetch<ViewAsData>("/admin/view-as/tutor") : null;
  if (viewAs && !viewAs.current) {
    return (
      <div className={`adm ${font.variable}`}>
        <ToastProvider>
          <AppHeader area="Teacher" switcher />
          <main className="wrap">
            <ViewAsPicker panel="tutor" options={viewAs.options} />
          </main>
        </ToastProvider>
      </div>
    );
  }
  const summary = await serverFetch<TutorSummary>("/tutor/summary");
  return (
    <div className={`adm ${font.variable}`}>
      <ToastProvider>
        <AppHeader area="Teacher" switcher={isAdmin} />
        <main className="wrap">
          {viewAs?.current && <ViewAsBar panel="tutor" current={viewAs.current} />}
          <TutorPageHead name={summary.name} />
          <NavTabs
            tabs={[
              { href: "/tutor", match: "exact", label: "Today", icon: "calendar", count: summary.pendingLogs },
              { href: "/tutor/students", match: "/tutor/students", label: "Students", icon: "users" },
              { href: "/tutor/content", match: "/tutor/content", label: "Content", icon: "book" },
              { href: "/tutor/messages", match: "/tutor/messages", label: "Messages", icon: "message", count: summary.unread },
            ]}
          />
          {children}
        </main>
      </ToastProvider>
    </div>
  );
}
