import TodayPage from "@/views/tutor/today";

export const metadata = { title: "Teacher: Today" };

export default async function Page({ searchParams }: { searchParams: Promise<{ week?: string; log?: string }> }) {
  const { week, log } = await searchParams;
  return <TodayPage week={Math.round(Number(week)) || 0} log={log} />;
}
