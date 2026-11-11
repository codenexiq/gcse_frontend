import StudentProfilePage from "@/views/admin/people/students/profile";

export const metadata = { title: "Student" };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <StudentProfilePage id={id} isNew={query.new === "1"} />;
}
