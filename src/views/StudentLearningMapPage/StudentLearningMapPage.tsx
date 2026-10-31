import { requireStudent } from "@/lib/session";
import StudentStepPlaceholder from "@/components/student/StudentStepPlaceholder";

// Step 5. The design has not been sent yet.
export default async function StudentLearningMapPage() {
  await requireStudent();
  return <StudentStepPlaceholder number={5} title="Learning map" />;
}
