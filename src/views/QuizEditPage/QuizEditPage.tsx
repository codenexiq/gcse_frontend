import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { draftsFromQuiz } from "@/lib/quiz";
import { getQuizForEdit } from "@/services/quizService/quizService.server";
import QuizBuilder from "@/components/tutor/QuizBuilder";
import Alert from "@/components/ui/Alert";

// Tutors and admins: change a quiz that is already saved (only its uploader, or an admin).
export default async function QuizEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireTutor();
  const { id } = await params;
  const quizId = Number(id);
  if (!Number.isInteger(quizId) || quizId <= 0) notFound();
  try {
    const quiz = await getQuizForEdit(quizId);
    if (user.role !== "admin" && quiz.createdBy !== user.id) return <Alert>Only an admin or the tutor who uploaded this quiz can edit it.</Alert>;
    const existing = {
      id: quiz.id,
      title: quiz.title,
      subtitle: quiz.subtitle,
      instructions: quiz.instructions,
      published: quiz.published,
      attemptCount: quiz.attemptCount,
      questions: draftsFromQuiz(quiz, quiz.diagrams ?? {}),
    };
    return <QuizBuilder existing={existing} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <Alert>Could not load this quiz: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
