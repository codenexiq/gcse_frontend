"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./StudentSteps.module.css";

// The numbers follow the design: the bar starts at step 2.
const STEPS = [
  { number: 2, label: "About you", href: "/student/about-you" },
  { number: 3, label: "Diagnostic", href: "/student/diagnostic" },
  { number: 4, label: "Your group", href: "/student/group" },
  { number: 5, label: "Learning map", href: "/student/learning-map" },
];

/** The numbered step bar at the top of the student screens. Every step is a link to its screen. */
export default function StudentSteps() {
  const pathname = usePathname();
  return (
    <nav className={styles.bar} aria-label="Your steps">
      <ol className={styles.list}>
        {STEPS.map((s, i) => {
          const current = pathname === s.href || pathname.startsWith(`${s.href}/`);
          return (
            <li key={s.href} className={styles.item}>
              {i > 0 && <span className={styles.line} aria-hidden="true" />}
              <Link href={s.href} className={`${styles.step} ${current ? styles.current : ""}`} aria-current={current ? "step" : undefined}>
                <span className={styles.circle}>{s.number}</span>
                <span className={styles.label}>{s.label}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
