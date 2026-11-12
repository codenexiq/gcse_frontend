import type { Role, User } from "@/types";

/** Can this user open the tutor area? (tutors and admins) */
export const canUseTutorArea = (user: Pick<User, "role">) => user.role === "tutor" || user.role === "admin";

/** Where each kind of user lands after signing in. Students go to /student, which opens the first step they have not finished. */
export const homePathFor = (role: Role) => (role === "student" ? "/student" : role === "admin" ? "/admin" : "/tutor");

/** A friendly name for the role, e.g. in headings. */
export const roleLabel = (role: Role) =>
  role === "admin" ? "Administrator" : role === "tutor" ? "Tutor" : "Student";
