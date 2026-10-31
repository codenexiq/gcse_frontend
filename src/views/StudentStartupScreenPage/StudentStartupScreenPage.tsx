import { requireTutor } from "@/lib/session";
import { getDiagnosticQuestions, getStartupContent, getStartupOptions } from "@/services/tutorService";
import StudentStartupScreen from "@/components/tutor/StudentStartupScreen";
import Alert from "@/components/ui/Alert";

// Tutors and admins only (the tutor area's layout checks this too).
export default async function StudentStartupScreenPage() {
  await requireTutor();

  try {
    const [options, introContent, questions] = await Promise.all([getStartupOptions(), getStartupContent(), getDiagnosticQuestions()]);
    return <StudentStartupScreen initialOptions={options} introContent={introContent} questions={questions} />;
  } catch (err) {
    return <Alert>Could not load the start-up choices: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
