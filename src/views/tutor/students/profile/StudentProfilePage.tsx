import { notFound } from "next/navigation";
import StudentProfile from "@/components/adm/tutor/students/StudentProfile";
import { ApiError } from "@/lib/api";
import { serverFetch } from "@/lib/serverApi";
import type { StudentProfileData } from "@/types/tutor";

/** Teacher > Students > one student's subject. */
export default async function StudentProfilePage({ id }: { id: string }) {
  try {
    const data = await serverFetch<StudentProfileData>(`/tutor/students/${encodeURIComponent(id)}`);
    return <StudentProfile key={data.enrolment.id} initial={data} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}
