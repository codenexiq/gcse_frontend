import StudentPracticePage from "@/views/student/practice";

export const metadata = { title: "Practice" };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ enrolment?: string }> }) {
  const [{ id }, { enrolment }] = await Promise.all([params, searchParams]);
  return <StudentPracticePage id={id} enrolment={enrolment} />;
}
