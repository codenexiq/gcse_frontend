import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { getGroups, getRoutes, getStudentOverview, getStudents, getWaitingStudents } from "@/services/tutorService";
import StudentOverview from "@/components/tutor/StudentOverview";
import TeacherHeader from "@/components/tutor/TeacherHeader";
import Alert from "@/components/ui/Alert";
import FlowScope from "@/components/ui/FlowScope";

// Tutors and admins: one student's page, opened from their name on the Students list.
export default async function StudentOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireTutor();
  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId) || studentId <= 0) notFound();
  try {
    const [data, students, groups, waiting, routes] = await Promise.all([getStudentOverview(studentId), getStudents(), getGroups().catch(() => []), getWaitingStudents().catch(() => []), getRoutes().catch(() => [])]);
    return (
      <FlowScope>
        <TeacherHeader name={user.fullName || user.email} students={students.length} groups={groups.length} waiting={waiting.length} active="students" />
        <StudentOverview data={data} allRoutes={routes.map((r) => ({ id: r.id, name: r.name }))} />
      </FlowScope>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <Alert>Could not load this student: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
