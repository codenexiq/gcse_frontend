import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/session";
import { nextStepHref } from "@/lib/studentSteps";
import { getStudentProgress } from "@/services/studentService/studentService.server";

// Sends a student to the first step they have not finished (new account: About you; diagnostic handed in: the results).
export default async function StudentIndexPage() {
  await requireStudent();
  let href = "/student/about-you";
  try {
    href = nextStepHref(await getStudentProgress());
  } catch {
    // if the progress can not be read, start at the first step
  }
  redirect(href);
}
