import StudentMessagesPage from "@/views/student/messages";

export const metadata = { title: "Messages" };

export default async function Page({ searchParams }: { searchParams: Promise<{ thread?: string }> }) {
  const { thread } = await searchParams;
  return <StudentMessagesPage thread={thread} />;
}
