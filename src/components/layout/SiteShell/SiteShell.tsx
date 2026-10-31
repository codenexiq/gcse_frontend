import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/session";
import styles from "./SiteShell.module.css";

/** The normal page frame: header on top, footer at the bottom, content in the middle. */
export default async function SiteShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className={styles.shell}>
      <Header user={user} />
      <main id="main-content" className={`container ${styles.main}`}>{children}</main>
      <Footer />
    </div>
  );
}
