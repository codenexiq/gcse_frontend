"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { createLessonLog } from "@/services/lessonLogService";
import type { LessonLogEntry } from "@/types";
import styles from "./LessonLogForm.module.css";

const LESSON_TYPES: LessonLogEntry["lessonType"][] = ["1:1", "Group", "Admin"];
const ATTENDANCE: LessonLogEntry["attendance"][] = ["Present", "Late", "Absent / No show"];
const COMPLETED: LessonLogEntry["completed"][] = ["Yes", "No", "Maybe"];
const QUICK_DURATIONS = [30, 45, 60, 90];

/** Today as 2026-11-02, in the computer's own time zone. */
const today = () => new Date().toLocaleDateString("en-CA");

interface FormState {
  tutorName: string;
  lessonDate: string;
  studentOrClass: string;
  lessonType: string;
  attendance: string;
  duration: string;
  completed: string;
  homeworkYes: boolean;
  homeworkOtherOn: boolean;
  homeworkOther: string;
  engagementNotes: string;
  nextFocus: string;
  zoomRecorded: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

interface Props {
  /** The signed-in person's email (shown, not changeable). */
  email: string;
  /** The signed-in person's name, which starts in the Tutor Name box. */
  accountName: string;
}

/**
 * The attendance and feedback form a tutor fills in straight after each lesson.
 * Email comes from the account. Fields marked * must be filled in.
 */
export default function LessonLogForm({ email, accountName }: Props) {
  const router = useRouter();
  const toast = useToast();
  const fresh = (): FormState => ({
    tutorName: accountName,
    lessonDate: "",
    studentOrClass: "",
    lessonType: "",
    attendance: "",
    duration: "",
    completed: "",
    homeworkYes: false,
    homeworkOtherOn: false,
    homeworkOther: "",
    engagementNotes: "",
    nextFocus: "",
    zoomRecorded: true, // ticked from the start, as on the paper form
  });
  const [v, setV] = useState<FormState>(fresh);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [clearing, setClearing] = useState(false);

  // The date starts as today (set here, in the browser, so it is the person's own today).
  useEffect(() => setV((old) => (old.lessonDate ? old : { ...old, lessonDate: today() })), []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setV((old) => ({ ...old, [key]: value }));
    setErrors((old) => ({ ...old, [key]: undefined }));
  };

  function check(): Errors {
    const e: Errors = {};
    if (!v.lessonDate) e.lessonDate = "Choose the date of the lesson.";
    if (!v.studentOrClass.trim()) e.studentOrClass = "Enter the student, class or admin block.";
    if (!v.lessonType) e.lessonType = "Choose the lesson type.";
    if (!v.attendance) e.attendance = "Choose the attendance.";
    const minutes = Number(v.duration);
    if (!v.duration.trim()) e.duration = "Enter how long the lesson was, in minutes.";
    else if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600) e.duration = "Enter whole minutes, from 1 to 600.";
    if (!v.completed) e.completed = "Say whether the lesson or task was completed.";
    if (v.homeworkOtherOn && !v.homeworkOther.trim()) e.homeworkOther = "Write the other homework, or untick Other.";
    if (!v.nextFocus.trim()) e.nextFocus = "Write the next focus or lesson notes.";
    return e;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const found = check();
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length > 0) {
      setServerError("Please fill in the fields marked below.");
      return;
    }
    setBusy(true);
    try {
      await createLessonLog({
        tutorName: v.tutorName.trim(),
        lessonDate: v.lessonDate,
        studentOrClass: v.studentOrClass,
        lessonType: v.lessonType as LessonLogEntry["lessonType"],
        attendance: v.attendance as LessonLogEntry["attendance"],
        durationMinutes: Number(v.duration),
        completed: v.completed as LessonLogEntry["completed"],
        homeworkAssigned: v.homeworkYes,
        homeworkOther: v.homeworkOtherOn ? v.homeworkOther : "",
        engagementNotes: v.engagementNotes,
        nextFocus: v.nextFocus,
        zoomRecorded: v.zoomRecorded,
      });
      toast.success("Your lesson entry was saved.", { title: "Submitted" });
      router.push("/tutor/dashboard/lesson-log");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Could not save the entry. Please try again.");
      setBusy(false);
    }
  }

  const star = <span className={styles.star} aria-hidden="true"> *</span>;
  const error = (key: keyof FormState) => (errors[key] ? <p className={styles.error} role="alert">{errors[key]}</p> : null);

  /** A question with small round-edged choices, one of which can be picked. */
  const choices = (key: "lessonType" | "attendance" | "completed", label: string, options: string[], size: string) => (
    <fieldset className={`${styles.field} ${size} ${errors[key] ? styles.bad : ""}`}>
      <legend className={styles.label}>{label}{star}</legend>
      <div className={styles.segments}>
        {options.map((o) => (
          <label key={o} className={`${styles.segment} ${v[key] === o ? styles.segmentOn : ""}`}>
            <input type="radio" name={key} value={o} checked={v[key] === o} onChange={() => set(key, o)} />
            <span>{o}</span>
          </label>
        ))}
      </div>
      {error(key)}
    </fieldset>
  );

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.grid}>
        <div className={`${styles.field} ${styles.s3}`}>
          <label className={styles.label} htmlFor="ll-email">Email{star}</label>
          <input id="ll-email" className={`${styles.input} ${styles.locked}`} value={email} readOnly disabled title="The email of the account you are signed in with" />
        </div>

        <div className={`${styles.field} ${styles.s3}`}>
          <label className={styles.label} htmlFor="ll-name">Tutor Name</label>
          <input id="ll-name" className={styles.input} value={v.tutorName} maxLength={100} onChange={(e) => set("tutorName", e.target.value)} autoComplete="off" />
        </div>

        <div className={`${styles.field} ${styles.s2} ${errors.lessonDate ? styles.bad : ""}`}>
          <label className={styles.label} htmlFor="ll-date">Date{star}</label>
          <input id="ll-date" className={styles.input} type="date" value={v.lessonDate} max={today()} onChange={(e) => set("lessonDate", e.target.value)} />
          {error("lessonDate")}
        </div>

        <div className={`${styles.field} ${styles.s4} ${errors.duration ? styles.bad : ""}`}>
          <label className={styles.label} htmlFor="ll-duration">Duration (minutes){star}</label>
          <div className={styles.durationRow}>
            <input id="ll-duration" className={`${styles.input} ${styles.number}`} type="number" inputMode="numeric" min={1} max={600} value={v.duration} placeholder="60" onChange={(e) => set("duration", e.target.value)} />
            {QUICK_DURATIONS.map((n) => (
              <button key={n} type="button" className={`${styles.chip} ${v.duration === String(n) ? styles.chipOn : ""}`} onClick={() => set("duration", String(n))}>{n}</button>
            ))}
          </div>
          {error("duration")}
        </div>

        <div className={`${styles.field} ${styles.s3} ${errors.studentOrClass ? styles.bad : ""}`}>
          <label className={styles.label} htmlFor="ll-who">Student / Class / Admin Block{star}</label>
          <input id="ll-who" className={styles.input} value={v.studentOrClass} maxLength={150} onChange={(e) => set("studentOrClass", e.target.value)} autoComplete="off" />
          {error("studentOrClass")}
        </div>

        {choices("lessonType", "Lesson Type", LESSON_TYPES, styles.s2)}
        {choices("attendance", "Attendance", ATTENDANCE, styles.s4)}
        {choices("completed", "Lesson / Task Completed", COMPLETED, styles.s3)}

        <fieldset className={`${styles.field} ${styles.s4} ${errors.homeworkOther ? styles.bad : ""}`}>
          <legend className={styles.label}>Homework Tasks Assigned</legend>
          <div className={styles.homework}>
            <label className={styles.check}>
              <input type="checkbox" checked={v.homeworkYes} onChange={(e) => set("homeworkYes", e.target.checked)} />
              <span>Yes</span>
            </label>
            <label className={styles.check}>
              <input type="checkbox" checked={v.homeworkOtherOn} onChange={(e) => set("homeworkOtherOn", e.target.checked)} />
              <span>Other</span>
            </label>
            <input className={`${styles.input} ${styles.inline}`} value={v.homeworkOther} maxLength={300} disabled={!v.homeworkOtherOn} placeholder="Describe the other homework" aria-label="Other homework" onChange={(e) => set("homeworkOther", e.target.value)} />
          </div>
          {error("homeworkOther")}
        </fieldset>

        <div className={`${styles.field} ${styles.s4}`}>
          <label className={styles.label} htmlFor="ll-engagement">Feedback / Notes on Student Engagement</label>
          <textarea id="ll-engagement" className={`${styles.input} ${styles.area}`} value={v.engagementNotes} maxLength={2000} onChange={(e) => set("engagementNotes", e.target.value)} />
        </div>

        <div className={`${styles.field} ${styles.s4} ${errors.nextFocus ? styles.bad : ""}`}>
          <label className={styles.label} htmlFor="ll-next">Next Focus / Lesson Notes{star}</label>
          <textarea id="ll-next" className={`${styles.input} ${styles.area}`} value={v.nextFocus} maxLength={2000} onChange={(e) => set("nextFocus", e.target.value)} />
          {error("nextFocus")}
        </div>
      </div>

      {!v.zoomRecorded && <p className={styles.warn}>Lessons must be recorded to Zoom Cloud for the full duration. This entry will be marked as not recorded.</p>}
      {serverError && <p className={`${styles.error} ${styles.summary}`} role="alert">{serverError}</p>}

      <div className={styles.actions}>
        <label className={styles.check}>
          <input type="checkbox" checked={v.zoomRecorded} onChange={(e) => set("zoomRecorded", e.target.checked)} />
          <span>Lesson was recorded to Zoom Cloud for the full duration</span>
        </label>
        <div className={styles.buttons}>
          <button type="button" className={styles.clear} onClick={() => setClearing(true)} disabled={busy}>Clear form</button>
          <Link href="/tutor/dashboard/lesson-log" className={styles.cancel}>Cancel</Link>
          <button type="submit" className={styles.submit} disabled={busy}>{busy ? "Submitting..." : "Submit"}</button>
        </div>
      </div>

      <ConfirmDialog
        open={clearing}
        title="Clear the form?"
        actions={[{ label: "Clear form", tone: "danger", onClick: () => { setV({ ...fresh(), lessonDate: today() }); setErrors({}); setServerError(""); setClearing(false); } }]}
        onClose={() => setClearing(false)}
      >
        <p>Everything you have typed is removed from the form.</p>
      </ConfirmDialog>
    </form>
  );
}
