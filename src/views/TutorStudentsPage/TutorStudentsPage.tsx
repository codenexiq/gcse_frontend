import { getGroups, getStudents, getWaitingStudents } from "@/services/tutorService";
import { requireTutor } from "@/lib/session";
import StudentDirectory from "@/components/tutor/StudentDirectory";
import TeacherHeader from "@/components/tutor/TeacherHeader";
import Alert from "@/components/ui/Alert";
import FlowScope from "@/components/ui/FlowScope";

// Tutors and admins can see the students, add them and edit their profiles. Only admins can delete them. The four teacher tabs show above the table.
export default async function TutorStudentsPage() {
  const user = await requireTutor();

  try {
    const [students, groups, waiting] = await Promise.all([getStudents(), getGroups().catch(() => []), getWaitingStudents().catch(() => [])]);
    return (
      <FlowScope>
        <TeacherHeader name={user.fullName || user.email} students={students.length} groups={groups.length} waiting={waiting.length} active="students" />
        <StudentDirectory students={students} canManage canDelete={user.role === "admin"} />
      </FlowScope>
    );
  } catch (err) {
    return <Alert>Could not load students: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
