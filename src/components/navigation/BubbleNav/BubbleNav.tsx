"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { NavItem } from "@/types";
import styles from "./BubbleNav.module.css";

interface BubbleNavProps {
  links: NavItem[];
  /** "horizontal" in the top bar, "vertical" in the mobile menu. */
  direction?: "horizontal" | "vertical";
  onNavigate?: () => void;
}

/** Every link has a pastel round icon "bubble". The current page gets a soft tinted background. */
export default function BubbleNav({ links, direction = "horizontal", onNavigate }: BubbleNavProps) {
  const pathname = usePathname();
  const slides = direction === "horizontal";

  return (
    <nav aria-label="Main">
      <ul className={`${styles.list} ${styles[direction]}`}>
        {links.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`${styles.link} ${active ? styles.active : ""} ${active && !slides ? styles.staticBg : ""}`}
              >
                {active && slides && (
                  <motion.span
                    layoutId="bubble-bg"
                    className={styles.bg}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  />
                )}
                <span className={styles.bubble}>
                  <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
