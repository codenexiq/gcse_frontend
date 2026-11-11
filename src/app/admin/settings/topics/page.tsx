import TopicsPage from "@/views/admin/settings/topics";

export const metadata = { title: "Topics" };

export default async function Page({ searchParams }: { searchParams: Promise<{ path?: string }> }) {
  const { path } = await searchParams;
  return <TopicsPage path={path} />;
}
