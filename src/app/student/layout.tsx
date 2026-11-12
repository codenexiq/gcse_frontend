import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/admin.css";
import Link from "next/link";
import AppHeader from "@/components/adm/shell/AppHeader";
import MathJax from "@/components/adm/shell/MathJax";
import Icon from "@/components/adm/ui/Icon";
import { ViewAsBar, ViewAsPicker } from "@/components/adm/shell/ViewAs";
import { ToastProvider } from "@/components/adm/ui/Toast";
import { serverFetch } from "@/lib/serverApi";
import { requireStudent } from "@/lib/session";
import type { StudentSummary, ViewAsData } from "@/types/student";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-adm", display: "swap" });

// Everything under /student: students get in, and so do administrators (who see it exactly as the student they choose does).
export default async function StudentLayout({ children }: { children: ReactNode }) {
  const user = await requireStudent();
  const isAdmin = user.role === "admin";
  const viewAs = isAdmin ? await serverFetch<ViewAsData>("/admin/view-as/student") : null;
  if (viewAs && !viewAs.current) {
    return (
      <div className={`adm ${font.variable}`}>
        <ToastProvider>
          <AppHeader area="Student" switcher />
          <main className="wrap">
            <ViewAsPicker panel="student" options={viewAs.options} />
          </main>
        </ToastProvider>
      </div>
    );
  }
  const summary = await serverFetch<StudentSummary>("/student/summary");
  return (
    <div className={`adm ${font.variable}`}>
      <ToastProvider>
        <AppHeader
          area="Student"
          switcher={isAdmin}
          actions={
            <Link href="/student/messages" className="btn ghost sm">
              <Icon name="message" />
              Messages
              {summary.unread > 0 && <span className="count">{summary.unread}</span>}
            </Link>
          }
        />
        <main className="wrap">
          {viewAs?.current && <ViewAsBar panel="student" current={viewAs.current} />}
          {children}
        </main>
        <MathJax />
      </ToastProvider>
    </div>
  );
}
