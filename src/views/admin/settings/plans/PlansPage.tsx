import PlansPanel from "@/components/adm/admin/settings/plans/PlansPanel";
import { serverFetch } from "@/lib/serverApi";
import type { Lookups, Plan } from "@/types/admin";

/** Admin > Settings > Plans. */
export default async function PlansPage() {
  const [plans, lookups] = await Promise.all([serverFetch<Plan[]>("/admin/settings/plans"), serverFetch<Lookups>("/admin/lookups")]);
  return <PlansPanel plans={plans} levels={lookups.levels} />;
}
