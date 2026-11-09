import type { Booking } from "@/types";

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** A Date as "2026-11-02" in the browser's own time. */
export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
/** "2026-11-02" as a Date (local midnight). */
export const parseDay = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** The Monday of the week a date is in. */
export const monday = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

/** "Mon 2 Nov" */
export const niceDate = (s: string) => parseDay(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
/** "17:00" -> "5pm", "16:30" -> "4:30pm" */
export function niceTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}${m === 0 ? "" : `:${String(m).padStart(2, "0")}`}${h < 12 ? "am" : "pm"}`;
}
/** "17:00" + 60 -> "18:00" */
export function endTime(t: string, minutes: number): string {
  const [h, m] = t.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
/** "2 Nov – 8 Nov 2026" */
export function weekRange(mon: Date): string {
  const a = mon.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const b = addDays(mon, 6).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${a} \u2013 ${b}`;
}

/** Has the session finished (by this computer's clock)? */
export function isPast(b: Pick<Booking, "date" | "startTime" | "minutes">, now: Date = new Date()): boolean {
  const [h, m] = b.startTime.split(":").map(Number);
  const end = parseDay(b.date);
  end.setHours(h, m + b.minutes, 0, 0);
  return end < now;
}

/** Past sessions from the last 14 days that still have no log. */
export function needingLog(bookings: Booking[], now: Date = new Date()): Booking[] {
  const since = ymd(addDays(now, -14));
  return bookings.filter((b) => !b.logged && b.date >= since && isPast(b, now)).sort((a, b) => (a.date + a.startTime < b.date + b.startTime ? 1 : -1));
}

export const greeting = (now: Date = new Date()) => (now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening");
