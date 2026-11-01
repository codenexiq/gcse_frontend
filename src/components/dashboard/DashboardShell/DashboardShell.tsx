import type { ReactNode } from "react";
import type { User } from "@/types";
import DashboardSidebar from "../DashboardSidebar";
import DashboardHeader from "../DashboardHeader";
import DashboardContent from "../DashboardContent";
import styles from "./DashboardShell.module.css";

/** The dashboard frame: sidebar on the left; on the right a header that stays put and the page content that scrolls. */
export default function DashboardShell({ user, children }: { user: User; children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <DashboardSidebar role={user.role} />
      <main id="main-content" className={styles.main}>
        <div className={styles.bar}>
          <div className={styles.inner}>
            <DashboardHeader user={user} />
          </div>
        </div>
        <div className={styles.inner}>
          <DashboardContent className={styles.content}>{children}</DashboardContent>
        </div>
      </main>
    </div>
  );
}
