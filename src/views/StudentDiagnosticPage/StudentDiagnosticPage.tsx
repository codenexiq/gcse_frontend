import Link from "next/link";
import { requireStudent } from "@/lib/session";
import { getStudentContent, getStudentDiagnostic, getStudentOptions, getStudentProfile, getStudentResult } from "@/services/studentService/studentService.server";
import StudentDiagnostic from "@/components/student/StudentDiagnostic";
import Alert from "@/components/ui/Alert";

export default async function StudentDiagnosticPage() {
  const user = await requireStudent();
  const firstName = (user.fullName ?? "").trim().split(/\s+/)[0] || user.email.split("@")[0];

  try {
    const profile = await getStudentProfile();
    if (!profile || !profile.subjectId) {
      return (
        <p>
          Please complete <Link href="/student/about-you">About you</Link> first, so we can pick the right diagnostic.
        </p>
      );
    }
    const [content, options, questions, latest] = await Promise.all([getStudentContent(), getStudentOptions(), getStudentDiagnostic(), getStudentResult()]);
    const subject = options.find((o) => o.id === profile.subjectId)?.label ?? "";
    return <StudentDiagnostic content={content} level={profile.level} subject={subject} tier={profile.tier} questions={questions} name={firstName} latest={latest} />;
  } catch (err) {
    return <Alert>Could not load the diagnostic: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
