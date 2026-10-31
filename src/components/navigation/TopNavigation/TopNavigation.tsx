"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { NavigationItem, TopNavigationProps } from "./TopNavigation.types";
import styles from "./TopNavigation.module.css";

function normalizedPath(href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  const path = href.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  return path || "/";
}

/** Is this link the page we are on? Links with a #section never count as the current page. */
function isCurrentPage(pathname: string, href: string) {
  if (href.includes("#")) return false;
  const itemPath = normalizedPath(href);
  if (!itemPath) return false;
  return itemPath === "/" ? pathname === "/" : pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

function NavigationLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavigationItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const current = isCurrentPage(pathname, item.href);
        return (
          <li key={`${item.href}:${item.label}`}>
            <Link
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer noopener" : undefined}
              aria-current={current ? "page" : undefined}
              onClick={onNavigate}
              className={`${styles.link} ${current ? styles.current : ""}`}
            >
              {item.label}
              {item.external && <span className={styles.srOnly}> (opens in a new tab)</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The site's top bar: logo on the left, links in the middle, actions on the right.
 * On small screens the links move into a menu that opens under the bar. It has a "skip to main
 * content" link, marks the current page, and closes with Escape or when you pick a link.
 */
export default function TopNavigation({
  items,
  brandLabel = "Educate Cloud",
  brandHref = "/",
  navigationLabel = "Main navigation",
  actions,
}: TopNavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  // Close the mobile menu whenever we move to another page.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <div className={styles.bar}>
        <Link href={brandHref} className={styles.brand} aria-label={`${brandLabel} home`}>
          <Image src="/images/logo.png" alt="" width={72} height={72} priority className={styles.logo} />
          <span className={styles.srOnly}>{brandLabel}</span>
        </Link>

        <nav className={styles.desktopNav} aria-label={navigationLabel}>
          <NavigationLinks items={items} pathname={pathname} />
        </nav>

        <div className={styles.right}>
          {actions}
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls={mobileMenuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <motion.nav
        id={mobileMenuId}
        aria-label={navigationLabel}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        initial={false}
        animate={menuOpen ? "open" : "closed"}
        variants={{
          closed: { height: 0, opacity: 0, y: -8, pointerEvents: "none" },
          open: { height: "auto", opacity: 1, y: 0, pointerEvents: "auto" },
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={styles.mobileNav}
      >
        <div className={styles.mobileInner}>
          <NavigationLinks items={items} pathname={pathname} onNavigate={closeMenu} />
        </div>
      </motion.nav>
    </header>
  );
}
