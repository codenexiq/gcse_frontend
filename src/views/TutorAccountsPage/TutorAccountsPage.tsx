import { getTutorAccounts } from "@/services/tutorService";
import { requireAdmin } from "@/lib/session";
import TutorAccountsTable from "@/components/tutor/TutorAccountsTable";
import Alert from "@/components/ui/Alert";

// Admins only: tutors who open this address are sent back to the tutor overview.
export default async function TutorAccountsPage() {
  await requireAdmin();

  try {
    return <TutorAccountsTable accounts={await getTutorAccounts()} />;
  } catch (err) {
    return <Alert>Could not load tutor accounts: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
