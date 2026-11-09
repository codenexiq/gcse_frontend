import Link from "next/link";
import { BookOpen, ListChecks } from "lucide-react";
import { niceDate, niceTime } from "@/lib/calendar";
import { safeHref } from "@/lib/groups";
import type { StudentHome as Data } from "@/types";
import styles from "./StudentHome.module.css";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** The top of the student's learning map, as in the prototype: Your tasks, Upcoming lessons and Messages. */
export default function StudentHome({ data }: { data: Data }) {
  const now = today();
  const routeName = data.tasks[0]?.routeName;
  return (
    <section className={styles.grid} aria-label="This week">
      <div className={styles.card}>
        <div className={`${styles.row} ${styles.between}`}>
          <h2 className={styles.h2}>Your tasks</h2>
          {routeName && <span className={styles.small}>{routeName}</span>}
        </div>
        {data.tasks.length === 0 ? (
          <p className={styles.small}>No tasks yet. Your tutor will add lessons and quizzes here.</p>
        ) : (
          <ol className={styles.tasks}>
            {data.tasks.slice(0, 6).map((t) => {
              const late = !t.done && t.due < now;
              const Icon = t.type === "lesson" ? BookOpen : ListChecks;
              return (
                <li key={`${t.type}-${t.itemId}`} className={t.done ? styles.done : ""}>
                  <span className={`${styles.icon} ${t.type === "lesson" ? styles.lesson : styles.quiz}`}><Icon size={16} aria-hidden="true" /></span>
                  <div className={styles.taskText}>
                    <strong>{t.title}</strong>
                    <span className={styles.small}>{t.type === "lesson" ? "Lesson" : "Quiz"}{t.topic ? ` · ${t.topic}` : ""}</span>
                  </div>
                  {t.done ? (
                    <span className={`${styles.chip} ${styles.navy}`}>Done &#10003;</span>
                  ) : (
                    <>
                      <span className={`${styles.chip} ${late ? styles.pink : styles.cream}`}>{late ? "Overdue" : `Due ${niceDate(t.due)}`}</span>
                      <Link href={t.type === "lesson" ? `/student/learning-map/lesson/${t.itemId}` : `/student/quizzes/${t.itemId}`} className={`${styles.btn} ${styles.primary}`}>{t.type === "quiz" ? "Start quiz" : "Open"}</Link>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className={styles.stack}>
        <div className={styles.card}>
          <h2 className={styles.h2}>Upcoming lessons</h2>
          {data.sessions.length === 0 ? (
            <p className={styles.small}>No lessons booked yet.</p>
          ) : (
            data.sessions.map((s) => (
              <div key={s.id} className={`${styles.row} ${styles.between} ${styles.mini}`}>
                <span>
                  <strong>{niceDate(s.date)}</strong> &middot; {niceTime(s.startTime)}
                  <span className={`${styles.small} ${styles.block}`}>{s.groupName ?? "1-to-1 with your tutor"}</span>
                </span>
                {safeHref(s.zoomLink) && <a href={safeHref(s.zoomLink)} target="_blank" rel="noopener noreferrer" className={styles.btn}>Join</a>}
              </div>
            ))
          )}
        </div>

        <div className={styles.card}>
          <div className={`${styles.row} ${styles.between}`}>
            <h2 className={styles.h2}>Messages</h2>
            {data.messages.unread > 0 && <span className={styles.count}>{data.messages.unread} new</span>}
          </div>
          {data.messages.last ? <p className={styles.small} style={{ color: "#13283c" }}><strong>{data.messages.last.from}:</strong> {data.messages.last.text.slice(0, 90)}</p> : <p className={styles.small}>No messages yet.</p>}
          <div><Link href="/student/messages" className={styles.btn}>Open messages</Link></div>
        </div>
      </div>
    </section>
  );
}
