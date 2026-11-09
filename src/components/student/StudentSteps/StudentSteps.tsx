"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { SIGN_UP_LABEL, STUDENT_STEPS, canOpen, isDone } from "@/lib/studentSteps";
import type { StudentProgress } from "@/types";
import styles from "./StudentSteps.module.css";

/**
 * The step bar at the top of the student screens, as in the prototype: Sign up, About you, Diagnostic, Your group, Learning map.
 * A finished step shows a tick, the current one is ringed, and a step that is not open yet is not a link.
 * `progress` is null when it could not be read: then every step stays a link and the page itself decides.
 */
export default function StudentSteps({ progress }: { progress: StudentProgress | null }) {
  const pathname = usePathname();
  // Only the workflow screens show the bar; pages like Monthly progress are not steps.
  if (!STUDENT_STEPS.some((s) => pathname === s.href || pathname.startsWith(`${s.href}/`))) return null;
  return (
    <nav className={styles.bar} aria-label="Your steps">
      <ol className={styles.list}>
        <li className={`${styles.item} ${styles.done}`}>
          <span className={styles.dot}><Check size={14} strokeWidth={3} aria-hidden="true" /></span>
          {SIGN_UP_LABEL}
          <span className={styles.line} aria-hidden="true" />
        </li>
        {STUDENT_STEPS.map((s, i) => {
          const current = pathname === s.href || pathname.startsWith(`${s.href}/`);
          const done = progress ? isDone(s.key, progress) : false;
          const open = progress ? canOpen(s.key, progress) : true;
          const cls = `${styles.item} ${current ? styles.now : done ? styles.done : ""} ${open ? "" : styles.locked}`;
          const inner = (
            <>
              <span className={styles.dot}>{done && !current ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : s.number}</span>
              {s.label}
            </>
          );
          return (
            <li key={s.href} className={cls} aria-current={current ? "step" : undefined}>
              {open ? <Link href={s.href} className={styles.link}>{inner}</Link> : <span className={styles.link} aria-disabled="true" title="Finish the step before this one first">{inner}</span>}
              {i < STUDENT_STEPS.length - 1 && <span className={styles.line} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
