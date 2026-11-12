import { notFound, redirect } from "next/navigation";
import Diagnostic from "@/components/adm/student/diagnostic/Diagnostic";
import { ApiError } from "@/lib/api";
import { serverFetch } from "@/lib/serverApi";
import type { DiagnosticData, StudentHomeData } from "@/types/student";

/** Student > the first-time diagnostic for one subject. */
export default async function StudentDiagnosticPage({ id }: { id: string }) {
  if (!/^\d+$/.test(id)) notFound();
  try {
    const [data, home] = await Promise.all([serverFetch<DiagnosticData>(`/student/enrolments/${id}/diagnostic`), serverFetch<StudentHomeData>(`/student/home?enrolment=${id}`)]);
    if (data.done) redirect(`/student?enrolment=${id}`);
    return <Diagnostic data={data} plan={home.student.plan} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}
