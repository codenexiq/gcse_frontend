import StudentList from "@/components/adm/admin/people/students/StudentList";
import { serverFetch } from "@/lib/serverApi";
import type { Lookups, StudentListItem } from "@/types/admin";

/** Admin > People > Students. */
export default async function StudentsPage() {
  const [students, lookups] = await Promise.all([serverFetch<StudentListItem[]>("/admin/people/students"), serverFetch<Lookups>("/admin/lookups")]);
  return <StudentList students={students} subjects={lookups.subjects} />;
}
