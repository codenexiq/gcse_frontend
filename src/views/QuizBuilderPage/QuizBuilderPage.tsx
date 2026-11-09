import { requireTutor } from "@/lib/session";
import QuizBuilder from "@/components/tutor/QuizBuilder";

// Tutors and admins: make a quiz by hand, with diagrams.
export default async function QuizBuilderPage() {
  await requireTutor();
  return <QuizBuilder />;
}
