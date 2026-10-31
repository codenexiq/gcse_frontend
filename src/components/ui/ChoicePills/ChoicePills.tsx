import styles from "./ChoicePills.module.css";

interface Props {
  legend: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

/** A row of pill-shaped radio choices, e.g. GCSE / IGCSE / A-level. */
export default function ChoicePills({ legend, name, options, value, onChange }: Props) {
  return (
    <fieldset className={styles.field}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.choices}>
        {options.map((o) => (
          <label key={o} className={`${styles.choice} ${value === o ? styles.chosen : ""}`}>
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className={styles.radio} />
            <span className={styles.dot} aria-hidden="true" />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
