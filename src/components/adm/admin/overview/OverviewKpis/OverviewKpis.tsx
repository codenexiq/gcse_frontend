import Kpi from "@/components/adm/ui/Kpi";
import type { OverviewData } from "@/types/admin";

/** The four number tiles at the top of Overview. */
export default function OverviewKpis({ kpis }: { kpis: OverviewData["kpis"] }) {
  return (
    <div className="kpis">
      <Kpi icon="users" value={kpis.students} label="students" />
      <Kpi icon="book" value={kpis.pathways} label="subject pathways" />
      <Kpi icon="star" value={kpis.tutors} label="tutors" />
      <Kpi icon="calendar" value={kpis.groups} label="groups" />
    </div>
  );
}
