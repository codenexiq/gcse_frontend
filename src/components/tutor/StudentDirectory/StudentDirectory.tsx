"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { formatDate } from "@/utils/formatDate";
import type { StudentSummary } from "@/types";
import styles from "./StudentDirectory.module.css";

/** A searchable list of students (the search happens in the browser on the loaded list). */
export default function StudentDirectory({ students }: { students: StudentSummary[] }) {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? students.filter((s) => s.email.toLowerCase().includes(q)) : students;
  }, [students, query]);

  return (
    <section className={styles.panel} aria-label="Student directory">
      <div className={styles.top}>
        <p className={styles.count}>
          {shown.length === students.length
            ? `${students.length} ${students.length === 1 ? "student" : "students"}`
            : `${shown.length} of ${students.length} students`}
        </p>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <span className={styles.srOnly}>Search students by email</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email"
            maxLength={100}
          />
        </label>
      </div>

      {shown.length === 0 ? (
        <p className={styles.empty}>
          {students.length === 0 ? "No students have registered yet." : "No students match your search."}
        </p>
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Registered</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((student) => (
                <tr key={student.id}>
                  <td>
                    <span className={styles.who}>
                      <Avatar name={student.email} size={32} />
                      {student.email}
                    </span>
                  </td>
                  <td className={styles.date}>{formatDate(student.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
