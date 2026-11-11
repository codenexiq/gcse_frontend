"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/adm/ui/Icon";

export interface NavTab {
  href: string;
  /** "exact" matches only this address; otherwise the tab is current for every address that starts with this. */
  match: string;
  label: string;
  icon: string;
  /** A number shown on the tab (sessions to log, unread messages...). Nothing is shown for 0. */
  count?: number;
}

/** The row of tabs under the page title. */
export default function NavTabs({ tabs }: { tabs: NavTab[] }) {
  const pathname = usePathname();
  return (
    <nav className="tabs" aria-label="Sections">
      {tabs.map((t) => {
        const current = t.match === "exact" ? pathname === t.href : pathname.startsWith(t.match);
        return (
          <Link key={t.href} href={t.href} className="tab" aria-current={current ? "page" : undefined}>
            <Icon name={t.icon} />
            <span>{t.label}</span>
            {t.count ? <span className="count">{t.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
