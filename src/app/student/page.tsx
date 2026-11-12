import StudentHomePage from "@/views/student/home";

export const metadata = { title: "My learning" };

export default async function Page({ searchParams }: { searchParams: Promise<{ enrolment?: string }> }) {
  const { enrolment } = await searchParams;
  return <StudentHomePage enrolment={enrolment} />;
}
