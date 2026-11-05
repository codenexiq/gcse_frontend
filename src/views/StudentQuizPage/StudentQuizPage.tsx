import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { getQuizAttempts, getQuizForStudent } from "@/services/quizService/quizService.server";
import QuizPlayer from "@/components/student/QuizPlayer";
import Alert from "@/components/ui/Alert";

// One quiz to take. The back-end never sends a student the answers, and hides quizzes that are not published.
export default async function StudentQuizPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStudent();
  const { id } = await params;
  const quizId = Number(id);
  if (!Number.isInteger(quizId) || quizId <= 0) notFound();
  try {
    const [quiz, attempts] = await Promise.all([getQuizForStudent(quizId), getQuizAttempts(quizId)]);
    return <QuizPlayer quiz={quiz} attempts={attempts} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <Alert>Could not load this quiz: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
