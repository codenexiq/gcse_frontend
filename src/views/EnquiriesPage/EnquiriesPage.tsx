import { requireAdmin } from "@/lib/session";
import { getEnquiries } from "@/services/siteService/siteService.server";
import EnquiriesInbox from "@/components/tutor/EnquiriesInbox";
import Alert from "@/components/ui/Alert";

// Admins only: the messages people send from the website's contact form.
export default async function EnquiriesPage() {
  await requireAdmin();

  try {
    return <EnquiriesInbox enquiries={await getEnquiries()} />;
  } catch (err) {
    return <Alert>Could not load the enquiries: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
