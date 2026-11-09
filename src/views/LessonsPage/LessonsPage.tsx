import { requireTutor } from "@/lib/session";
import { getGroups, getLessonOverview, getLessonsForTopic, getStudents, getWaitingStudents } from "@/services/tutorService";
import LessonBuilder from "@/components/tutor/LessonBuilder";
import ContentSwitch from "@/components/tutor/ContentSwitch";
import TeacherHeader from "@/components/tutor/TeacherHeader";
import Alert from "@/components/ui/Alert";
import FlowScope from "@/components/ui/FlowScope";

// Tutors and admins: build the lessons that show on the students' learning maps, under the Content tab.
export default async function LessonsPage({ searchParams }: { searchParams?: Promise<{ topic?: string; lesson?: string }> }) {
  const user = await requireTutor();
  try {
    const query = (await searchParams) ?? {};
    const [strands, students, groups, waiting] = await Promise.all([getLessonOverview(), getStudents(), getGroups().catch(() => []), getWaitingStudents().catch(() => [])]);
    const names = strands.flatMap((s) => s.topics.map((t) => t.name));
    const topic = query.topic && names.includes(query.topic) ? query.topic : (names[0] ?? "");
    const lessons = topic ? await getLessonsForTopic(topic) : [];
    const lesson = Number(query.lesson);
    return (
      <FlowScope>
        <TeacherHeader name={user.fullName || user.email} students={students.length} groups={groups.length} waiting={waiting.length} active="content" />
        <ContentSwitch active="library" />
        <LessonBuilder strands={strands} topic={topic} lessons={lessons} lessonId={Number.isInteger(lesson) && lesson > 0 ? lesson : null} />
      </FlowScope>
    );
  } catch (err) {
    return <Alert>Could not load the lessons: {err instanceof Error ? err.message : "Unknown error"}</Alert>;
  }
}
