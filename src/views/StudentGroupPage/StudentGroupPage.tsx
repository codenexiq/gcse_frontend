import { requireStudent } from "@/lib/session";
import StudentStepPlaceholder from "@/components/student/StudentStepPlaceholder";

// Step 4. The design has not been sent yet.
export default async function StudentGroupPage() {
  await requireStudent();
  return <StudentStepPlaceholder number={4} title="Your group" />;
}
