import Link from "next/link";
import GroupAssign from "@/components/tutor/GroupAssign";
import FlowScope from "@/components/ui/FlowScope";
import { needsOf } from "@/lib/groups";
import type { SessionGroup, StudentReviewData } from "@/types";
import styles from "./StudentReview.module.css";

/** One student's results for a tutor deciding where to place them, laid out as in the prototype. */
export default function StudentReview({ data, groups }: { data: StudentReviewData; groups: SessionGroup[] }) {
  const { about, result } = data;
  const first = (data.fullName || data.email).trim().split(/\s+/)[0];
  const line = [[about.level, about.subject].filter(Boolean).join(" "), about.tier, about.examBoard, about.schoolYear, about.targetGrade ? `Target ${about.targetGrade}` : ""].filter(Boolean).join(" \u00b7 ");
  return (
    <FlowScope>
      <div className={styles.page}>
        <div className={styles.top}>
          <Link href="/tutor/dashboard/students" className={styles.ghost}>&lsaquo; All students</Link>
          <Link href={`/tutor/dashboard/students/${data.id}/overview`} className={styles.ghost}>Open profile</Link>
        </div>

        <section className={styles.card} aria-label="Diagnostic result">
          <div className={styles.between}>
            <div>
              <h1 className={styles.name}>{data.fullName || "Name not given"}</h1>
              <p className={styles.small}>{line || "About you not filled in"}</p>
            </div>
            <span className={`${styles.chip} ${data.group ? styles.chipNavy : styles.chipPink}`}>{data.group ? "In a group" : "Needs a group"}</span>
          </div>

          {!result ? (
            <p className={styles.muted}>{first} has not finished the diagnostic yet.</p>
          ) : (
            <>
              <div className={styles.score}>
                <span className={styles.big}>{result.correct}/{result.total}</span>
                <span className={styles.muted}>on the diagnostic</span>
              </div>
              {result.misconceptions.length > 0 && (
                <div className={styles.block}>
                  <span className={styles.label}>Misconceptions</span>
                  <div className={styles.chips}>
                    {result.misconceptions.map((m) => <span key={`${m.topic}-${m.text}`} className={`${styles.chip} ${styles.chipPink}`}>{m.text.split(":")[0]}</span>)}
                  </div>
                </div>
              )}
              {result.notLearnedTopics.length > 0 && (
                <div className={styles.block}>
                  <span className={styles.label}>Not learned yet</span>
                  <div className={styles.chips}>
                    {result.notLearnedTopics.map((t) => <span key={t} className={`${styles.chip} ${styles.chipLav}`}>{t}</span>)}
                  </div>
                </div>
              )}
              {result.needWork.length > 0 && (
                <div className={styles.block}>
                  <span className={styles.label}>Needs work</span>
                  <div className={styles.chips}>
                    {result.needWork.map((t) => <span key={t} className={`${styles.chip} ${styles.chipLav}`}>{t}</span>)}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <GroupAssign key={`${data.group?.groupId ?? "none"}-${data.group?.note ?? ""}`} studentId={data.id} firstName={first} groups={groups} needs={needsOf(data)} current={data.group} />
      </div>
    </FlowScope>
  );
}
