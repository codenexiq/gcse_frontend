export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export const first = (name: string) => String(name || "").trim().split(/\s+/)[0] || "there";

/** A message time: just the time for today, otherwise "9 Nov, 15:05". */
export function fmtTime(value: string): string {
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date().toDateString() === d.toDateString();
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return (today ? "" : `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, `) + time;
}

export const niceDate = (value: string) => new Date(value.replace(" ", "T")).toLocaleDateString("en-GB");

/** "2026-11" becomes "November 2026". */
export function monthName(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export const fileSize = (bytes: number) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** "Mon, 9 Nov" for a date written 2026-11-09. */
export const shortDate = (d: string) => new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

/** "6pm" or "6:30pm" for a time written 18:00. */
export function niceTime(t: string): string {
  const h = Number(t.slice(0, 2));
  const m = t.slice(3, 5);
  return `${h % 12 || 12}${m === "00" ? "" : `:${m}`}${h < 12 ? "am" : "pm"}`;
}

/** The time a session ends, written 18:00 + 60 minutes = 19:00. */
export function endTime(t: string, mins: number): string {
  const total = Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)) + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Good morning / afternoon / evening, by the time in the UK. */
export function greeting(now = new Date()): string {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/London" }).format(now));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
