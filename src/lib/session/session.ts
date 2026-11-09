import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { serverFetch } from "../serverApi";
import { homePathFor } from "../roles";
import { canOpen, nextStepHref, type StudentStepKey } from "../studentSteps";
import type { AuthResponse, StudentProgress, User } from "@/types";

/** The logged-in user, verified by the backend - or null. Runs once per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const hasCookie = (await cookies()).has("gcse_session");
  if (!hasCookie) return null;
  try {
    return (await serverFetch<AuthResponse>("/auth/me")).user;
  } catch {
    return null; // expired / invalid session, or backend down
  }
});

/** Use at the top of a protected page: sends visitors who are not logged in to /login. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** For the student dashboard: tutor are sent to their own area instead. */
export async function requireStudent(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "student") redirect(homePathFor(user.role));
  return user;
}

/**
 * For a student step page: a student who has not finished the steps before this one is sent to the step they should be on.
 * Returns the student so the page does not need to ask again.
 */
export async function requireStudentStep(key: StudentStepKey): Promise<User> {
  const user = await requireStudent();
  let progress: StudentProgress;
  try {
    progress = await serverFetch<StudentProgress>("/student/progress");
  } catch {
    return user; // if the progress can not be read, show the page (it reports its own errors) rather than lock the student out
  }
  if (!canOpen(key, progress)) redirect(nextStepHref(progress));
  return user;
}

/**
 * For the tutor area.
 *  - Signed out (a visitor, an expired session, or the Back button after Log out): sent to the HOME page.
 *    Never to the tutor sign-in - that would tell a stranger where it is. (redirect() replaces the
 *    history entry, so the Back button does not get stuck.)
 *  - A student: "page not found", so the tutor area looks like it does not exist for them.
 */
export async function requireTutor(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role === "student") notFound();
  return user;
}

/** For admin-only pages: tutors go back to the tutor overview. */
export async function requireAdmin(): Promise<User> {
  const user = await requireTutor();
  if (user.role !== "admin") redirect("/tutor/dashboard");
  return user;
}
