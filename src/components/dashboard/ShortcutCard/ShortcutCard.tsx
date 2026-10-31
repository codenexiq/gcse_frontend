import Link from "next/link";
import styles from "./ShortcutCard.module.css";

/** A big clickable tile that links to another dashboard page. */
export default function ShortcutCard({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link href={href} className={styles.card}>
      <p className={styles.title}>
        {title} <span aria-hidden="true" className={styles.arrow}>→</span>
      </p>
      <p className={styles.text}>{text}</p>
    </Link>
  );
}
