import { requireTutor } from "@/lib/session";
import MonthlyReportBuilder from "@/components/tutor/MonthlyReportBuilder";

// Tutors and admins only.
export default async function MonthlyProgressPage() {
  await requireTutor();
  return <MonthlyReportBuilder />;
}
