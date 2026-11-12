import StudentTopicPage from "@/views/student/topic";

export const metadata = { title: "Topic" };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ enrolment?: string }> }) {
  const [{ id }, { enrolment }] = await Promise.all([params, searchParams]);
  return <StudentTopicPage id={id} enrolment={enrolment} />;
}
