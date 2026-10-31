import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./SummaryCard.module.css";

interface SummaryCardProps {
  /** Small grey label above the title. */
  label: string;
  title: string;
  text: string;
  /** A Lucide element, e.g. <Package /> */
  icon: ReactNode;
  /** Colour of the icon tile. */
  tone?: "lavender" | "green" | "sand";
  /** Optional link at the bottom. */
  link?: { href: string; label: string };
  /** Optional small badge at the bottom (used when there is no link). */
  badge?: string;
}

/** One summary tile on the overview page. */
export default function SummaryCard({ label, title, text, icon, tone = "lavender", link, badge }: SummaryCardProps) {
  return (
    <article className={`${styles.card} ${tone === "lavender" ? styles.highlight : ""}`}>
      {tone === "lavender" && <span aria-hidden="true" className={styles.blob} />}
      <div className={styles.top}>
        <div>
          <p className={styles.label}>{label}</p>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <span className={`${styles.icon} ${styles[tone]}`}>{icon}</span>
      </div>
      <p className={styles.text}>{text}</p>
      {link && (
        <Link href={link.href} className={styles.link}>
          {link.label} <span aria-hidden="true">→</span>
        </Link>
      )}
      {badge && <span className={styles.badge}>{badge}</span>}
    </article>
  );
}
