import type { StudentProgress } from "@/types";

/** Step 1 is signing up: it is always finished once a student is on these screens. It is shown in the bar but is not a link. */
export const SIGN_UP_LABEL = "Sign up";

/** The student steps, in order (step 1, Sign up, comes before them). */
export const STUDENT_STEPS = [
  { key: "about-you", number: 2, label: "About you", href: "/student/about-you" },
  { key: "diagnostic", number: 3, label: "Diagnostic", href: "/student/diagnostic" },
  { key: "group", number: 4, label: "Your group", href: "/student/group" },
  { key: "learning-map", number: 5, label: "Learning map", href: "/student/learning-map" },
] as const;

export type StudentStepKey = (typeof STUDENT_STEPS)[number]["key"];

/** Has the student finished this step? */
export function isDone(key: StudentStepKey, p: StudentProgress): boolean {
  if (key === "about-you") return p.aboutYou;
  if (key === "diagnostic") return p.diagnostic;
  if (key === "group") return p.group;
  return false;
}

/** Can the student open this step yet? A step opens once the one before it is finished. */
export function canOpen(key: StudentStepKey, p: StudentProgress): boolean {
  if (key === "about-you") return true;
  if (key === "diagnostic") return p.aboutYou;
  // Your group and the Learning map open once a tutor has placed the student in a group.
  return p.group;
}

/** Where a student should be: the first step that is not finished (the diagnostic screen is also where the results are shown). */
export function nextStepHref(p: StudentProgress): string {
  if (!p.aboutYou) return "/student/about-you";
  // Diagnostic handed in but not placed yet: the results screen (it says a tutor is reviewing).
  if (!p.group) return "/student/diagnostic";
  return "/student/group";
}
