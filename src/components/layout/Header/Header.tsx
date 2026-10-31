import TopNavigation, { type NavigationItem } from "@/components/navigation/TopNavigation";
import UserMenu from "@/components/navigation/UserMenu";
import Button from "@/components/ui/Button";
import type { User } from "@/types";

// Only pages that exist are listed here.
const loggedOutItems: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "Subjects", href: "/#subjects" },
  { label: "Features", href: "/#features" },
  { label: "Sign up", href: "/register" },
];
const loggedInItems: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "My steps", href: "/student/about-you" },
  { label: "Subjects", href: "/#subjects" },
];

const tutorItems: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "Tutor dashboard", href: "/tutor/dashboard" },
  { label: "Subjects", href: "/#subjects" },
];

/** The site header. `user` is null when logged out. */
export default function Header({ user }: { user: User | null }) {
  return (
    <TopNavigation
      items={!user ? loggedOutItems : user.role === "student" ? loggedInItems : tutorItems}
      actions={
        user ? (
          <UserMenu user={user} />
        ) : (
          <Button href="/login" variant="brand" size="md">
            Log in
          </Button>
        )
      }
    />
  );
}
