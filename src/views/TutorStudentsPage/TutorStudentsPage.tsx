import { getStudents } from "@/services/tutorService";
import { requireTutor } from "@/lib/session";
import StudentDirectory from "@/components/tutor/StudentDirectory";
import StudentStartupAction from "@/components/tutor/StudentStartupAction";
import Alert from "@/components/ui/Alert";

export default async function TutorStudentsPage() {
  await requireTutor();

  try {
    return (
      <>
        <StudentStartupAction />
        <StudentDirectory students={await getStudents()} />
      </>
    );
  } catch (err) {
    return <Alert>Could not load students: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
