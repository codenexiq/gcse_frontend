"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { userAvatarUrl } from "@/services/profileService";
import { formatDate } from "@/utils/formatDate";
import type { MonthlyReportRow } from "@/types";
import styles from "./MonthlyReportTable.module.css";

interface StudentLine {
  studentId: number;
  fullName: string;
  email: string;
  avatarVersion: number | null;
  count: number;
  /** The most recently sent report (the list arrives newest first). */
  latest: MonthlyReportRow;
}

const href = (studentId: number) => `/tutor/dashboard/monthly-progress/student/${studentId}`;

/** One line for each student who has reports. Click a student to see all of their months. */
export default function MonthlyReportTable({ reports }: { reports: MonthlyReportRow[] }) {
  const [query, setQuery] = useState("");

  const students = useMemo(() => {
    const byStudent = new Map<number, StudentLine>();
    for (const r of reports) {
      const line = byStudent.get(r.student_id);
      if (line) line.count += 1;
      else byStudent.set(r.student_id, { studentId: r.student_id, fullName: r.full_name ?? "", email: r.email, avatarVersion: r.avatar_version ?? null, count: 1, latest: r });
    }
    return [...byStudent.values()];
  }, [reports]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? students.filter((s) => `${s.fullName} ${s.email}`.toLowerCase().includes(q)) : students;
  }, [students, query]);

  return (
    <section className={styles.panel} aria-label="Students with monthly progress reports">
      <div className={styles.top}>
        <p className={styles.count}>
          {shown.length === students.length
            ? `${students.length} ${students.length === 1 ? "student" : "students"} · ${reports.length} ${reports.length === 1 ? "report" : "reports"}`
            : `${shown.length} of ${students.length} students`}
        </p>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <span className={styles.srOnly}>Search students by name or email</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" maxLength={100} />
        </label>
      </div>

      {shown.length === 0 ? (
        <p className={styles.empty}>{students.length === 0 ? "No reports yet. Use the Monthly Progress Report Builder above to create the first one." : "No students match your search."}</p>
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col"><span className={styles.srOnly}>Initials</span></th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Reports</th>
                <th scope="col">Latest report</th>
                <th scope="col">Last sent</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.studentId}>
                  <td className={styles.avatarCell}>
                    <Link href={href(s.studentId)} className={styles.cell} aria-label={`Reports for ${s.fullName || s.email}`} tabIndex={-1}>
                      <Avatar name={s.fullName || s.email} size={32} src={s.avatarVersion ? userAvatarUrl(s.studentId, s.avatarVersion) : null} />
                    </Link>
                  </td>
                  <td><Link href={href(s.studentId)} className={`${styles.cell} ${styles.fullName}`}>{s.fullName || "Name not given"}</Link></td>
                  <td><Link href={href(s.studentId)} className={`${styles.cell} ${styles.email}`}>{s.email}</Link></td>
                  <td>{s.count}</td>
                  <td>{s.latest.month} · {s.latest.subject}</td>
                  <td className={styles.date}>{formatDate(s.latest.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
