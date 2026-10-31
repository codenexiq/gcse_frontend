import styles from "./StudentStepPlaceholder.module.css";

/** PLACEHOLDER for a student step whose design has not been sent yet. */
export default function StudentStepPlaceholder({ number, title }: { number: number; title: string }) {
  return (
    <section className={styles.panel} aria-label={title}>
      <span className={styles.number}>{number}</span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>This screen is coming soon.</p>
    </section>
  );
}
