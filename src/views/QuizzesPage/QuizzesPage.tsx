import { requireTutor } from "@/lib/session";
import { getQuizzes } from "@/services/quizService/quizService.server";
import QuizTable from "@/components/tutor/QuizTable";
import QuizUpload from "@/components/tutor/QuizUpload";
import Alert from "@/components/ui/Alert";

// Tutors and admins: upload a quiz file, then see every quiz and manage it.
export default async function QuizzesPage() {
  const user = await requireTutor();
  try {
    const quizzes = await getQuizzes();
    return (
      <>
        <QuizUpload />
        {/* The key makes the table start again from the fresh list when a quiz is uploaded (the table keeps its own copy to update at once when one is hidden or deleted). */}
        <QuizTable key={quizzes.map((q) => q.id).join(",")} quizzes={quizzes} isAdmin={user.role === "admin"} userId={user.id} />
      </>
    );
  } catch (err) {
    return <Alert>Could not load the quizzes: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
