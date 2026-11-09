import { requireTutor } from "@/lib/session";
import StudentStartupAction from "@/components/tutor/StudentStartupAction";
import TutorAccountsAction from "@/components/tutor/TutorAccountsAction";

// Tutors and admins: the settings of the workspace. The way into the Student Start-up Screen; administrators also get the Tutor accounts page.
export default async function TutorSettingsPage() {
  const user = await requireTutor();
  return (
    <>
      <StudentStartupAction />
      {user.role === "admin" && <TutorAccountsAction />}
    </>
  );
}
