import { WEEKDAYS, addDays, isPast, niceTime, ymd } from "@/lib/calendar";
import type { Booking } from "@/types";
import styles from "./WeekGrid.module.css";

interface Props {
  monday: Date;
  bookings: Booking[];
  selected: number | null;
  loading: boolean;
  onSelect: (booking: Booking) => void;
}

/** Seven day boxes for one week. Each session is a button: pink for 1-to-1, lavender for a group. */
export default function WeekGrid({ monday, bookings, selected, loading, onSelect }: Props) {
  const today = ymd(new Date());
  return (
    <div className={styles.cal} aria-busy={loading}>
      {WEEKDAYS.map((name, i) => {
        const day = addDays(monday, i);
        const date = ymd(day);
        const items = bookings.filter((b) => b.date === date).sort((a, b) => (a.startTime < b.startTime ? -1 : 1));
        return (
          <div key={date} className={`${styles.day} ${date === today ? styles.today : ""}`}>
            <div className={styles.head}>
              <span>{name}</span>
              <b>{day.getDate()}</b>
            </div>
            {items.length ? (
              items.map((b) => {
                const need = isPast(b) && !b.logged;
                return (
                  <button key={b.id} type="button" className={`${styles.bk} ${b.who.type === "group" ? styles.grp : styles.one} ${selected === b.id ? styles.sel : ""}`} onClick={() => onSelect(b)}>
                    <span className={styles.time}>{niceTime(b.startTime)}</span>
                    <span className={styles.name}>{b.who.name}</span>
                    {b.logged ? <span className={styles.status}>Logged &#10003;</span> : need ? <span className={`${styles.status} ${styles.need}`}>Log needed</span> : null}
                  </button>
                );
              })
            ) : (
              <span className={styles.free}>{loading ? "" : "Free"}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
