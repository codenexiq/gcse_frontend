import Link from "next/link";
import { ArrowLeft, FilePlus2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { studentAvatarUrl } from "@/services/profileService";
import { formatDate } from "@/utils/formatDate";
import type { MonthlyReportRow, StudentSummary } from "@/types";
import styles from "./MonthlyReportStudent.module.css";

interface Props {
  student: StudentSummary;
  /** This student's reports, newest first (can be empty). */
  reports: MonthlyReportRow[];
}

/** One student's monthly progress reports, one row per month. Click a month to read that report. */
export default function MonthlyReportStudent({ student, reports }: Props) {
  const name = student.full_name || "Name not given";
  return (
    <div className={styles.page}>
      <Link href="/tutor/dashboard/monthly-progress" className={styles.back}><ArrowLeft size={16} aria-hidden="true" /> All students</Link>
      <section className={styles.panel} aria-label={`Reports for ${name}`}>
        <div className={styles.head}>
          <div className={styles.who}>
            <Avatar name={student.full_name || student.email} size={52} src={student.avatar_version ? studentAvatarUrl(student.id, student.avatar_version) : null} />
            <div className={styles.names}>
              <h2 className={styles.fullName}>{name}</h2>
              <p className={styles.email}>
                {student.student_code && <>{student.student_code} · </>}
                {student.email} · {reports.length} {reports.length === 1 ? "report" : "reports"}
              </p>
            </div>
          </div>
          <Button href={`/tutor/dashboard/monthly-progress/new?student=${student.id}`} variant="brand" size="md" icon={<FilePlus2 />}>
            New report for {name.split(" ")[0]}
          </Button>
        </div>

        {reports.length === 0 ? (
          <p className={styles.none}>No monthly progress report has been made for this student yet.</p>
        ) : (
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
        )}
      </section>
    </div>
  );
}
