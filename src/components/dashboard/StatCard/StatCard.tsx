import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./StatCard.module.css";

interface StatCardProps {
  /** Small label above the title. */
  label: string;
  title: string;
  text: string;
  /** A Lucide element, e.g. <Users /> */
  icon: ReactNode;
  /** Solid background colour. */
  color: "purple" | "blue" | "green" | "orange";
  /** Optional link at the bottom. */
  link?: { href: string; label: string };
  /** Optional small badge at the bottom (used when there is no link). */
  badge?: string;
}

/** A solid-coloured summary tile for the tutor overview (same content as SummaryCard). */
export default function StatCard({ label, title, text, icon, color, link, badge }: StatCardProps) {
  return (
    <article className={`${styles.card} ${styles[color]}`}>
      <span aria-hidden="true" className={styles.blob} />
      <div className={styles.top}>
        <div>
          <p className={styles.label}>{label}</p>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <span className={styles.icon}>{icon}</span>
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
