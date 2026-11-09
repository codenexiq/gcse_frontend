import { redirect } from "next/navigation";
import { requireStudentStep } from "@/lib/session";
import { getMyGroup, getStudentOptions, getStudentProfile, getStudentResult } from "@/services/studentService/studentService.server";
import StudentGroup from "@/components/student/StudentGroup";
import Alert from "@/components/ui/Alert";

// Step 4: the group a tutor placed the student in. Until then the student stays on the results screen.
export default async function StudentGroupPage() {
  await requireStudentStep("group");
  try {
    const [group, result, profile, options] = await Promise.all([getMyGroup(), getStudentResult(), getStudentProfile(), getStudentOptions()]);
    if (!group) redirect("/student/diagnostic");
    const topics = [...new Set((result?.misconceptions ?? []).map((m) => m.topic))];
    const subject = options.find((o) => o.id === profile?.subjectId)?.label ?? "";
    return <StudentGroup group={group} misconceptionTopics={topics} levelSubject={[profile?.level, subject].filter(Boolean).join(" ") || "your"} />;
  } catch (err) {
    // redirect() works by throwing: let it through
    if (err instanceof Error && "digest" in err) throw err;
    return <Alert>Could not load your group: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
