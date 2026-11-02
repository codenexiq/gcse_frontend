"use client";

import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ApiError } from "@/lib/api";
import { formatDuration, formatLessonDate } from "@/lib/lessonLog";
import { deleteLessonLog } from "@/services/lessonLogService";
import type { LessonLogEntry } from "@/types";
import styles from "./LessonLogDetail.module.css";

interface Props {
  entry: LessonLogEntry;
  /** Only admins can delete an entry. */
  canDelete: boolean;
  onClose: () => void;
  onDeleted: (id: number) => void;
}

/** Everything about one lesson entry. Admins can delete it (after asking first). */
export default function LessonLogDetail({ entry, canDelete, onClose, onDeleted }: Props) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await deleteLessonLog(entry.id);
      onDeleted(entry.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  const row = (label: string, value: string) => (
    <>
      <dt>{label}</dt>
      <dd>{value || <span className={styles.empty}>Nothing written</span>}</dd>
    </>
  );

  if (asking) {
    return (
      <ConfirmDialog open title="Delete this entry?" actions={[{ label: "Delete entry", tone: "danger", onClick: remove }]} onClose={() => { setAsking(false); setError(""); }} busy={busy} error={error}>
        <p>The lesson entry for <strong>{entry.studentOrClass}</strong> on {formatLessonDate(entry.lessonDate)} is removed for good. This cannot be undone.</p>
      </ConfirmDialog>
    );
  }

  return (
    <ConfirmDialog
      open
      title="Lesson entry"
      actions={canDelete ? [{ label: "Delete entry", tone: "danger", onClick: () => setAsking(true) }] : []}
      onClose={onClose}
      cancelLabel="Close"
    >
      <dl className={styles.facts}>
        {row("Tutor", `${entry.tutorName} (${entry.tutorEmail})`)}
        {row("Date", formatLessonDate(entry.lessonDate))}
        {row("Student / class", entry.studentOrClass)}
        {row("Lesson type", entry.lessonType)}
        {row("Attendance", entry.attendance)}
        {row("Duration", formatDuration(entry.durationMinutes))}
        {row("Completed", entry.completed)}
        {row("Homework", [entry.homeworkAssigned ? "Yes" : "", entry.homeworkOther ? `Other: ${entry.homeworkOther}` : ""].filter(Boolean).join(" · ") || "None")}
        {row("Student engagement", entry.engagementNotes)}
        {row("Next focus / notes", entry.nextFocus)}
        {row("Zoom Cloud recording", entry.zoomRecorded ? "Recorded for the full duration" : "Not recorded")}
        {row("Submitted", new Date(entry.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }))}
      </dl>
    </ConfirmDialog>
  );
}
