"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { niceDate, niceTime } from "@/lib/calendar";
import { useToast } from "@/hooks/useToast";
import { logBooking } from "@/services/bookingService";
import type { Booking, BookingLogInput } from "@/types";
import styles from "./SessionLogForm.module.css";

interface Props {
  booking: Booking;
  /** The students in the group (for a group session). */
  members: { id: number; fullName: string }[];
  onClose: () => void;
  onSaved: (booking: Booking) => void;
}

const ATTENDANCE: BookingLogInput["attendance"][] = ["Attended", "Late (5+ minutes)", "Absent"];

/** The short log a tutor writes after a session: who came, what was covered, and two 1 to 5 ratings. It also appears in the Lesson log. */
export default function SessionLogForm({ booking: b, members, onClose, onSaved }: Props) {
  const toast = useToast();
  const group = b.who.type === "group";
  const [attendance, setAttendance] = useState<BookingLogInput["attendance"]>("Attended");
  const [present, setPresent] = useState<number[]>(members.map((m) => m.id));
  const [topics, setTopics] = useState("");
  const [homework, setHomework] = useState("");
  const [wentWell, setWentWell] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [engagement, setEngagement] = useState(0);
  const [focus, setFocus] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!topics.trim() || !engagement || !focus) return setError("Add the topics covered and both ratings.");
    setBusy(true);
    setError("");
    try {
      const saved = await logBooking(b.id, { attendance, present, topics: topics.trim(), homework: homework.trim(), wentWell: wentWell.trim(), nextStep: nextStep.trim(), engagement, focus });
      toast.success("Session logged", { title: "Saved" });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the log. Please try again.");
      setBusy(false);
    }
  }

  const scale = (label: string, value: number, set: (n: number) => void) => (
    <fieldset className={styles.field}>
      <legend>{label}</legend>
      <div className={styles.dots}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n}>
            <input type="radio" name={label} checked={value === n} onChange={() => set(n)} />
            <span>{n}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <form className={styles.card} onSubmit={submit} noValidate>
      <div className={styles.top}>
        <div>
          <span className={styles.label}>Session log &middot; about 2 minutes</span>
          <h2 className={styles.title}>{b.who.name}</h2>
          <p className={styles.small}>{niceDate(b.date)} &middot; {niceTime(b.startTime)}</p>
        </div>
        <button type="button" className={styles.ghost} onClick={onClose}>Close</button>
      </div>

      {group ? (
        <fieldset className={styles.field}>
          <legend>Who attended?</legend>
          <div className={styles.choices}>
            {members.map((m) => (
              <label key={m.id} className={styles.choice}>
                <input type="checkbox" checked={present.includes(m.id)} onChange={(e) => setPresent((old) => (e.target.checked ? [...old, m.id] : old.filter((x) => x !== m.id)))} />
                {m.fullName}
              </label>
            ))}
            {members.length === 0 && <span className={styles.small}>This group has no students.</span>}
          </div>
        </fieldset>
      ) : (
        <label className={styles.field}>Attendance
          <select className={styles.input} value={attendance} onChange={(e) => setAttendance(e.target.value as BookingLogInput["attendance"])}>
            {ATTENDANCE.map((a) => <option key={a}>{a}</option>)}
          </select>
        </label>
      )}

      <div className={styles.grid}>
        <label className={styles.field}>Topics covered
          <input className={styles.input} value={topics} onChange={(e) => setTopics(e.target.value)} maxLength={300} placeholder="e.g. Simultaneous equations" />
        </label>
        <label className={styles.field}>Homework set
          <input className={styles.input} value={homework} onChange={(e) => setHomework(e.target.value)} maxLength={300} placeholder="e.g. Quiz: Simultaneous equations" />
        </label>
        <label className={styles.field}>What went well
          <input className={styles.input} value={wentWell} onChange={(e) => setWentWell(e.target.value)} maxLength={1000} />
        </label>
        <label className={styles.field}>Next step
          <input className={styles.input} value={nextStep} onChange={(e) => setNextStep(e.target.value)} maxLength={1000} />
        </label>
      </div>
      <div className={styles.grid}>
        {scale("Engagement (1 low \u2013 5 excellent)", engagement, setEngagement)}
        {scale("Focus (1 low \u2013 5 excellent)", focus, setFocus)}
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.row}>
        <button type="submit" className={styles.primary} disabled={busy}>{busy ? "Saving\u2026" : "Save log"}</button>
        <span className={styles.small}>Logs also appear in the Lesson log and feed the monthly report.</span>
      </div>
    </form>
  );
}
