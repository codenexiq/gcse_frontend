"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import AvatarMenu from "@/components/navigation/AvatarMenu";
import LogoutButton from "@/components/navigation/LogoutButton";
import { useToast } from "@/hooks/useToast";
import { roleLabel } from "@/lib/roles";
import type { User } from "@/types";
import styles from "./DashboardHeader.module.css";

/** Heading text for each dashboard page, and what the Refresh toast says. The overview greets the user by name. */
function headingFor(pathname: string, name: string) {
  if (pathname.startsWith("/student/about-you")) {
    return { title: "About you", text: "Tell us a little about your studies.", upToDate: "Your details are up to date" };
  }
  if (pathname.startsWith("/student/diagnostic")) {
    return { title: "Diagnostic", text: "A short check of what you already know.", upToDate: "Your diagnostic is up to date" };
  }
  if (pathname.startsWith("/student/group")) {
    return { title: "Your group", text: "The group that fits you best.", upToDate: "Your group is up to date" };
  }
  if (pathname.startsWith("/student/learning-map")) {
    return { title: "Learning map", text: "Your path through the course.", upToDate: "Your learning map is up to date" };
  }
  if (pathname.startsWith("/tutor/dashboard/students/start-up")) {
    return {
      title: "Student Start-up Screen",
      text: "Get your students started.",
      upToDate: "Your student start-up screen is up to date",
    };
  }
  if (pathname.startsWith("/tutor/dashboard/students")) {
    return { title: "Students", text: "Everyone who has registered as a student.", upToDate: "Your student pages are up to date" };
  }
  if (pathname.startsWith("/tutor/dashboard/tutor-work/diagnostic-questions")) {
    return {
      title: "Diagnostic questions",
      text: "Write the questions students answer in the diagnostic.",
      upToDate: "Your diagnostic questions are up to date",
    };
  }
  if (pathname.startsWith("/tutor/dashboard/tutor-work")) {
    return { title: "Tutor Work", text: "Everything you need for your tutoring work.", upToDate: "Your tutor work is up to date" };
  }
  if (pathname.startsWith("/tutor/dashboard/accounts")) {
    return {
      title: "Tutor accounts",
      text: "The tutors and administrators who can sign in to the tutor area.",
      upToDate: "Your tutor accounts are up to date",
    };
  }
  if (pathname.startsWith("/tutor/dashboard")) {
    return {
      title: `Welcome, ${name}.`,
      text: "Here’s what’s happening across the school workspace.",
      upToDate: "Your overview is up to date",
    };
  }
  if (pathname.startsWith("/dashboard/items")) {
    return {
      title: "My items",
      text: "Add and view the items you are revising. Only you can see them.",
      upToDate: "Your items are up to date",
    };
  }
  if (pathname.startsWith("/dashboard/subjects")) {
    return {
      title: "Subjects",
      text: "Browse every GCSE subject and the topics inside it.",
      upToDate: "Your subjects are up to date",
    };
  }
  return {
    title: `Welcome, ${name}.`,
    text: "Here’s what’s happening in your revision workspace.",
    upToDate: "Your overview is up to date",
  };
}

/** The top of every dashboard page: title, a Refresh button, who is signed in, and Sign out. */
export default function DashboardHeader({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [refreshing, startRefresh] = useTransition();
  const name = user.email.split("@")[0];
  const { title, text, upToDate } = headingFor(pathname, name);

  function handleRefresh() {
    startRefresh(() => {
      router.refresh(); // re-fetch this page's data from the server
      toast.success(upToDate, { title: "Refreshed" });
    });
  }

  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>{roleLabel(user.role)} workspace</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
      </div>
      <div className={styles.right}>
        <Button variant="outline" size="sm" icon={<RefreshCw />} disabled={refreshing} onClick={handleRefresh}>
          Refresh
        </Button>
        <div className={styles.who}>
          <p className={styles.name}>{name}</p>
          <p className={styles.email}>{user.email}</p>
        </div>
        {/* The round initial is a drop-down. It holds only "Log out" (no name or email inside it). */}
        <AvatarMenu name={user.email} label="Account menu">
          {(close) => <LogoutButton variant="menu" onDone={close} />}
        </AvatarMenu>
      </div>
    </header>
  );
}
