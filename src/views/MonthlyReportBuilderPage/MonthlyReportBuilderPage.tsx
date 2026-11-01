import { requireTutor } from "@/lib/session";
import { getStudents } from "@/services/tutorService";
import MonthlyReportBuilder from "@/components/tutor/MonthlyReportBuilder";
import Alert from "@/components/ui/Alert";

// Tutors and admins only: write a new report. Saving it sends it to the student.
export default async function MonthlyReportBuilderPage() {
  await requireTutor();
  try {
    return <MonthlyReportBuilder students={await getStudents()} />;
  } catch (err) {
    return <Alert>Could not load the students: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
