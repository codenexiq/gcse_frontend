"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { ApiError } from "@/lib/api";
import { formatQuizDate } from "@/lib/quiz";
import { useToast } from "@/hooks/useToast";
import { deleteQuiz, setQuizPublished } from "@/services/quizService";
import type { QuizSummary } from "@/types";
import styles from "./QuizTable.module.css";

interface Props {
  quizzes: QuizSummary[];
  /** Admins can change or delete any quiz; a tutor only their own. */
  isAdmin: boolean;
  userId: number;
}

/** Every uploaded quiz: open it, show or hide it for students, delete it. */
export default function QuizTable({ quizzes: initial, isAdmin, userId }: Props) {
  const toast = useToast();
  const [quizzes, setQuizzes] = useState(initial);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<QuizSummary | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const canManage = (q: QuizSummary) => isAdmin || q.createdBy === userId;

  async function toggle(q: QuizSummary) {
    setBusyId(q.id);
    try {
      await setQuizPublished(q.id, !q.published);
      setQuizzes((old) => old.map((x) => (x.id === q.id ? { ...x, published: !q.published } : x)));
      toast.success(q.published ? `"${q.title}" is hidden from students.` : `"${q.title}" is visible to students.`, { title: q.published ? "Hidden" : "Published" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not change the quiz.", { title: "Not changed" });
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusyId(deleting.id);
    setDeleteError("");
    try {
      await deleteQuiz(deleting.id);
      setQuizzes((old) => old.filter((x) => x.id !== deleting.id));
      toast.success(`"${deleting.title}" and its results are deleted.`, { title: "Deleted" });
      setDeleting(null);
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Could not delete the quiz.");
    } finally {
      setBusyId(null);
    }
  }

  if (quizzes.length === 0) return <EmptyState title="No quizzes yet" text="Upload a quiz file above and it will appear here." />;

  return (
    <section className={styles.panel} aria-label="Quizzes">
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Quiz</th>
              <th className={styles.center}>Questions</th>
              <th className={styles.center}>Marks</th>
              <th className={styles.center}>Attempts</th>
              <th>Uploaded by</th>
              <th>Date</th>
              <th>Status</th>
              <th className={styles.center}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => (
              <tr key={q.id}>
                <td className={styles.name}>
                  <Link href={`/tutor/dashboard/quizzes/${q.id}`} className={styles.link}>{q.title}</Link>
                  {q.subtitle && <span className={styles.sub}>{q.subtitle}</span>}
                </td>
                <td className={styles.center}>{q.questionCount}</td>
                <td className={styles.center}>{q.totalMarks}</td>
                <td className={styles.center}>{q.attemptCount}</td>
                <td>{q.createdByName}</td>
                <td className={styles.date}>{formatQuizDate(q.createdAt)}</td>
                <td><span className={`${styles.badge} ${q.published ? styles.live : styles.hidden}`}>{q.published ? "Published" : "Hidden"}</span></td>
                <td className={styles.center}>
                  {canManage(q) ? (
                    <span className={styles.actions}>
                      <button type="button" className={styles.icon} onClick={() => toggle(q)} disabled={busyId === q.id} aria-label={q.published ? `Hide ${q.title} from students` : `Show ${q.title} to students`} title={q.published ? "Hide from students" : "Show to students"}>
                        {q.published ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                      </button>
                      <button type="button" className={`${styles.icon} ${styles.danger}`} onClick={() => { setDeleteError(""); setDeleting(q); }} disabled={busyId === q.id} aria-label={`Delete ${q.title}`} title="Delete">
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </span>
                  ) : (
                    <span className={styles.none}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this quiz?"
        busy={busyId !== null && deleting !== null}
        error={deleteError}
        actions={[{ label: "Delete quiz", tone: "danger", onClick: remove }]}
        onClose={() => setDeleting(null)}
      >
        <p>{deleting ? `"${deleting.title}" and every student's results for it are removed for good.` : ""}</p>
      </ConfirmDialog>
    </section>
  );
}
