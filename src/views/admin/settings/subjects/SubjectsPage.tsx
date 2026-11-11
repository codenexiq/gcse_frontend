import SubjectsPanel from "@/components/adm/admin/settings/subjects/SubjectsPanel";
import { serverFetch } from "@/lib/serverApi";
import type { Lookups, SubjectWithUse } from "@/types/admin";

/** Admin > Settings > Subjects. */
export default async function SubjectsPage() {
  const [subjects, lookups] = await Promise.all([serverFetch<SubjectWithUse[]>("/admin/settings/subjects"), serverFetch<Lookups>("/admin/lookups")]);
  return <SubjectsPanel initial={subjects} levels={lookups.levels} />;
}
