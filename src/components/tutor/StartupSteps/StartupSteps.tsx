import styles from "./StartupSteps.module.css";

export interface StartupStep {
  number: number;
  label: string;
}

interface Props {
  steps: StartupStep[];
  /** The number of the step being shown. */
  current: number;
  /** Called when a step is clicked. */
  onSelect: (number: number) => void;
}

/** The numbered step bar at the top of the start-up screens. Every step can be clicked. */
export default function StartupSteps({ steps, current, onSelect }: Props) {
  return (
    <nav className={styles.bar} aria-label="Start-up steps">
      <ol className={styles.list}>
        {steps.map((s, i) => (
          <li key={s.number} className={styles.item}>
            {i > 0 && <span className={styles.line} aria-hidden="true" />}
            <button
              type="button"
              className={`${styles.step} ${s.number === current ? styles.current : ""}`}
              aria-current={s.number === current ? "step" : undefined}
              onClick={() => onSelect(s.number)}
            >
              <span className={styles.circle}>{s.number}</span>
              <span className={styles.label}>{s.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
