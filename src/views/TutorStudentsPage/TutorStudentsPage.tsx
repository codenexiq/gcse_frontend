import { getStudents } from "@/services/tutorService";
import { requireTutor } from "@/lib/session";
import StudentDirectory from "@/components/tutor/StudentDirectory";
import StudentStartupAction from "@/components/tutor/StudentStartupAction";
import Alert from "@/components/ui/Alert";

// Tutors and admins can see the students, add them and edit their profiles. Only admins can delete them.
export default async function TutorStudentsPage() {
  const user = await requireTutor();

  try {
    return (
      <>
        <StudentStartupAction />
        <StudentDirectory students={await getStudents()} canManage canDelete={user.role === "admin"} />
      </>
    );
  } catch (err) {
    return <Alert>Could not load students: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
