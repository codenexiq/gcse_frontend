import type { ReactNode } from "react";
import AuthShell from "@/components/auth/AuthShell";

// Login and Register get the full-screen photo background instead of the header + footer.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
