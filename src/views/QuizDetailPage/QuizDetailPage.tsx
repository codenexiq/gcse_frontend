import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { getQuizAttempts, getQuizForTutor } from "@/services/quizService/quizService.server";
import QuizDetail from "@/components/tutor/QuizDetail";
import Alert from "@/components/ui/Alert";

// One quiz for a tutor or admin: the results so far and every question with its answer.
export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireTutor();
  const { id } = await params;
  const quizId = Number(id);
  if (!Number.isInteger(quizId) || quizId <= 0) notFound();
  try {
    const [quiz, attempts] = await Promise.all([getQuizForTutor(quizId), getQuizAttempts(quizId)]);
    return <QuizDetail quiz={quiz} attempts={attempts} canEdit={user.role === "admin" || quiz.createdBy === user.id} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <Alert>Could not load this quiz: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
