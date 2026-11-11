import { notFound } from "next/navigation";
import StudentProfile from "@/components/adm/admin/people/students/StudentProfile";
import { ApiError } from "@/lib/api";
import { serverFetch } from "@/lib/serverApi";
import type { Lookups, StudentDetail } from "@/types/admin";

/** Admin > People > Students > one student. */
export default async function StudentProfilePage({ id, isNew }: { id: string; isNew: boolean }) {
  try {
    const [student, lookups] = await Promise.all([serverFetch<StudentDetail>(`/admin/people/students/${encodeURIComponent(id)}`), serverFetch<Lookups>("/admin/lookups")]);
    // The key makes the profile start again from fresh data when the page is opened for a different student.
    return <StudentProfile key={student.id} initial={student} lookups={lookups} isNew={isNew} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}
