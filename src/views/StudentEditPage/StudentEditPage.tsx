import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { getStudentProfile } from "@/services/tutorService";
import StudentProfileEditor from "@/components/tutor/StudentProfileEditor";
import Alert from "@/components/ui/Alert";

// Tutors and admins: manage one student's profile.
export default async function StudentEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTutor();
  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId) || studentId <= 0) notFound();

  try {
    return <StudentProfileEditor key={studentId} student={await getStudentProfile(studentId)} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <Alert>Could not load this student: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
