import { requireTutor } from "@/lib/session";
import LessonLogForm from "@/components/tutor/LessonLogForm";

// Tutors and admins only: the attendance and feedback form, filled in after each lesson.
export default async function LessonLogNewPage() {
  const user = await requireTutor();
  return <LessonLogForm email={user.email} accountName={user.fullName?.trim() || user.email.split("@")[0]} />;
}
