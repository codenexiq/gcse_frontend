import Kpi from "@/components/adm/ui/Kpi";
import type { TodayData } from "@/types/tutor";

/** Students, sessions this week, sessions to log, unread messages. */
export default function TodayKpis({ kpis }: { kpis: TodayData["kpis"] }) {
  return (
    <div className="kpis">
      <Kpi icon="users" value={kpis.students} label="students" />
      <Kpi icon="calendar" value={kpis.sessionsThisWeek} label="sessions this week" />
      <Kpi icon="edit" value={kpis.toLog} label="to log" />
      <Kpi icon="message" value={kpis.unread} label="unread messages" />
    </div>
  );
}
