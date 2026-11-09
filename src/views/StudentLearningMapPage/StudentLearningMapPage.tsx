import { requireStudentStep } from "@/lib/session";
import { getLearningMap, getStudentHome } from "@/services/studentService/studentService.server";
import StudentHome from "@/components/student/StudentHome";
import LearningMap from "@/components/student/LearningMap";
import Alert from "@/components/ui/Alert";

// Step 5: every topic by strand with its status, what to do next, this week's practice and the next live session.
export default async function StudentLearningMapPage() {
  await requireStudentStep("learning-map");
  try {
    const [map, home] = await Promise.all([getLearningMap(), getStudentHome()]);
    return (
      <>
        <StudentHome data={home} />
        <LearningMap data={map} />
      </>
    );
  } catch (err) {
    return <Alert>Could not load your learning map: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
