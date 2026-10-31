"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { NavItem } from "@/types";
import styles from "./DotNav.module.css";

/** The most minimal style: plain light text links and a small soft dot under the current page. */
export default function DotNav({ links }: { links: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main">
      <ul className={styles.list}>
        {links.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${styles.link} ${active ? styles.active : ""}`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="dot-indicator"
                    className={styles.dot}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
