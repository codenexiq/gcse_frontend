import StudentProfilePage from "@/views/tutor/students/profile";

export const metadata = { title: "Teacher: Student" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentProfilePage id={id} />;
}
