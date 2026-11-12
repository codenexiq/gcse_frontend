import ContentPage from "@/views/tutor/content";

export const metadata = { title: "Teacher: Content" };

export default async function Page({ searchParams }: { searchParams: Promise<{ path?: string; view?: string; item?: string; route?: string }> }) {
  const params = await searchParams;
  return <ContentPage {...params} />;
}
