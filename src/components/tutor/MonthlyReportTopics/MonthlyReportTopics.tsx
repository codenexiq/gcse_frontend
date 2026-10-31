import MonthlyReportCard from "@/components/tutor/MonthlyReportCard";
import fields from "@/components/tutor/MonthlyReportCard/MonthlyReportCard.module.css";
import { MASTERY, type MonthlyReport, type TopicRow, type UpdateReport } from "@/lib/monthlyReport";
import styles from "./MonthlyReportTopics.module.css";

interface Props { report: MonthlyReport; update: UpdateReport }

/** Step 2: each topic and how secure the student is in it. */
export default function MonthlyReportTopics({ report, update }: Props) {
  const change = (i: number, patch: Partial<TopicRow>) => update({ topics: report.topics.map((t, n) => (n === i ? { ...t, ...patch } : t)) });
  return (
    <MonthlyReportCard number={2} title="Topics covered" hint="Type each topic, then tap how secure the student is in it">
      <div className={fields.stack}>
        {report.topics.map((t, i) => (
          <div key={i} className={styles.row}>
            <input className={fields.input} value={t.name} placeholder={`Topic ${i + 1}`} maxLength={120} aria-label={`Topic ${i + 1}`} onChange={(e) => change(i, { name: e.target.value })} />
            <div className={styles.levels} role="group" aria-label={`How secure: topic ${i + 1}`}>
              {MASTERY.map((m) => (
                <button key={m} type="button" aria-pressed={t.mastery === m} className={`${styles.level} ${t.mastery === m ? styles.on : ""}`} onClick={() => change(i, { mastery: t.mastery === m ? "" : m })}>
                  {m}
                </button>
              ))}
            </div>
            <button type="button" className={fields.remove} aria-label={`Remove topic ${i + 1}`} onClick={() => update({ topics: report.topics.filter((_, n) => n !== i) })}>×</button>
          </div>
        ))}
        {report.topics.length < 12 && (
          <button type="button" className={fields.addBtn} onClick={() => update({ topics: [...report.topics, { name: "", mastery: "" }] })}>+ Add a topic</button>
        )}
      </div>
    </MonthlyReportCard>
  );
}
