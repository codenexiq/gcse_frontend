import styles from "./AuthNotice.module.css";

interface AuthNoticeProps {
  /** Small green heading, shown in capitals (e.g. "Tutor access"). */
  label: string;
  title: string;
  text: string;
}

/** The pale-green info panel above the form (like "Selected purchase" in the reference design). */
export default function AuthNotice({ label, title, text }: AuthNoticeProps) {
  return (
    <aside className={styles.notice}>
      <p className={styles.label}>{label}</p>
      <p className={styles.title}>{title}</p>
      <p className={styles.text}>{text}</p>
    </aside>
  );
}
