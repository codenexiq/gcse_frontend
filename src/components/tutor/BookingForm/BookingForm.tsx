"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { niceDate, niceTime, ymd } from "@/lib/calendar";
import { useToast } from "@/hooks/useToast";
import { createBookings } from "@/services/bookingService";
import type { Booking, SessionGroup, StudentSummary } from "@/types";
import styles from "./BookingForm.module.css";

interface Props {
  students: StudentSummary[];
  groups: SessionGroup[];
  initialWho?: { type: "student" | "group"; id: number };
  onClose: () => void;
  onSaved: (made: Booking[]) => void;
}

const key = (w: { type: string; id: number }) => `${w.type}:${w.id}`;

/** Book a session with a student or a group, once or every week for 12 weeks. The student (or the whole group) is told in their messages. */
export default function BookingForm({ students, groups, initialWho, onClose, onSaved }: Props) {
  const toast = useToast();
  const first = initialWho ?? (groups[0] ? { type: "group" as const, id: groups[0].id } : students[0] ? { type: "student" as const, id: students[0].id } : null);
  const [who, setWho] = useState(first ? key(first) : "");
  const [date, setDate] = useState(ymd(new Date()));
  const [start, setStart] = useState("17:00");
  const [minutes, setMinutes] = useState(60);
  const [repeat, setRepeat] = useState<1 | 12>(12);
  const [zoom, setZoom] = useState(first?.type === "group" ? groups.find((g) => g.id === first.id)?.zoomLink ?? "" : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [type, idText] = who.split(":");
  const isGroup = type === "group";

  function pickWho(value: string) {
    setWho(value);
    const [t, i] = value.split(":");
    // A group already has a Zoom link: start from it.
    if (t === "group") setZoom(groups.find((g) => g.id === Number(i))?.zoomLink ?? zoom);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!who || !date || !start) return setError("Choose who, a date and a start time.");
    if (!zoom.trim()) return setError("Add the Zoom link.");
    setBusy(true);
    setError("");
    try {
      const made = await createBookings({ who: { type: type as "student" | "group", id: Number(idText) }, date, startTime: start, minutes, repeat, zoomLink: zoom.trim() });
      toast.success(`${made.length} ${made.length === 1 ? "session" : "sessions"} booked with ${made[0].who.name}. First: ${niceDate(made[0].date)}, ${niceTime(made[0].startTime)}.`, { title: "Booked" });
      onSaved(made);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not book the session. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={submit} noValidate>
      <div className={styles.top}>
        <h2 className={styles.title}>Book a session</h2>
        <button type="button" className={styles.ghost} onClick={onClose}>Close</button>
      </div>
      <div className={styles.grid}>
        <label className={styles.field}>Who
          <select className={styles.input} value={who} onChange={(e) => pickWho(e.target.value)}>
            {groups.length > 0 && <optgroup label="Groups">{groups.map((g) => <option key={g.id} value={`group:${g.id}`}>{g.name}</option>)}</optgroup>}
            <optgroup label="Students">{students.map((s) => <option key={s.id} value={`student:${s.id}`}>{s.full_name || s.email}</option>)}</optgroup>
          </select>
        </label>
        <label className={styles.field}>Date
          <input className={styles.input} type="date" value={date} min={ymd(new Date())} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className={styles.field}>Start time
          <input className={styles.input} type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className={styles.field}>Length
          <select className={styles.input} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
            {[30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} minutes</option>)}
          </select>
        </label>
        <label className={styles.field}>Repeats
          <select className={styles.input} value={repeat} onChange={(e) => setRepeat(Number(e.target.value) as 1 | 12)}>
            <option value={1}>Just once</option>
            <option value={12}>Every week this term (12 weeks)</option>
          </select>
        </label>
        <label className={styles.field}>Zoom link
          <input className={styles.input} value={zoom} onChange={(e) => setZoom(e.target.value)} maxLength={300} placeholder="e.g. https://zoom.us/j/123456789" />
        </label>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.row}>
        <button type="submit" className={styles.primary} disabled={busy}>{busy ? "Booking\u2026" : `Book ${repeat > 1 ? `${repeat} sessions` : "session"}`}</button>
        <span className={styles.small}>{isGroup ? "Everyone in the group" : "The student"} gets the date and Zoom link in their messages.</span>
      </div>
    </form>
  );
}
