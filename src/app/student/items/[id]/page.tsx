import StudentItemPage from "@/views/student/item";

export const metadata = { title: "Learn" };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ enrolment?: string }> }) {
  const [{ id }, { enrolment }] = await Promise.all([params, searchParams]);
  return <StudentItemPage id={id} enrolment={enrolment} />;
}
