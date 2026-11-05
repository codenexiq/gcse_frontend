"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CircleUserRound,
  ClipboardList,
  ListChecks,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Map,
  MessageSquare,
  Menu,
  Package,
  Settings2,
  UserCog,
  UserRound,
  Users,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useChatUnread } from "@/hooks/useChatUnread";
import type { Role } from "@/types";
import styles from "./DashboardSidebar.module.css";

interface NavEntry {
  href: string;
  label: string;
  icon: LucideIcon;
  /** true: only highlighted on exactly this page (used for "Overview"). */
  exact: boolean;
}

// What each kind of user sees in the sidebar.
const workspaces: Record<Role, { label: string; note: string; nav: NavEntry[] }> = {
  student: {
    label: "Student workspace",
    note: "Your answers are private. Only you and your tutors can see them.",
    nav: [
      { href: "/student/about-you", label: "About you", icon: UserRound, exact: false },
      { href: "/student/diagnostic", label: "Diagnostic", icon: ClipboardCheck, exact: false },
      { href: "/student/group", label: "Your group", icon: UsersRound, exact: false },
      { href: "/student/learning-map", label: "Learning map", icon: Map, exact: false },
      { href: "/student/monthly-progress", label: "Monthly progress", icon: CalendarDays, exact: false },
      { href: "/student/quizzes", label: "Quizzes", icon: ListChecks, exact: false },
      { href: "/student/messages", label: "Messages", icon: MessageSquare, exact: false },
      { href: "/student/profile", label: "My profile", icon: CircleUserRound, exact: false },
    ],
  },
  tutor: {
    label: "Tutor workspace",
    note: "You can view students. Account changes are made by an administrator.",
    nav: [
      { href: "/tutor/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/tutor/dashboard/students", label: "Students", icon: Users, exact: false },
      { href: "/tutor/dashboard/tutor-work", label: "Tutor Work", icon: BriefcaseBusiness, exact: false },
      { href: "/tutor/dashboard/monthly-progress", label: "Monthly progress", icon: CalendarDays, exact: false },
      { href: "/tutor/dashboard/lesson-log", label: "Lesson log", icon: ClipboardList, exact: false },
      { href: "/tutor/dashboard/quizzes", label: "Quizzes", icon: ListChecks, exact: false },
      { href: "/tutor/dashboard/messages", label: "Messages", icon: MessageSquare, exact: false },
      { href: "/tutor/dashboard/profile", label: "My profile", icon: CircleUserRound, exact: false },
    ],
  },
  admin: {
    label: "Administrator workspace",
    note: "You can view students and every tutor account.",
    nav: [
      { href: "/tutor/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/tutor/dashboard/students", label: "Students", icon: Users, exact: false },
      { href: "/tutor/dashboard/tutor-work", label: "Tutor Work", icon: BriefcaseBusiness, exact: false },
      { href: "/tutor/dashboard/monthly-progress", label: "Monthly progress", icon: CalendarDays, exact: false },
      { href: "/tutor/dashboard/lesson-log", label: "Lesson log", icon: ClipboardList, exact: false },
      { href: "/tutor/dashboard/quizzes", label: "Quizzes", icon: ListChecks, exact: false },
      { href: "/tutor/dashboard/messages", label: "Messages", icon: MessageSquare, exact: false },
      { href: "/tutor/dashboard/profile", label: "My profile", icon: CircleUserRound, exact: false },
      { href: "/tutor/dashboard/accounts", label: "Tutor accounts", icon: UserCog, exact: false },
    ],
  },
};

function SidebarContents({ role, pathname, closeMenu, unread }: { role: Role; pathname: string; closeMenu?: () => void; unread: number }) {
  const workspace = workspaces[role];
  return (
    <>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>
          <GraduationCap aria-hidden="true" size={20} />
        </span>
        <span className={styles.brandText}>
          <span className={styles.brandName}>Educate Cloud</span>
          <span className={styles.brandSub}>{workspace.label}</span>
        </span>
      </div>
      <div className={styles.rule} />

      <nav aria-label="Dashboard" className={styles.nav}>
        <p className={styles.group}>Workspace</p>
        <ul className={styles.list}>
          {workspace.nav.map(({ href, label, icon: Icon, exact }) => {
            const current = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={closeMenu}
                  aria-current={current ? "page" : undefined}
                  className={`${styles.item} ${current ? styles.itemCurrent : ""}`}
                >
                  <Icon aria-hidden="true" size={18} className={styles.itemIcon} />
                  {label}
                  {href.endsWith("/messages") && unread > 0 && (
                    <span className={styles.badge} role="status" aria-label={`${unread} unread ${unread === 1 ? "message" : "messages"}`}>
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className={`${styles.group} ${styles.groupSpaced}`}>Coming soon</p>
        <ul className={styles.list}>
          <li>
            <span aria-disabled="true" className={`${styles.item} ${styles.itemDisabled}`}>
              <Settings2 aria-hidden="true" size={18} />
              Settings
              <span className={styles.soon}>Soon</span>
            </span>
          </li>
        </ul>
      </nav>

      <div className={styles.footer}>
        <Link href="/" onClick={closeMenu} className={styles.back}>
          <ArrowLeft aria-hidden="true" size={16} /> Back to home
        </Link>
        <div className={styles.status}>
          <div className={styles.statusTitle}>
            <span className={styles.statusDot} />
            Workspace ready
          </div>
          <p className={styles.statusText}>{workspace.note}</p>
        </div>
      </div>
    </>
  );
}

/** Fixed sidebar on wide screens; a top bar with a slide-in drawer on small ones. */
export default function DashboardSidebar({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const unread = useChatUnread();

  // Close the drawer when the page changes, and with Escape.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <aside className={styles.desktop}>
        <SidebarContents role={role} pathname={pathname} unread={unread} />
      </aside>

      <div className={styles.topBar}>
        <div className={styles.topBrand}>
          <span className={styles.topIcon}>
            <GraduationCap aria-hidden="true" size={20} />
          </span>
          <span className={styles.topName}>Educate Cloud</span>
        </div>
        <button
          type="button"
          aria-label={open ? "Close dashboard menu" : "Open dashboard menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={styles.menuButton}
        >
          {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              aria-label="Close dashboard menu"
              className={styles.backdrop}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className={styles.drawer}
              initial={reducedMotion ? false : { x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
            >
              <SidebarContents role={role} pathname={pathname} closeMenu={() => setOpen(false)} unread={unread} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
