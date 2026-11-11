import TutorsPanel from "@/components/adm/admin/people/tutors/TutorsPanel";
import { serverFetch } from "@/lib/serverApi";
import type { Lookups, Tutor } from "@/types/admin";

/** Admin > People > Tutors. */
export default async function TutorsPage() {
  const [tutors, lookups] = await Promise.all([serverFetch<Tutor[]>("/admin/people/tutors"), serverFetch<Lookups>("/admin/lookups")]);
  return <TutorsPanel initial={tutors} subjects={lookups.subjects} />;
}
