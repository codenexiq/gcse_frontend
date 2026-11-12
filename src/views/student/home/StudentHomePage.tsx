import StudentHome from "@/components/adm/student/home/StudentHome";
import Empty from "@/components/adm/ui/Empty";
import { serverFetch } from "@/lib/serverApi";
import type { StudentHomeData } from "@/types/student";

/** Student > My learning: the chosen subject's tasks, live lessons, progress and learning map. */
export default async function StudentHomePage({ enrolment }: { enrolment?: string }) {
  const q = enrolment && /^\d+$/.test(enrolment) ? `?enrolment=${enrolment}` : "";
  const data = await serverFetch<StudentHomeData>(`/student/home${q}`);
  if (!data.current) return <Empty title="No subjects yet" text="Ask the Educate Cloud team to add a subject to your account." />;
  return <StudentHome data={data} current={data.current} />;
}
