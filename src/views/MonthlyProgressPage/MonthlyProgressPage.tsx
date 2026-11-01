import { requireTutor } from "@/lib/session";
import { getAllMonthlyReports } from "@/services/monthlyReportService/monthlyReportService.server";
import MonthlyReportAction from "@/components/tutor/MonthlyReportAction";
import MonthlyReportTable from "@/components/tutor/MonthlyReportTable";
import Alert from "@/components/ui/Alert";

// Tutors and admins only: the builder button, then the table of every report created so far.
export default async function MonthlyProgressPage() {
  await requireTutor();
  try {
    return (
      <>
        <MonthlyReportAction />
        <MonthlyReportTable reports={await getAllMonthlyReports()} />
      </>
    );
  } catch (err) {
    return <Alert>Could not load the reports: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
