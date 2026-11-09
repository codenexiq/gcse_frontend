import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { getGroups, getStudentReview } from "@/services/tutorService";
import StudentReview from "@/components/tutor/StudentReview";
import Alert from "@/components/ui/Alert";

// Tutors and admins: one student's About you answers and diagnostic results, to decide where to place them.
export default async function StudentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTutor();
  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId) || studentId <= 0) notFound();
  try {
    const [data, groups] = await Promise.all([getStudentReview(studentId), getGroups()]);
    return <StudentReview data={data} groups={groups} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <Alert>Could not load this student: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
