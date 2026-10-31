import { redirect } from "next/navigation";

// /student on its own opens the first step.
export default function StudentIndex() {
  redirect("/student/about-you");
}
