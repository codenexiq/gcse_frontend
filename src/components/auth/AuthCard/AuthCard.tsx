import type { ReactNode } from "react";
import FadeIn from "@/components/ui/FadeIn";
import styles from "./AuthCard.module.css";

interface AuthCardProps {
  /** A Lucide element shown in the white tile at the top, e.g. <LogIn /> */
  icon: ReactNode;
  title: string;
  subtitle: string;
  /** An optional info panel above the form, e.g. <AuthNotice ... /> */
  notice?: ReactNode;
  children: ReactNode;
  /** Small print under the form. */
  footer?: string;
}

/**
 * The card in the middle of the login/register pages: a pale-blue top section (icon, title, subtitle)
 * above a white body (info panel, form, small print).
 */
export default function AuthCard({ icon, title, subtitle, notice, children, footer }: AuthCardProps) {
  return (
    <FadeIn y={24}>
      <section className={styles.card}>
        <header className={styles.top}>
          <span className={styles.icon}>{icon}</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>

        <div className={styles.body}>
          {notice}
          {children}
          {footer && <p className={styles.footer}>{footer}</p>}
        </div>
      </section>
    </FadeIn>
  );
}
