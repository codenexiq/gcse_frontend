import { requireStudent } from "@/lib/session";
import { getStudentOptions, getStudentProfile } from "@/services/studentService/studentService.server";
import StudentAboutYou from "@/components/student/StudentAboutYou";
import Alert from "@/components/ui/Alert";

// The first screen after registering or logging in.
export default async function StudentAboutYouPage() {
  const user = await requireStudent();
  const firstName = (user.fullName ?? "").trim().split(/\s+/)[0] || user.email.split("@")[0];

  try {
    const [options, profile] = await Promise.all([getStudentOptions(), getStudentProfile()]);
    return <StudentAboutYou name={firstName} options={options} profile={profile} />;
  } catch (err) {
    return <Alert>Could not load this screen: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
