import Link from "next/link";
import AddToCalendar from "@/components/student/AddToCalendar";
import { DAY_SHORT, MONTH_SHORT, nextSession, rangeText, safeHref } from "@/lib/groups";
import type { MyGroup } from "@/types";
import styles from "./StudentGroup.module.css";

interface Props {
  group: MyGroup;
  /** The topics where the student made a mistake in the diagnostic, so the matching topics can be highlighted. */
  misconceptionTopics: string[];
  /** For example "GCSE Maths". */
  levelSubject: string;
}

/** Step 4: the group a tutor placed the student in, laid out as in the prototype. */
export default function StudentGroup({ group, misconceptionTopics, levelSubject }: Props) {
  const link = safeHref(group.zoomLink);
  const next = nextSession(group).start;
  return (
    <div className={styles.page}>
      <header>
        <p className={styles.eyebrow}>Assigned by {group.tutorName}</p>
        <h1 className={styles.title}>You&rsquo;re in the {group.name}</h1>
      </header>

      <section className={styles.card} aria-label="When and where">
        <div className={styles.when}>
          <div className={styles.date} aria-label={`Next session ${next.toDateString()}`}>
            <span className={styles.dateDay}>{DAY_SHORT[group.dayOfWeek].toUpperCase()}</span>
            <b className={styles.dateNum}>{next.getDate()}</b>
            <span className={styles.dateMonth}>{MONTH_SHORT[next.getMonth()]}</span>
          </div>
          <div>
            <h2 className={styles.time}>{rangeText(group.startTime, group.endTime)}</h2>
            <p className={styles.muted}>Pakistan time &middot; live on Zoom &middot; up to {group.capacity} students</p>
          </div>
        </div>
        <div className={styles.zoom}>
          <span className={styles.label}>Zoom link</span>
          <span className={styles.zoomText}>{group.zoomLink}</span>
        </div>
        <div className={styles.row}>
          {link && <a href={link} target="_blank" rel="noopener noreferrer" className={styles.primary}>Join on Zoom</a>}
          <AddToCalendar group={group} />
        </div>
      </section>

      {group.topics.length > 0 && (
        <section className={styles.card} aria-label="What you will cover">
          <h2 className={styles.heading}>What you&rsquo;ll cover</h2>
          <ul className={styles.chips}>
            {group.topics.map((t) => {
              const yours = misconceptionTopics.includes(t);
              return <li key={t} className={`${styles.chip} ${yours ? styles.yours : ""}`}>{t}{yours ? " \u00b7 your misconception" : ""}</li>;
            })}
          </ul>
        </section>
      )}

      {group.note && (
        <section className={`${styles.card} ${styles.cream}`} aria-label="Note from your tutor">
          <span className={styles.label}>Note from {group.tutorName}</span>
          <p className={styles.noteText}>{group.note}</p>
        </section>
      )}

      {group.sendVideo && (
        <section className={styles.card} aria-label="Before the session">
          <h2 className={styles.heading}>Before the session</h2>
          <p className={styles.plain}>Your tutor will send you a short video to watch before the session. Look for it in your <Link href="/student/messages" className={styles.inline}>messages</Link>.</p>
        </section>
      )}

      <section className={`${styles.card} ${styles.lav}`} aria-label="Next step">
        <span className={styles.label}>Next step</span>
        <h2 className={styles.heading}>Your learning map is ready</h2>
        <p className={styles.plain}>Every {levelSubject} topic, ordered for you from your diagnostic.</p>
        <div className={styles.row}>
          <Link href="/student/learning-map" className={styles.primary}>Open my learning map</Link>
        </div>
      </section>
    </div>
  );
}
