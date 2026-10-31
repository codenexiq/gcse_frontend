import { requireTutor } from "@/lib/session";
import { getDiagnosticQuestions, getDiagnosticTopics, getStartupOptions } from "@/services/tutorService";
import DiagnosticQuestionBuilder from "@/components/tutor/DiagnosticQuestionBuilder";
import Alert from "@/components/ui/Alert";

// Tutors and admins only: this is where diagnostic questions are written.
export default async function DiagnosticQuestionsPage() {
  await requireTutor();

  try {
    const [questions, options, topics] = await Promise.all([getDiagnosticQuestions(), getStartupOptions(), getDiagnosticTopics()]);
    return <DiagnosticQuestionBuilder initialQuestions={questions} subjects={options.filter((o) => o.category === "subject")} topics={topics} />;
  } catch (err) {
    return <Alert>Could not load the questions: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
