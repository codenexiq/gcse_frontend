import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { formatDate } from "@/utils/formatDate";
import type { MonthlyReportRow } from "@/types";
import styles from "./MonthlyReportStudent.module.css";

/** Every monthly report for one student. Click a month to read that report. */
export default function MonthlyReportStudent({ reports }: { reports: MonthlyReportRow[] }) {
  const first = reports[0];
  const name = first.full_name || "Name not given";
  return (
    <div className={styles.page}>
      <Link href="/tutor/dashboard/monthly-progress" className={styles.back}><ArrowLeft size={16} aria-hidden="true" /> All students</Link>
      <section className={styles.panel} aria-label={`Reports for ${name}`}>
        <div className={styles.who}>
          <Avatar name={first.full_name || first.email} size={44} />
          <div className={styles.names}>
            <h2 className={styles.fullName}>{name}</h2>
            <p className={styles.email}>{first.email} · {reports.length} {reports.length === 1 ? "report" : "reports"}</p>
          </div>
        </div>
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Subject</th>
                <th scope="col">Sent</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td><Link href={`/tutor/dashboard/monthly-progress/${r.id}`} className={styles.month}>{r.month}</Link></td>
                  <td>{r.subject}</td>
                  <td className={styles.date}>{formatDate(r.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
