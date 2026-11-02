import { requireTutor } from "@/lib/session";
import StudentProfileEditor from "@/components/tutor/StudentProfileEditor";

// Tutors and admins: add a new student (the "Add New User" screen).
export default async function StudentCreatePage() {
  await requireTutor();
  return <StudentProfileEditor student={null} />;
}
