import { requireTutor } from "@/lib/session";
import { getDiagnosticBatches, getDiagnosticQuestions, getDiagnosticTopics, getStartupOptions } from "@/services/tutorService";
import DiagnosticQuestionBuilder from "@/components/tutor/DiagnosticQuestionBuilder";
import Alert from "@/components/ui/Alert";

// Tutors and admins only: this is where diagnostic questions are written.
export default async function DiagnosticQuestionsPage() {
  await requireTutor();

  try {
    const [questions, batches, options, topics] = await Promise.all([getDiagnosticQuestions(), getDiagnosticBatches(), getStartupOptions(), getDiagnosticTopics()]);
    return <DiagnosticQuestionBuilder initialQuestions={questions} initialBatches={batches} subjects={options.filter((o) => o.category === "subject")} topics={topics} />;
  } catch (err) {
    return <Alert>Could not load the questions: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
