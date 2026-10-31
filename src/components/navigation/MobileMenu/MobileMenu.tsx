"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { NavItem, User } from "@/types";
import NavMenu from "../NavMenu";
import UserMenu from "../UserMenu";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  links: NavItem[];
  user: User | null;
}

/** A round "hamburger" bubble whose three lines morph into an X, with a soft dropdown card. */
export default function MobileMenu({ links, user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Escape closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <motion.span className={styles.line} animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }} />
        <motion.span className={styles.line} animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.4 : 1 }} />
        <motion.span className={styles.line} animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className={styles.panel}
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <NavMenu links={links} direction="vertical" onNavigate={close} />
            {user && (
              <div className={styles.user}>
                <UserMenu user={user} onDone={close} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
