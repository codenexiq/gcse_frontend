import type { ReactNode } from "react";
import SiteShell from "@/components/layout/SiteShell";

// Home, Items and every other normal page get the header + footer.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
