"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/shop", label: "Shop" },
];

/**
 * The sticky top bar of the public website. `account` is where a signed-in visitor's dashboard is
 * (their button then says "Dashboard"); null shows "Log in".
 */
export default function SiteHeader({ account }: { account: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const accountLink = account ? { href: account, label: "Dashboard" } : { href: "/login", label: "Log in" };

  // Close the phone menu when the page changes.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="nav">
      <div className="in">
        <Link className="logo" href="/">
          <img src="/site/logo.png" alt="" />Educate Cloud
        </Link>
        <nav className="links" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>{l.label}</Link>
          ))}
        </nav>
        <Link className="btn sm out" href={accountLink.href}>{accountLink.label}</Link>
        <Link className="btn sm solid book" href="/#contact">Book a free consultation</Link>
        <button type="button" className="btn sm menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>Menu</button>
      </div>
      <nav className="mobile" id="mobile-menu" aria-label="Mobile" hidden={!open}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
        <Link href="/#contact">Book a consultation</Link>
        <Link href={accountLink.href}>{accountLink.label}</Link>
      </nav>
    </header>
  );
}
