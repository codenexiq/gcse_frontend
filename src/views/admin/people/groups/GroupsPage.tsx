import GroupsPanel from "@/components/adm/admin/people/groups/GroupsPanel";
import { serverFetch } from "@/lib/serverApi";
import type { Group, Lookups } from "@/types/admin";

/** Admin > People > Groups. */
export default async function GroupsPage() {
  const [groups, lookups] = await Promise.all([serverFetch<Group[]>("/admin/people/groups"), serverFetch<Lookups>("/admin/lookups")]);
  return <GroupsPanel initial={groups} lookups={lookups} />;
}
