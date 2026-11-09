"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FlowScope from "@/components/ui/FlowScope";
import TeacherHeader from "@/components/tutor/TeacherHeader";
import BookingDetail from "@/components/tutor/BookingDetail";
import BookingForm from "@/components/tutor/BookingForm";
import SessionLogForm from "@/components/tutor/SessionLogForm";
import WeekGrid from "@/components/tutor/WeekGrid";
import { ApiError } from "@/lib/api";
import { addDays, monday, needingLog, niceDate, weekRange, ymd } from "@/lib/calendar";
import { listBookings } from "@/services/bookingService";
import type { Booking, SessionGroup, StudentSummary } from "@/types";
import styles from "./TutorToday.module.css";

interface Props {
  name: string;
  students: StudentSummary[];
  groups: SessionGroup[];
  /** Students who finished the diagnostic and are waiting for a group (the badge on the Students tab). */
  waiting: number;
}

/** The tutor's home screen, as in the prototype: a greeting, the section tabs, and the weekly calendar of sessions. */
export default function TutorToday({ name, students, groups, waiting }: Props) {
  const [items, setItems] = useState<Booking[]>([]);
  const [week, setWeek] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [mode, setMode] = useState<{ kind: "none" } | { kind: "book"; who?: { type: "student" | "group"; id: number } } | { kind: "log"; id: number }>({ kind: "none" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const mon = useMemo(() => addDays(monday(new Date()), week * 7), [week]);

  // Keep what is already loaded, and replace the sessions in the range that was just read.
  const load = useCallback(async (from: string, to: string) => {
    try {
      const rows = await listBookings(from, to);
      setItems((old) => [...old.filter((b) => b.date < from || b.date > to), ...rows]);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your calendar. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  // The first load covers this week and the last two weeks (for "needs a log").
  useEffect(() => {
    const thisMon = monday(new Date());
    void load(ymd(addDays(thisMon, -14)), ymd(addDays(thisMon, 6)));
  }, [load]);
  useEffect(() => {
    if (week !== 0) void load(ymd(mon), ymd(addDays(mon, 6)));
  }, [week, mon, load]);

  const pending = useMemo(() => needingLog(items), [items]);
  const current = selected !== null ? items.find((b) => b.id === selected) ?? null : null;
  const logging = mode.kind === "log" ? items.find((b) => b.id === mode.id) ?? null : null;

  const goTo = (booking: Booking) => {
    setSelected(booking.id);
    setMode({ kind: "none" });
    const d = new Date(booking.date + "T00:00:00");
    setWeek(Math.round((monday(d).getTime() - monday(new Date()).getTime()) / (7 * 86400000)));
  };

  function saved(made: Booking[]) {
    setItems((old) => [...old.filter((b) => !made.some((m) => m.id === b.id)), ...made]);
    setMode({ kind: "none" });
    setSelected(made[0].id);
    setWeek(Math.round((monday(new Date(made[0].date + "T00:00:00")).getTime() - monday(new Date()).getTime()) / (7 * 86400000)));
  }

  return (
    <FlowScope>
      <div className={styles.page}>
        <TeacherHeader name={name} students={students.length} groups={groups.length} waiting={waiting} active="today" pending={pending.length} />

        <div className={styles.bar}>
          <div className={styles.row}>
            <button type="button" className={styles.ghost} onClick={() => { setWeek((w) => w - 1); setSelected(null); }} aria-label="Previous week">&lsaquo;</button>
            <strong>{weekRange(mon)}</strong>
            <button type="button" className={styles.ghost} onClick={() => { setWeek((w) => w + 1); setSelected(null); }} aria-label="Next week">&rsaquo;</button>
            {week !== 0 && <button type="button" className={styles.ghost} onClick={() => { setWeek(0); setSelected(null); }}>This week</button>}
          </div>
          <div className={styles.row}>
            <span className={`${styles.chip} ${styles.pink}`}>1-to-1</span>
            <span className={`${styles.chip} ${styles.blue}`}>Group</span>
            <button type="button" className={styles.primary} onClick={() => { setSelected(null); setMode({ kind: "book" }); }}>+ Book a session</button>
          </div>
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        {pending.length > 0 && (
          <div className={styles.tip}>
            <strong>{pending.length} {pending.length === 1 ? "session needs" : "sessions need"} a log:</strong>
            {pending.map((b) => (
              <button key={b.id} type="button" className={styles.small} onClick={() => { goTo(b); setMode({ kind: "log", id: b.id }); }}>
                {b.who.name} &middot; {niceDate(b.date)}
              </button>
            ))}
          </div>
        )}

        <WeekGrid monday={mon} bookings={items} selected={selected} loading={loading} onSelect={(b) => { setSelected(b.id); setMode({ kind: "none" }); }} />

        {mode.kind === "log" && logging ? (
          <SessionLogForm
            booking={logging}
            members={logging.who.type === "group" ? groups.find((g) => g.id === logging.who.id)?.members ?? [] : []}
            onClose={() => setMode({ kind: "none" })}
            onSaved={(b) => { setItems((old) => old.map((x) => (x.id === b.id ? b : x))); setSelected(b.id); setMode({ kind: "none" }); }}
          />
        ) : mode.kind === "book" ? (
          <BookingForm students={students} groups={groups} initialWho={mode.who} onClose={() => setMode({ kind: "none" })} onSaved={saved} />
        ) : current ? (
          <BookingDetail
            booking={current}
            members={current.who.type === "group" ? groups.find((g) => g.id === current.who.id)?.members ?? [] : []}
            seriesLeft={current.seriesId ? items.filter((b) => b.seriesId === current.seriesId && b.date >= current.date).length : 1}
            onClose={() => setSelected(null)}
            onLog={() => setMode({ kind: "log", id: current.id })}
            onCancelled={(whole) => { setItems((old) => old.filter((b) => (whole && current.seriesId ? !(b.seriesId === current.seriesId && b.date >= current.date) : b.id !== current.id))); setSelected(null); }}
          />
        ) : null}
      </div>
    </FlowScope>
  );
}

