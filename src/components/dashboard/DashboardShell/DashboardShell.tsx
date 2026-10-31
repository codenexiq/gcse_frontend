import type { ReactNode } from "react";
import type { User } from "@/types";
import DashboardSidebar from "../DashboardSidebar";
import DashboardHeader from "../DashboardHeader";
import styles from "./DashboardShell.module.css";

/** The dashboard frame: sidebar on the left, header + page content on the right. */
export default function DashboardShell({ user, children }: { user: User; children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <DashboardSidebar role={user.role} />
      <main id="main-content" className={styles.main}>
        <div className={styles.inner}>
          <DashboardHeader user={user} />
          <div className={styles.content}>{children}</div>
        </div>
      </main>
    </div>
  );
}
