import { requireStudent } from "@/lib/session";
import { getQuizzes } from "@/services/quizService/quizService.server";
import StudentQuizList from "@/components/student/StudentQuizList";
import Alert from "@/components/ui/Alert";

// The quizzes a student can take, with their best score on each.
export default async function StudentQuizzesPage() {
  await requireStudent();
  try {
    return <StudentQuizList quizzes={await getQuizzes()} />;
  } catch (err) {
    return <Alert>Could not load the quizzes: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
