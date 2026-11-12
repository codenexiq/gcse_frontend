import Link from "next/link";

const PANELS = [
  { area: "Admin", href: "/admin" },
  { area: "Teacher", href: "/tutor" },
  { area: "Student", href: "/student" },
];

/** Administrators can open all three panels: this switches between them. */
export default function PanelSwitcher({ area }: { area: string }) {
  return (
    <nav className="seg" aria-label="Panels">
      {PANELS.map((p) => (
        <Link key={p.area} href={p.href} className="seg-link" aria-current={p.area === area ? "page" : undefined}>
          {p.area}
        </Link>
      ))}
    </nav>
  );
}
