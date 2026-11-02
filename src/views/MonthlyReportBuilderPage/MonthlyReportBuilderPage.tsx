import { requireTutor } from "@/lib/session";
import { getStudents } from "@/services/tutorService";
import MonthlyReportBuilder from "@/components/tutor/MonthlyReportBuilder";
import Alert from "@/components/ui/Alert";

// Tutors and admins only: write a new report. Saving it sends it to the student.
export default async function MonthlyReportBuilderPage({ searchParams }: { searchParams: Promise<{ student?: string }> }) {
  await requireTutor();
  // /new?student=12 opens the form with that student already chosen.
  const chosen = Number((await searchParams).student);
  try {
    return <MonthlyReportBuilder students={await getStudents()} initialStudentId={Number.isInteger(chosen) && chosen > 0 ? chosen : undefined} />;
  } catch (err) {
    return <Alert>Could not load the students: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
