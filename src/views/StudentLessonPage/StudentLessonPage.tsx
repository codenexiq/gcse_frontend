import { notFound } from "next/navigation";
import { requireStudentStep } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { getStudentLesson } from "@/services/studentService/studentService.server";
import LessonPlayer from "@/components/lessons/LessonPlayer";
import Alert from "@/components/ui/Alert";

// A published lesson, played one block at a time. The server marks the answers.
export default async function StudentLessonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStudentStep("learning-map");
  const { id } = await params;
  const lessonId = Number(id);
  if (!Number.isInteger(lessonId) || lessonId <= 0) notFound();
  try {
    return <LessonPlayer lesson={await getStudentLesson(lessonId)} closeHref="/student/learning-map" closeLabel="Back to my learning map" />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <Alert>Could not load this lesson: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
