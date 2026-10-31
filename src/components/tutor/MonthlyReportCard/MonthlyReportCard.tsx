import type { ReactNode } from "react";
import styles from "./MonthlyReportCard.module.css";

interface Props { number: number; title: string; hint?: string; children: ReactNode }

/** One numbered white card of the report form. Its form-field styles are shared by the other report sections. */
export default function MonthlyReportCard({ number, title, hint, children }: Props) {
  return (
    <section className={styles.card} aria-label={title}>
      <header className={styles.head}>
        <h3 className={styles.title}><span className={styles.num}>{number}</span> {title}</h3>
        {hint && <p className={styles.hint}>{hint}</p>}
      </header>
      {children}
    </section>
  );
}
