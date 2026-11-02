import { requireStudent } from "@/lib/session";
import { getMyProfile } from "@/services/profileService/profileService.server";
import ProfileEditor from "@/components/dashboard/ProfileEditor";
import Alert from "@/components/ui/Alert";

// A student's own profile: pictures, details and password.
export default async function StudentProfilePage() {
  await requireStudent();
  try {
    return <ProfileEditor profile={await getMyProfile()} />;
  } catch (err) {
    return <Alert>Could not load your profile: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
