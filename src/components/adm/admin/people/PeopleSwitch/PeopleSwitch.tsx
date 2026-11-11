"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin/people/students", label: "Students" },
  { href: "/admin/people/tutors", label: "Tutors" },
  { href: "/admin/people/groups", label: "Groups" },
];

/** Students, Tutors and Groups: the switch at the top of the People tab. */
export default function PeopleSwitch() {
  const pathname = usePathname();
  return (
    <div className="row between toolbar">
      <nav className="seg" aria-label="People">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} className="seg-link" aria-current={pathname.startsWith(i.href) ? "page" : undefined}>
            {i.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
