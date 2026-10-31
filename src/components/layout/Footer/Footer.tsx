import { Cloud, Heart } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.brand}>
          <Cloud size={16} aria-hidden="true" /> GCSE Cloud © {new Date().getFullYear()}
        </span>
        <span className={styles.brand}>
          Made with <Heart size={14} aria-hidden="true" className={styles.heart} /> using Next.js, Express &amp; MySQL
        </span>
      </div>
    </footer>
  );
}
