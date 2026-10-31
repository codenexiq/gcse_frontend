import { requireTutor } from "@/lib/session";
import TutorWork from "@/components/tutor/TutorWork";

// Tutors and admins only. Each screen built for "Tutor Work" gets its own subfolder under
// app/tutor/dashboard/tutor-work/, views/ and components/tutor/.
export default async function TutorWorkPage() {
  await requireTutor();
  return <TutorWork />;
}
