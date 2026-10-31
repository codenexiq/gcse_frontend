import type { Role, User } from "@/types";

/** Can this user open the tutor area? (tutors and admins) */
export const canUseTutorArea = (user: Pick<User, "role">) => user.role === "tutor" || user.role === "admin";

/** Where each kind of user lands after signing in. Students always start on the "About you" screen. */
export const homePathFor = (role: Role) => (role === "student" ? "/student/about-you" : "/tutor/dashboard");

/** A friendly name for the role, e.g. in headings. */
export const roleLabel = (role: Role) =>
  role === "admin" ? "Administrator" : role === "tutor" ? "Tutor" : "Student";
