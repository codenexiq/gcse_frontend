import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { formatQuizDate, tone } from "@/lib/quiz";
import type { QuizSummary } from "@/types";
import styles from "./StudentQuizList.module.css";

/** The quizzes a student can take, with their best score on each. */
export default function StudentQuizList({ quizzes }: { quizzes: QuizSummary[] }) {
  if (quizzes.length === 0) return <EmptyState icon={ListChecks} title="No quizzes yet" text="When your tutor adds a quiz, it will appear here." />;
  return (
    <ul className={styles.grid} aria-label="Quizzes">
      {quizzes.map((q) => {
        const tried = (q.myAttempts ?? 0) > 0 && q.myBest !== null && q.myBest !== undefined;
        return (
          <li key={q.id} className={styles.card}>
            <h2 className={styles.title}>{q.title}</h2>
            {q.subtitle && <p className={styles.sub}>{q.subtitle}</p>}
            <p className={styles.meta}>{q.questionCount} question{q.questionCount === 1 ? "" : "s"} · {q.totalMarks} marks · added {formatQuizDate(q.createdAt)}</p>
            <p className={`${styles.best} ${tried ? styles[tone(q.myBest as number, q.questionCount)] : styles.none}`}>
              {tried ? `Best: ${q.myBest}/${q.questionCount} · tried ${q.myAttempts} time${q.myAttempts === 1 ? "" : "s"}` : "Not tried yet"}
            </p>
            <Link href={`/student/quizzes/${q.id}`} className={styles.start}>{tried ? "Try again" : "Start quiz"} <ArrowRight size={16} aria-hidden="true" /></Link>
          </li>
        );
      })}
    </ul>
  );
}
