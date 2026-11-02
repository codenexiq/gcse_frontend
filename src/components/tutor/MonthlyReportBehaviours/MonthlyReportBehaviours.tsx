import MonthlyReportCard from "@/components/tutor/MonthlyReportCard";
import { BEHAVIOURS, type MonthlyReport, type UpdateReport } from "@/lib/monthlyReport";
import styles from "./MonthlyReportBehaviours.module.css";

interface Props { report: MonthlyReport; update: UpdateReport }

/** Step 4: five behaviours scored 1-5, each with a plain description so every tutor scores the same way. */
export default function MonthlyReportBehaviours({ report, update }: Props) {
  return (
    <MonthlyReportCard number={4} title="Learning behaviours" hint="1 = low, 5 = excellent. Choose a score for each one (click it again to clear it). The description keeps every tutor scoring the same way.">
      <div className={styles.list}>
        {BEHAVIOURS.map((b) => {
          const score = report.behaviours[b.key];
          return (
            <div key={b.key} className={styles.row}>
              <span className={styles.label} id={`beh-${b.key}`}>{b.label}</span>
              <div>
                <div className={styles.scores} role="group" aria-labelledby={`beh-${b.key}`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" aria-pressed={score === n} className={`${styles.score} ${score === n ? styles.on : ""}`} onClick={() => update({ behaviours: { ...report.behaviours, [b.key]: score === n ? 0 : n } })}>{n}</button>
                  ))}
                </div>
                <p className={styles.desc}>{score > 0 ? b.levels[score - 1] : "Not scored yet"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </MonthlyReportCard>
  );
}
