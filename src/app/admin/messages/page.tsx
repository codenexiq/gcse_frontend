import MessagesPage from "@/views/admin/messages";

export const metadata = { title: "Messages" };

export default async function Page({ searchParams }: { searchParams: Promise<{ thread?: string }> }) {
  const { thread } = await searchParams;
  return <MessagesPage thread={thread} />;
}
