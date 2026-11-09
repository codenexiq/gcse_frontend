import { requireTutor } from "@/lib/session";
import { getDiagnosticTopics, getGroups } from "@/services/tutorService";
import FlowScope from "@/components/ui/FlowScope";
import GroupsManager from "@/components/tutor/GroupsManager";
import Alert from "@/components/ui/Alert";

// Tutors and admins: the weekly live groups.
export default async function GroupsPage() {
  await requireTutor();
  try {
    const [groups, topics] = await Promise.all([getGroups(), getDiagnosticTopics().catch(() => [])]);
    return (
      <FlowScope>
        <GroupsManager groups={groups} topics={topics.map((t) => t.topic)} />
      </FlowScope>
    );
  } catch (err) {
    return <Alert>Could not load the groups: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
