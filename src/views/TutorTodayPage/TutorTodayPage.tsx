import { requireTutor } from "@/lib/session";
import { getGroups, getStudents, getWaitingStudents } from "@/services/tutorService";
import TutorToday from "@/components/tutor/TutorToday";
import Alert from "@/components/ui/Alert";

// The tutor's home: the weekly calendar of sessions (book, log, cancel), with the section tabs above it.
export default async function TutorTodayPage() {
  const user = await requireTutor();
  try {
    const [students, groups, waiting] = await Promise.all([getStudents(), getGroups(), getWaitingStudents().catch(() => [])]);
    return <TutorToday name={user.fullName || user.email} students={students} groups={groups} waiting={waiting.length} />;
  } catch (err) {
    return <Alert>Could not load your calendar: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
