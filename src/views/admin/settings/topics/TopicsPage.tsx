import TopicsEditor from "@/components/adm/admin/settings/topics/TopicsEditor";
import Empty from "@/components/adm/ui/Empty";
import { serverFetch } from "@/lib/serverApi";
import type { Lookups, Pathway, TopicsData } from "@/types/admin";

/** Admin > Settings > Topics: the pathway in the address (?path=maths|gcse), or the first one. */
export default async function TopicsPage({ path }: { path?: string }) {
  const [pathways, lookups] = await Promise.all([serverFetch<Pathway[]>("/admin/settings/topics/paths"), serverFetch<Lookups>("/admin/lookups")]);
  if (pathways.length === 0) return <Empty title="No pathways" text="Add a subject and tick a level first." />;
  const current = pathways.find((p) => p.key === path) ?? pathways[0];
  const data = await serverFetch<TopicsData>(`/admin/settings/topics/${encodeURIComponent(current.subjectId)}/${encodeURIComponent(current.levelId)}`);
  // The key makes the editor start again from fresh data when another pathway is chosen.
  return <TopicsEditor key={current.key} pathways={pathways} current={current} initial={data} subjects={lookups.subjects} />;
}
