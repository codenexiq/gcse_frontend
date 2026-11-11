"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin/settings/levels", label: "Levels" },
  { href: "/admin/settings/subjects", label: "Subjects" },
  { href: "/admin/settings/topics", label: "Topics" },
  { href: "/admin/settings/plans", label: "Plans" },
  { href: "/admin/settings/signup", label: "Sign-up" },
];

/** Levels, Subjects, Topics, Plans and Sign-up: the switch at the top of Settings. */
export default function SettingsSwitch() {
  const pathname = usePathname();
  return (
    <div className="row between toolbar">
      <nav className="seg" aria-label="Settings">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} className="seg-link" aria-current={pathname.startsWith(i.href) ? "page" : undefined}>
            {i.label}
          </Link>
        ))}
      </nav>
      <span className="small muted">Changes save straight away and show on every dashboard.</span>
    </div>
  );
}
