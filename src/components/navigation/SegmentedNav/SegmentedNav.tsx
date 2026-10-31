"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { NavItem } from "@/types";
import styles from "./SegmentedNav.module.css";

/** Links sit in a pale rounded track; a soft white "thumb" glides to the current page. */
export default function SegmentedNav({ links }: { links: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main">
      <ul className={styles.track}>
        {links.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${styles.link} ${active ? styles.active : ""}`}
              >
                {active && (
                  <motion.span
                    layoutId="segmented-thumb"
                    className={styles.thumb}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  />
                )}
                <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
