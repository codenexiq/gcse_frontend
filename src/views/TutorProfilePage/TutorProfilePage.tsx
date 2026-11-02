import { requireTutor } from "@/lib/session";
import { getMyProfile } from "@/services/profileService/profileService.server";
import ProfileEditor from "@/components/dashboard/ProfileEditor";
import Alert from "@/components/ui/Alert";

// A tutor's or admin's own profile: pictures, details and password.
export default async function TutorProfilePage() {
  await requireTutor();
  try {
    return <ProfileEditor profile={await getMyProfile()} />;
  } catch (err) {
    return <Alert>Could not load your profile: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
