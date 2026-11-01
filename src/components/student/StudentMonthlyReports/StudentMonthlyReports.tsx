import ShortcutCard from "@/components/dashboard/ShortcutCard";
import { formatDate } from "@/utils/formatDate";
import type { MonthlyReportSummary } from "@/types";
import styles from "./StudentMonthlyReports.module.css";

/** The student's monthly progress reports: one card for each, newest first. */
export default function StudentMonthlyReports({ reports }: { reports: MonthlyReportSummary[] }) {
  if (reports.length === 0) {
    return <p className={styles.empty}>No monthly progress report yet. Your tutor will send one at the end of the month.</p>;
  }
  return (
    <section className={styles.grid} aria-label="Monthly progress reports">
      {reports.map((r) => (
        <ShortcutCard key={r.id} href={`/student/monthly-progress/${r.id}`} title={`${r.subject} · ${r.month}`} text={`Sent ${formatDate(r.updated_at)}. Open to read or download it.`} />
      ))}
    </section>
  );
}
