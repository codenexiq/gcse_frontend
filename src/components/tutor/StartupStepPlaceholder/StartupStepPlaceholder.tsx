import styles from "./StartupStepPlaceholder.module.css";

/** PLACEHOLDER for a start-up step whose design has not been sent yet. */
export default function StartupStepPlaceholder({ number, title }: { number: number; title: string }) {
  return (
    <section className={styles.panel} aria-label={title}>
      <span className={styles.number}>{number}</span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>This screen is ready and waiting for its design.</p>
    </section>
  );
}
