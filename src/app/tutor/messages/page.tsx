import MessagesPage from "@/views/tutor/messages";

export const metadata = { title: "Teacher: Messages" };

export default async function Page({ searchParams }: { searchParams: Promise<{ thread?: string }> }) {
  const { thread } = await searchParams;
  return <MessagesPage thread={thread} />;
}
