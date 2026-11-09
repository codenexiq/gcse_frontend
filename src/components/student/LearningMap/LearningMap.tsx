import Link from "next/link";
import PractiseButton from "@/components/student/PractiseButton";
import type { LearningMap as Data, TopicState } from "@/types";
import { DAY_SHORT, clock, safeHref } from "@/lib/groups";
import { niceDate, niceTime } from "@/lib/calendar";
import styles from "./LearningMap.module.css";

const LABELS: Record<TopicState, [string, string]> = {
  mastered: ["Mastered", styles.navy],
  in_progress: ["In progress", styles.blue],
  needs_work: ["Needs work", styles.pink],
  not_started: ["Not started", styles.out],
};

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** "1 h 05 m", "45 m", "0 m" */
const minutes = (m: number) => {
  if (!m) return "0 m";
  const h = Math.floor(m / 60);
  return `${h ? `${h} h ` : ""}${String(m % 60).padStart(h ? 2 : 1, "0")} m`;
};

/** Step 5: the learning map, laid out as in the prototype. */
export default function LearningMap({ data }: { data: Data }) {
  const { about, next, nextSession: session } = data;
  const percent = data.total ? Math.round((data.mastered / data.total) * 100) : 0;
  const week = data.week.reduce((a, b) => a + b, 0);
  const link = session ? safeHref(session.zoomLink) : "";
  const sessionText = session ? (session.date ? `${niceDate(session.date)} · ${niceTime(session.startTime)}` : `${DAY_SHORT[session.dayOfWeek]} · ${clock(session.startTime)}`) : "";
  const line = [about.tier ? `${about.tier} tier` : "", about.examBoard, about.targetGrade ? `Target grade ${about.targetGrade}` : ""].filter(Boolean).join(" · ");
  const title = [about.level, about.subject].filter(Boolean).join(" ");

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Your {title ? `${title} ` : ""}learning map</h1>
          <p className={styles.muted}>{line}</p>
        </div>
        <div className={styles.progress}>
          <strong>{data.mastered} of {data.total} topics mastered</strong>
          <div className={styles.bar} role="progressbar" aria-label="Topics mastered" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      <div className={styles.grid3}>
        <div className={styles.card}>
          <span className={`${styles.label} ${styles.muted}`}>Continue where you left off</span>
          {next ? (
            <>
              <h2 className={styles.h2}>{next.name}</h2>
              <p className={`${styles.muted} ${styles.small}`}>{next.status === "in_progress" ? "Practice set in progress" : "Short lesson + 10 practice questions · about 15 min"}</p>
              <div className={styles.row}>
                {next.lessonId ? (
                  <Link href={`/student/learning-map/lesson/${next.lessonId}`} className={`${styles.btn} ${styles.primary}`}>Start lesson</Link>
                ) : (
                  <PractiseButton topic={next.name} className={`${styles.btn} ${styles.primary}`} label={next.status === "in_progress" ? "Resume" : "Start"} />
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className={styles.h2}>Everything mastered</h2>
              <p className={styles.muted}>Time for exam practice.</p>
            </>
          )}
        </div>

        <div className={styles.card}>
          <span className={`${styles.label} ${styles.muted}`}>Practice this week</span>
          <div className={styles.rowBase}>
            <span className={styles.big}>{minutes(week)}</span>
            <span className={styles.muted}>of {data.weeklyGoal / 60} h goal</span>
          </div>
          <div className={styles.days} aria-hidden="true">
            {DAYS.map((d, i) => (
              <div key={i}>
                <i className={data.week[i] ? "" : styles.zero} style={{ height: Math.max(6, Math.min(70, Math.round((data.week[i] / 60) * 70))) }} />
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {session && (
          <div className={`${styles.card} ${styles.dark}`}>
            <span className={styles.label} style={{ opacity: 0.85 }}>Next live session</span>
            <h2 className={styles.h2}>{sessionText}</h2>
            <p className={styles.small} style={{ opacity: 0.9 }}>{session.groupName} &middot; {session.tutorName}</p>
            {link && (
              <div className={styles.push}>
                <a href={link} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.zoom}`}>Join on Zoom</a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`${styles.head} ${styles.topicsHead}`}>
        <h2 className={styles.h2}>All topics</h2>
        <div className={styles.row}>
          {(Object.keys(LABELS) as TopicState[]).map((k) => <span key={k} className={`${styles.chip} ${LABELS[k][1]}`}>{LABELS[k][0]}</span>)}
        </div>
      </div>

      <div className={styles.gridMap}>
        {data.strands.map((strand) => {
          const done = strand.topics.filter((t) => t.status === "mastered").length;
          return (
            <article key={strand.name} className={`${styles.card} ${styles.tight}`}>
              <div className={`${styles.row} ${styles.between}`}>
                <h3 className={styles.h3}>{strand.name}</h3>
                <span className={`${styles.small} ${styles.muted} ${styles.bold}`}>{done} of {strand.topics.length}</span>
              </div>
              <div className={`${styles.bar} ${styles.thin}`} aria-hidden="true">
                <i style={{ width: `${Math.round((done / strand.topics.length) * 100)}%` }} />
              </div>
              <div className={styles.list}>
                {strand.topics.map((t) => {
                  const isNext = next?.name === t.name;
                  return (
                    <div key={t.name} className={`${styles.topic} ${isNext ? styles.next : ""}`}>
                      <span className={styles.topicName}>{t.name}</span>
                      <span className={styles.topicEnd}>
                        {t.score !== null && <span className={`${styles.small} ${styles.bold}`} title="Latest score">{t.score}%</span>}
                        {isNext ? <span className={`${styles.chip} ${styles.navy}`}>Up next</span> : <span className={`${styles.chip} ${LABELS[t.status][1]}`}>{LABELS[t.status][0]}</span>}
                        {t.lessonId ? (
                          <Link href={`/student/learning-map/lesson/${t.lessonId}`} className={styles.btn} aria-label={`Start the ${t.name} lesson`}>Lesson</Link>
                        ) : (
                          t.status !== "mastered" && <PractiseButton topic={t.name} className={styles.btn} label="Practise" ariaLabel={`Practise ${t.name}`} />
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
