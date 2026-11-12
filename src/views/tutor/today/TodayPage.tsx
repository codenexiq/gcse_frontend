import BookSession from "@/components/adm/tutor/today/BookSession";
import LogForm from "@/components/adm/tutor/today/LogForm";
import PendingLogs from "@/components/adm/tutor/today/PendingLogs";
import TodayCard from "@/components/adm/tutor/today/TodayCard";
import TodayKpis from "@/components/adm/tutor/today/TodayKpis";
import WeekCalendar from "@/components/adm/tutor/today/WeekCalendar";
import { ApiError } from "@/lib/api";
import { serverFetch } from "@/lib/serverApi";
import type { LogFormData, TodayData } from "@/types/tutor";

/** Teacher > Today: the log form (when a session is being logged), numbers, today's sessions, booking, and the week. */
export default async function TodayPage({ week, log }: { week: number; log?: string }) {
  const data = await serverFetch<TodayData>(`/tutor/today?week=${week}`);
  let form: LogFormData | null = null;
  if (log) {
    try {
      form = await serverFetch<LogFormData>(`/tutor/today/logs/${encodeURIComponent(log)}/form`);
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    }
  }
  return (
    <>
      {form && <LogForm key={form.session.id} form={form} />}
      <TodayKpis kpis={data.kpis} />
      <div className="grid2">
        <div className="stack">
          <PendingLogs sessions={data.pending} />
          <TodayCard sessions={data.today} />
        </div>
        <BookSession options={data.bookOptions} />
      </div>
      <WeekCalendar days={data.days} weekStart={data.weekStart} week={week} />
    </>
  );
}
