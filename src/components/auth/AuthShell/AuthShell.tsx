import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthBackground from "../AuthBackground";
import styles from "./AuthShell.module.css";

/** Full-screen frame for the login/register pages: photo + rings behind, card in the centre. */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <AuthBackground />
      <Link href="/" className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" /> Back to home
      </Link>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
