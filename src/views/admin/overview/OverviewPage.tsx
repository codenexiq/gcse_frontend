import NeedsAction from "@/components/adm/admin/overview/NeedsAction";
import OverviewKpis from "@/components/adm/admin/overview/OverviewKpis";
import PlansCard from "@/components/adm/admin/overview/PlansCard";
import ReportsToSend from "@/components/adm/admin/overview/ReportsToSend";
import SubjectsCard from "@/components/adm/admin/overview/SubjectsCard";
import TutorsWork from "@/components/adm/admin/overview/TutorsWork";
import { serverFetch } from "@/lib/serverApi";
import type { Lookups, OverviewData } from "@/types/admin";

/** Admin > Overview: the numbers, what needs action, reports to send, and how plans and subjects are split. */
export default async function OverviewPage() {
  const [data, lookups] = await Promise.all([serverFetch<OverviewData>("/admin/overview"), serverFetch<Lookups>("/admin/lookups")]);
  return (
    <>
      <OverviewKpis kpis={data.kpis} />
      <div className="grid2">
        <div className="stack">
          <NeedsAction rows={data.needsAction} lookups={lookups} />
          <ReportsToSend reports={data.reports} />
        </div>
        <div className="stack">
          <PlansCard plans={data.plans} />
          <SubjectsCard subjects={data.subjects} />
          <TutorsWork tutors={data.tutors} />
        </div>
      </div>
    </>
  );
}
