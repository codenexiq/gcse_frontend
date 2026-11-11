import type { ReactNode } from "react";

/** Wraps the page content of every dashboard page. */
export default function DashboardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
