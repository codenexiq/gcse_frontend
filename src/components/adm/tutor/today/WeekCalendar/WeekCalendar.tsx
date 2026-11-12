import type { CSSProperties } from "react";
import Link from "next/link";
import Icon from "@/components/adm/ui/Icon";
import { DAYS } from "@/lib/icons";
import { niceTime } from "@/lib/format";
import type { TodayData } from "@/types/tutor";

/** The week at a glance, with Previous / This week / Next. The week is in the address (?week=1 is next week). */
export default function WeekCalendar({ days, weekStart, week }: { days: TodayData["days"]; weekStart: string; week: number }) {
  const label = new Date(`${weekStart}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <section className="card">
      <div className="row between">
        <h2>
          <Icon name="calendar" /> Week of {label}
        </h2>
        <div className="row tight">
          <Link href={`/tutor?week=${week - 1}`} className="btn ghost sm" aria-label="Previous week">‹</Link>
          <Link href="/tutor" className="btn ghost sm">This week</Link>
          <Link href={`/tutor?week=${week + 1}`} className="btn ghost sm" aria-label="Next week">›</Link>
        </div>
      </div>
      <div className="cal">
        {days.map((d, i) => (
          <div className={`day${d.isToday ? " is-today" : ""}`} key={d.date}>
            <div className="day-h">
              <strong>{DAYS[i]}</strong>
              <span>{d.day}</span>
            </div>
            {d.sessions.map((b) => (
              <div className={`ev${b.kind === "group" ? " grp" : ""}`} style={{ "--sc": b.subject?.color ?? "#888" } as CSSProperties} key={b.id}>
                <b>{niceTime(b.start)}</b>
                <span>{b.who}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
