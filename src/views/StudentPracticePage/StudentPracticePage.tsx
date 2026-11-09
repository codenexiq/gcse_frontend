import { notFound } from "next/navigation";
import { requireStudentStep } from "@/lib/session";
import { ApiError } from "@/lib/api";
import { getPracticeSet } from "@/services/studentService/studentService.server";
import LessonPlayer from "@/components/lessons/LessonPlayer";
import Alert from "@/components/ui/Alert";

// A fresh practice set on one topic, made for this student after a lesson score below 70%.
export default async function StudentPracticePage({ params }: { params: Promise<{ id: string }> }) {
  await requireStudentStep("learning-map");
  const { id } = await params;
  const setId = Number(id);
  if (!Number.isInteger(setId) || setId <= 0) notFound();
  try {
    return <LessonPlayer lesson={await getPracticeSet(setId)} practice closeHref="/student/learning-map" closeLabel="Back to my learning map" />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <Alert>Could not load this practice set: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
