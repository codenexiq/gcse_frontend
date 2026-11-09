import type { SessionGroup, StudentReviewData } from "@/types";

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "18:00" -> "6 pm", "11:30" -> "11:30 am" */
export function clock(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}${m === 0 ? "" : `:${String(m).padStart(2, "0")}`} ${h < 12 ? "am" : "pm"}`;
}

/** "Thursdays, 6 pm to 7 pm" */
export const whenText = (g: Pick<SessionGroup, "dayOfWeek" | "startTime" | "endTime">) => `${DAY_NAMES[g.dayOfWeek]}s, ${clock(g.startTime)} to ${clock(g.endTime)}`;

/** The topics a student needs help with: the ones they got wrong, then the ones they have not learned yet. */
export const needsOf = (data: Pick<StudentReviewData, "result">): string[] => (data.result ? [...data.result.needWork, ...data.result.notLearnedTopics] : []);

/** The topics a group covers that this student needs. */
export const overlap = (g: Pick<SessionGroup, "topics">, needs: string[]) => g.topics.filter((t) => needs.includes(t));

/** The group that covers most of what the student needs, among those that still have room. Null when none covers anything. */
export function suggestedGroupId(groups: SessionGroup[], needs: string[], studentId: number): number | null {
  let best: { id: number; n: number } | null = null;
  for (const g of groups) {
    const full = g.members.length >= g.capacity && !g.members.some((m) => m.id === studentId);
    const n = overlap(g, needs).length;
    if (!full && n > 0 && (!best || n > best.n)) best = { id: g.id, n };
  }
  return best ? best.id : null;
}

/** Only a normal web address may be opened from a link. */
export const safeHref = (url: string) => (/^https:\/\//i.test(url) ? url : "");

export const MONTH_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** "18:00" -> "6:00 pm" (always with minutes, as in the design). */
export function clockFull(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

/** "6:00 – 7:00 pm", or "11:00 am – 12:00 pm" when the two halves of the day differ. */
export function rangeText(startTime: string, endTime: string): string {
  const a = clockFull(startTime), b = clockFull(endTime);
  const sameHalf = a.slice(-2) === b.slice(-2);
  return `${sameHalf ? a.slice(0, -3) : a} \u2013 ${b}`;
}

/** The next time this weekly group meets (today counts while it has not started yet). */
export function nextSession(g: Pick<SessionGroup, "dayOfWeek" | "startTime" | "endTime">, now: Date = new Date()): { start: Date; end: Date } {
  const [sh, sm] = g.startTime.split(":").map(Number);
  const [eh, em] = g.endTime.split(":").map(Number);
  const today = (now.getDay() + 6) % 7; // 0 = Monday
  let ahead = (g.dayOfWeek - today + 7) % 7;
  const at = (days: number, h: number, m: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, h, m, 0, 0);
  if (ahead === 0 && at(0, sh, sm) <= now) ahead = 7;
  return { start: at(ahead, sh, sm), end: at(ahead, eh, em) };
}

const icsStamp = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
const icsText = (t: string) => t.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");

/** A calendar file (.ics) for the group's weekly session, repeating every week, with the Zoom link in it. */
export function calendarFile(g: Pick<SessionGroup, "name" | "dayOfWeek" | "startTime" | "endTime" | "zoomLink">): string {
  const { start, end } = nextSession(g);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Educate Cloud//Groups//EN",
    "BEGIN:VEVENT",
    `UID:group-${icsStamp(start)}-${g.name.replace(/\W+/g, "-")}@educate.cloud`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    "RRULE:FREQ=WEEKLY",
    `SUMMARY:${icsText(g.name)}`,
    `DESCRIPTION:${icsText(`Live on Zoom: ${g.zoomLink}`)}`,
    `LOCATION:${icsText(g.zoomLink)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
