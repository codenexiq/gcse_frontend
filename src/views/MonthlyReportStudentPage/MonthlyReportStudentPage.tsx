import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/session";
import { getAllMonthlyReports } from "@/services/monthlyReportService/monthlyReportService.server";
import { getStudents } from "@/services/tutorService";
import MonthlyReportStudent from "@/components/tutor/MonthlyReportStudent";
import Alert from "@/components/ui/Alert";

// Tutors and admins only: every month's report for one student (an empty list if there is none yet).
export default async function MonthlyReportStudentPage({ params }: { params: Promise<{ studentId: string }> }) {
  await requireTutor();
  const { studentId } = await params;
  const id = Number(studentId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let students;
  let all;
  try {
    [students, all] = await Promise.all([getStudents(), getAllMonthlyReports()]);
  } catch (err) {
    return <Alert>Could not load the reports: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
  const student = students.find((s) => s.id === id);
  if (!student) notFound();
  return <MonthlyReportStudent student={student} reports={all.filter((r) => r.student_id === id)} />;
}
