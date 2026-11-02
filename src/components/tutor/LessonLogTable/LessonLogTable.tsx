"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Eye, Search } from "lucide-react";
import LessonLogDetail from "@/components/tutor/LessonLogDetail";
import { useToast } from "@/hooks/useToast";
import { formatDuration, formatLessonDate } from "@/lib/lessonLog";
import type { LessonLogEntry } from "@/types";
import styles from "./LessonLogTable.module.css";

const PAGE_SIZES = [10, 25, 50, 100];

interface Props {
  entries: LessonLogEntry[];
  /** Admins see everybody's entries (with who wrote them) and can delete. */
  isAdmin: boolean;
}

const attendanceClass = (a: LessonLogEntry["attendance"]) => (a === "Present" ? styles.present : a === "Late" ? styles.late : styles.absent);

/** The lesson log: search and filter, open an entry to read it all. */
export default function LessonLogTable({ entries: initial, isAdmin }: Props) {
  const toast = useToast();
  const [entries, setEntries] = useState(initial);
  const [query, setQuery] = useState("");
  const [attendance, setAttendance] = useState("");
  const [lessonType, setLessonType] = useState("");
  const [tutor, setTutor] = useState("");
  const [recording, setRecording] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<LessonLogEntry | null>(null);

  const tutors = useMemo(() => [...new Map(entries.map((e) => [e.tutorId, e.tutorName])).entries()].sort((a, b) => a[1].localeCompare(b[1])), [entries]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (attendance && e.attendance !== attendance) return false;
      if (lessonType && e.lessonType !== lessonType) return false;
      if (tutor && String(e.tutorId) !== tutor) return false;
      if (recording === "no" && e.zoomRecorded) return false;
      if (recording === "yes" && !e.zoomRecorded) return false;
      return !q || `${e.studentOrClass} ${e.tutorName} ${e.nextFocus} ${e.engagementNotes}`.toLowerCase().includes(q);
    });
  }, [entries, query, attendance, lessonType, tutor, recording]);

  const pages = Math.max(1, Math.ceil(shown.length / pageSize));
  const current = Math.min(page, pages);
  const first = (current - 1) * pageSize;
  const rows = shown.slice(first, first + pageSize);
  useEffect(() => setPage(1), [query, attendance, lessonType, tutor, recording, pageSize]);

  const notRecorded = entries.filter((e) => !e.zoomRecorded).length;

  return (
    <section className={styles.panel} aria-label="Lesson log">
      <div className={styles.toolbar}>
        <label className={styles.show}>
          Show
          <select className={styles.select} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} aria-label="Entries per page">
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <span className={styles.srOnly}>Search the lesson log</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" maxLength={100} />
        </label>
        <select className={styles.select} value={attendance} onChange={(e) => setAttendance(e.target.value)} aria-label="Filter by attendance">
          <option value="">Attendance</option>
          <option>Present</option>
          <option>Late</option>
          <option>Absent / No show</option>
        </select>
        <select className={styles.select} value={lessonType} onChange={(e) => setLessonType(e.target.value)} aria-label="Filter by lesson type">
          <option value="">Lesson type</option>
          <option>1:1</option>
          <option>Group</option>
          <option>Admin</option>
        </select>
        <select className={styles.select} value={recording} onChange={(e) => setRecording(e.target.value)} aria-label="Filter by recording">
          <option value="">Recording</option>
          <option value="yes">Recorded</option>
          <option value="no">Not recorded</option>
        </select>
        {isAdmin && (
          <select className={styles.select} value={tutor} onChange={(e) => setTutor(e.target.value)} aria-label="Filter by tutor">
            <option value="">All tutors</option>
            {tutors.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        )}
        <span className={styles.count}>
          {shown.length === entries.length ? entries.length : `${shown.length} of ${entries.length}`} {entries.length === 1 ? "entry" : "entries"}
          {notRecorded > 0 && <span className={styles.flag}> · {notRecorded} not recorded</span>}
        </span>
      </div>

      {shown.length === 0 ? (
        <p className={styles.empty}>{entries.length === 0 ? "No lesson entries yet. Use the button above to add the first one." : "No entries match your search."}</p>
      ) : (
        <>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  {isAdmin && <th scope="col">Tutor</th>}
                  <th scope="col">Student / class</th>
                  <th scope="col">Type</th>
                  <th scope="col" className={styles.center}>Attendance</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Completed</th>
                  <th scope="col">Homework</th>
                  <th scope="col" className={styles.center}>Recorded</th>
                  <th scope="col" className={styles.center}>Details</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td className={styles.date}>{formatLessonDate(e.lessonDate)}</td>
                    {isAdmin && <td className={styles.strong}>{e.tutorName}</td>}
                    <td className={styles.who}>{e.studentOrClass}</td>
                    <td>{e.lessonType}</td>
                    <td className={styles.center}><span className={`${styles.badge} ${attendanceClass(e.attendance)}`}>{e.attendance}</span></td>
                    <td className={styles.date}>{formatDuration(e.durationMinutes)}</td>
                    <td>{e.completed}</td>
                    <td>{[e.homeworkAssigned ? "Yes" : "", e.homeworkOther ? `Other: ${e.homeworkOther}` : ""].filter(Boolean).join(", ") || "-"}</td>
                    <td className={styles.center}>
                      {e.zoomRecorded ? (
                        <span className={styles.yes} title="Recorded to Zoom Cloud"><Check size={16} aria-label="Recorded" /></span>
                      ) : (
                        <span className={styles.no} title="Not recorded to Zoom Cloud"><AlertTriangle size={16} aria-label="Not recorded" /></span>
                      )}
                    </td>
                    <td className={styles.center}>
                      <button type="button" className={styles.view} onClick={() => setOpen(e)} aria-label={`Open the entry for ${e.studentOrClass} on ${formatLessonDate(e.lessonDate)}`} title="Open">
                        <Eye size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.footer}>
            <p className={styles.range}>Showing {first + 1}-{Math.min(first + pageSize, shown.length)} of {shown.length}</p>
            <div className={styles.pager}>
              <button type="button" className={styles.pageButton} onClick={() => setPage(current - 1)} disabled={current <= 1}>Previous</button>
              <span className={styles.pageNow}>Page {current} of {pages}</span>
              <button type="button" className={styles.pageButton} onClick={() => setPage(current + 1)} disabled={current >= pages}>Next</button>
            </div>
          </div>
        </>
      )}

      {open && (
        <LessonLogDetail
          entry={open}
          canDelete={isAdmin}
          onClose={() => setOpen(null)}
          onDeleted={(id) => {
            setEntries((all) => all.filter((e) => e.id !== id));
            setOpen(null);
            toast.success("The entry was deleted.", { title: "Deleted" });
          }}
        />
      )}
    </section>
  );
}
