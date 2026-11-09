import { notFound } from "next/navigation";
import { requireTutor } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { getTutorLesson } from "@/services/tutorService";
import LessonPlayer from "@/components/lessons/LessonPlayer";
import Alert from "@/components/ui/Alert";
import FlowScope from "@/components/ui/FlowScope";

// Tutors and admins: try a lesson as a student sees it. Nothing is saved.
export default async function LessonPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTutor();
  const { id } = await params;
  const lessonId = Number(id);
  if (!Number.isInteger(lessonId) || lessonId <= 0) notFound();
  try {
    const lesson = await getTutorLesson(lessonId);
    return (
      <FlowScope>
        <LessonPlayer lesson={lesson} preview closeHref={`/tutor/dashboard/lessons?topic=${encodeURIComponent(lesson.topic)}&lesson=${lesson.id}`} closeLabel="Back to the lesson" />
      </FlowScope>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <Alert>Could not load this lesson: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
