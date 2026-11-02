import { requireTutor } from "@/lib/session";
import { getLessonLogs } from "@/services/lessonLogService/lessonLogService.server";
import LessonLogAction from "@/components/tutor/LessonLogAction";
import LessonLogTable from "@/components/tutor/LessonLogTable";
import Alert from "@/components/ui/Alert";

// Tutors and admins only: the button for a new entry, then the log. A tutor sees their own entries; an admin sees everybody's.
export default async function LessonLogPage() {
  const user = await requireTutor();
  try {
    return (
      <>
        <LessonLogAction />
        <LessonLogTable entries={await getLessonLogs()} isAdmin={user.role === "admin"} />
      </>
    );
  } catch (err) {
    return <Alert>Could not load the lesson log: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
