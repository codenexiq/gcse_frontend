"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addDays, greeting, monday, needingLog, ymd } from "@/lib/calendar";
import { useChatUnread } from "@/hooks/useChatUnread";
import { listBookings } from "@/services/bookingService";
import styles from "./TeacherHeader.module.css";

export type TeacherTab = "today" | "students" | "content" | "messages";

interface Props {
  name: string;
  students: number;
  groups: number;
  /** Students who finished the diagnostic and are waiting for a group (the badge on the Students tab). */
  waiting: number;
  active: TeacherTab;
  /** Sessions that need a log (the badge on the Today tab). Leave out and the header counts them itself. */
  pending?: number;
}

/** The top of the teacher screens, as in the prototype: a greeting, two chips, and the tabs Today, Students, Content and Messages. */
export default function TeacherHeader({ name, students, groups, waiting, active, pending }: Props) {
  const unread = useChatUnread();
  const [hello, setHello] = useState("Hello");
  const [counted, setCounted] = useState(0);

  useEffect(() => setHello(greeting()), []);
  useEffect(() => {
    if (pending !== undefined) return;
    const mon = monday(new Date());
    listBookings(ymd(addDays(mon, -14)), ymd(addDays(mon, 6)))
      .then((rows) => setCounted(needingLog(rows).length))
      .catch(() => {});
  }, [pending]);

  const today = pending ?? counted;
  const tabs: { key: TeacherTab; href: string; label: string; badge: number }[] = [
    { key: "today", href: "/tutor/dashboard", label: "Today", badge: today },
    { key: "students", href: "/tutor/dashboard/students", label: "Students", badge: waiting },
    { key: "content", href: "/tutor/dashboard/lessons", label: "Content", badge: 0 },
    { key: "messages", href: "/tutor/dashboard/messages", label: "Messages", badge: unread },
  ];

  return (
    <>
      <div className={styles.head}>
        <div>
          <span className={styles.eyebrow}>Teacher dashboard</span>
          <h1 className={styles.title}>{hello}, {name}</h1>
        </div>
        <div className={styles.chips}>
          <span className={`${styles.chip} ${styles.lav}`}>{students} {students === 1 ? "student" : "students"}</span>
          <span className={`${styles.chip} ${styles.cream}`}>{groups} {groups === 1 ? "group" : "groups"} this week</span>
        </div>
      </div>
      <nav className={styles.tabs} aria-label="Teacher sections">
        {tabs.map((t) => (
          <Link key={t.key} href={t.href} className={styles.tab} aria-current={t.key === active ? "page" : undefined}>
            {t.label}
            {t.badge > 0 && <span className={styles.count}>{t.badge > 99 ? "99+" : t.badge}</span>}
          </Link>
        ))}
      </nav>
    </>
  );
}
