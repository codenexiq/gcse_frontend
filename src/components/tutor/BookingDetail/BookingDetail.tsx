"use client";

import { useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import { endTime, isPast, niceDate, niceTime } from "@/lib/calendar";
import { safeHref } from "@/lib/groups";
import { useToast } from "@/hooks/useToast";
import { cancelBooking } from "@/services/bookingService";
import type { Booking } from "@/types";
import styles from "./BookingDetail.module.css";

interface Props {
  booking: Booking;
  /** The students in the group (for a group session). */
  members: { id: number; fullName: string }[];
  /** How many sessions in its weekly series are this one or later (1 when it is not a series). */
  seriesLeft: number;
  onClose: () => void;
  onLog: () => void;
  /** Called after cancelling: only this session, or this one and every later one in its series. */
  onCancelled: (wholeSeries: boolean) => void;
}

/** One session: who, when, the log (if any), and what can be done with it. */
export default function BookingDetail({ booking: b, members, seriesLeft, onClose, onLog, onCancelled }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const group = b.who.type === "group";
  const past = isPast(b);
  const link = safeHref(b.zoomLink);

  async function cancel(series: boolean) {
    setBusy(true);
    setError("");
    try {
      const { cancelled } = await cancelBooking(b.id, series);
      toast.success(cancelled === 1 ? "Session cancelled" : `${cancelled} sessions cancelled`, { title: "Cancelled" });
      onCancelled(series);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not cancel. Please try again.");
      setBusy(false);
    }
  }

  return (
    <section className={styles.card} aria-label="Session details">
      <div className={styles.top}>
        <div>
          <span className={`${styles.chip} ${group ? styles.blue : styles.pink}`}>{group ? "Group session" : "1-to-1"}</span>
          <h2 className={styles.title}>{b.who.name}</h2>
          <p className={styles.muted}>{niceDate(b.date)} &middot; {niceTime(b.startTime)}&ndash;{niceTime(endTime(b.startTime, b.minutes))} &middot; {b.zoomLink.replace(/^https:\/\//, "")}</p>
          {group && <p className={styles.small}><strong>Students:</strong> {members.map((m) => m.fullName).join(", ") || "None yet"}</p>}
        </div>
        <button type="button" className={styles.ghost} onClick={onClose}>Close</button>
      </div>

      {b.log && (
        <div className={styles.log}>
          <span className={styles.label}>Session log</span>
          <p><strong>Topics:</strong> {b.log.topics}</p>
          {b.log.wentWell && <p><strong>Went well:</strong> {b.log.wentWell}</p>}
          {b.log.nextStep && <p><strong>Next step:</strong> {b.log.nextStep}</p>}
          <p><strong>Homework:</strong> {b.log.homework || "None"}</p>
          <p className={styles.small}>{b.log.attendance} &middot; Engagement {b.log.engagement}/5 &middot; Focus {b.log.focus}/5</p>
        </div>
      )}

      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.row}>
        {!past && link && <a href={link} target="_blank" rel="noopener noreferrer" className={styles.primary}>Start Zoom</a>}
        {past && !b.logged && <button type="button" className={styles.primary} onClick={onLog}>Log this session</button>}
        {!group && <Link href={`/tutor/dashboard/students/${b.who.id}/overview`} className={styles.plain}>Open profile</Link>}
        {!past && !b.logged && <button type="button" className={styles.ghost} onClick={() => cancel(false)} disabled={busy}>Cancel this session</button>}
        {!past && !b.logged && b.seriesId && seriesLeft > 1 && <button type="button" className={styles.ghost} onClick={() => cancel(true)} disabled={busy}>Cancel this and the next {seriesLeft - 1}</button>}
      </div>
    </section>
  );
}
