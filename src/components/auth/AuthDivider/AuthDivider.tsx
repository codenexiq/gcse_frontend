import styles from "./AuthDivider.module.css";

/** A dashed line with a small word in the middle, e.g. "Or". */
export default function AuthDivider({ text }: { text: string }) {
  return (
    <div className={styles.divider} role="separator">
      <span>{text}</span>
    </div>
  );
}
