import MyStudents from "@/components/adm/tutor/students/MyStudents";
import { serverFetch } from "@/lib/serverApi";
import type { MyStudents as MyStudentsData } from "@/types/tutor";

/** Teacher > Students. */
export default async function StudentsPage() {
  return <MyStudents data={await serverFetch<MyStudentsData>("/tutor/students")} />;
}
