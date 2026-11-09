import { requireTutor } from "@/lib/session";
import { getGroups, getRouteLibrary, getRoutes, getStudents, getWaitingStudents } from "@/services/tutorService";
import RouteBuilder from "@/components/tutor/RouteBuilder";
import ContentSwitch from "@/components/tutor/ContentSwitch";
import TeacherHeader from "@/components/tutor/TeacherHeader";
import Alert from "@/components/ui/Alert";
import FlowScope from "@/components/ui/FlowScope";

// Tutors and admins: build learning routes (ordered lessons and quizzes with a week each) and give them to students, under the Content tab.
export default async function RoutesPage() {
  const user = await requireTutor();
  try {
    const [routes, library, students, groups, waiting] = await Promise.all([getRoutes(), getRouteLibrary(), getStudents(), getGroups().catch(() => []), getWaitingStudents().catch(() => [])]);
    return (
      <FlowScope>
        <TeacherHeader name={user.fullName || user.email} students={students.length} groups={groups.length} waiting={waiting.length} active="content" />
        <ContentSwitch active="routes" />
        <RouteBuilder routes={routes} library={library} students={students} />
      </FlowScope>
    );
  } catch (err) {
    return <Alert>Could not load the learning routes: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
