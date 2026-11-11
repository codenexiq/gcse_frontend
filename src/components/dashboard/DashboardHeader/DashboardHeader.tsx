"use client";

import { usePathname } from "next/navigation";
import AvatarMenu from "@/components/navigation/AvatarMenu";
import LogoutButton from "@/components/navigation/LogoutButton";
import ProfileLink from "@/components/navigation/ProfileLink";
import { profileImageUrl } from "@/services/profileService";
import type { User } from "@/types";
import styles from "./DashboardHeader.module.css";

/** Heading text for each dashboard page. The overview greets the user by name. */
function headingFor(pathname: string, name: string) {
  if (pathname.startsWith("/student/about-you")) {
    return { title: "About you", text: "Tell us a little about your studies." };
  }
  if (pathname.startsWith("/student/diagnostic")) {
    return { title: "Diagnostic", text: "A short check of what you already know." };
  }
  if (pathname.startsWith("/student/group")) {
    return { title: "Your group", text: "The group that fits you best." };
  }
  if (pathname.startsWith("/student/learning-map")) {
    return { title: "Learning map", text: "Your path through the course." };
  }
  if (pathname.startsWith("/student/quizzes/")) {
    return { title: "Quiz", text: "Answer each question, then see your score." };
  }
  if (pathname.startsWith("/student/quizzes")) {
    return { title: "Quizzes", text: "Practise with the quizzes your tutors add." };
  }
  if (pathname.startsWith("/tutor/dashboard/groups")) {
    return { title: "Groups", text: "Weekly live groups. Place students in the group that fits." };
  }
  if (/^\/tutor\/dashboard\/quizzes\/\d+\/edit$/.test(pathname)) {
    return { title: "Edit quiz", text: "Change the questions, answers and diagrams." };
  }
  if (pathname === "/tutor/dashboard/quizzes/new") {
    return { title: "Create quiz", text: "Type the questions and choices, mark the answers, and add diagrams." };
  }
  if (pathname.startsWith("/tutor/dashboard/quizzes/")) {
    return { title: "Quiz results", text: "Scores and answers for this quiz." };
  }
  if (pathname.startsWith("/tutor/dashboard/quizzes")) {
    return { title: "Quizzes", text: "Upload a quiz file for students to take, and see their scores." };
  }
  if (pathname.startsWith("/tutor/dashboard/lesson-log/new")) {
    return { title: "Tutor Attendance & Feedback", text: "Complete straight after each lesson. Fields marked * are required. Lessons must be recorded to Zoom Cloud for the full duration." };
  }
  if (pathname.startsWith("/tutor/dashboard/lesson-log")) {
    return { title: "Lesson log", text: "Attendance and feedback for every lesson." };
  }
  if (pathname.startsWith("/student/profile") || pathname.startsWith("/tutor/dashboard/profile")) {
    return { title: "My profile", text: "Your pictures, your details and your password." };
  }
  if (pathname.startsWith("/tutor/dashboard/routes")) {
    return { title: "Learning routes", text: "Ordered lessons and quizzes you give to students." };
  }
  if (pathname.startsWith("/tutor/dashboard/lessons")) {
    return { title: "Lessons", text: "Build the lessons that show on the learning maps." };
  }
  if (pathname.startsWith("/tutor/dashboard/settings")) {
    return { title: "Settings", text: "Set up how the workspace works." };
  }
  if (pathname.startsWith("/student/messages")) {
    return { title: "Messages", text: "Chat with each of your tutors and share files." };
  }
  if (pathname.startsWith("/tutor/dashboard/messages")) {
    return { title: "Messages", text: "Chat with your students and share files." };
  }
  if (pathname.startsWith("/student/monthly-progress")) {
    return { title: "Monthly progress", text: "The reports your tutor has written for you." };
  }
  if (pathname.startsWith("/tutor/dashboard/students/new")) {
    return { title: "Create New User", text: "Add a student account." };
  }
  if (/^\/tutor\/dashboard\/students\/\d+\/review$/.test(pathname)) {
    return { title: "Review student", text: "Their answers and diagnostic results, before you place them in a group." };
  }
  if (/^\/tutor\/dashboard\/students\/\d+/.test(pathname)) {
    return { title: "Edit student profile", text: "Manage a student's profile, pictures and password." };
  }
  if (pathname.startsWith("/tutor/dashboard/students/start-up")) {
    return {
      title: "Student Start-up Screen",
      text: "Get your students started.",
    };
  }
  if (pathname.startsWith("/tutor/dashboard/students")) {
    return { title: "Students", text: "Everyone who has registered as a student." };
  }
  if (pathname.startsWith("/tutor/dashboard/tutor-work/diagnostic-questions")) {
    return {
      title: "Diagnostic questions",
      text: "Write the questions students answer in the diagnostic.",
    };
  }
  if (pathname.startsWith("/tutor/dashboard/tutor-work")) {
    return { title: "Tutor Work", text: "Everything you need for your tutoring work." };
  }
  if (pathname.startsWith("/tutor/dashboard/monthly-progress/new")) {
    return { title: "Monthly Progress Report Builder", text: "Write a student's monthly progress report." };
  }
  if (pathname.startsWith("/tutor/dashboard/monthly-progress/student/")) {
    return { title: "Student reports", text: "Every monthly report for this student." };
  }
  if (pathname.startsWith("/tutor/dashboard/monthly-progress/")) {
    return { title: "Monthly progress report", text: "The report as the student sees it." };
  }
  if (pathname.startsWith("/tutor/dashboard/enquiries")) {
    return {
      title: "Website enquiries",
      text: "Messages sent from the contact form on the website.",
    };
  }
  if (pathname.startsWith("/tutor/dashboard/accounts")) {
    return {
      title: "Tutor accounts",
      text: "The tutors and administrators who can sign in to the tutor area.",
    };
  }
  if (pathname === "/tutor/dashboard") {
    return { title: "Today", text: "Your sessions this week: book them, log them, and see who needs a log." };
  }
  if (pathname.startsWith("/tutor/dashboard")) {
    return {
      title: `Welcome, ${name}.`,
      text: "Here’s what’s happening across the school workspace.",
    };
  }
  if (pathname.startsWith("/dashboard/items")) {
    return {
      title: "My items",
      text: "Add and view the items you are revising. Only you can see them.",
    };
  }
  if (pathname.startsWith("/dashboard/subjects")) {
    return {
      title: "Subjects",
      text: "Browse every GCSE subject and the topics inside it.",
    };
  }
  return {
    title: `Welcome, ${name}.`,
    text: "Here’s what’s happening in your revision workspace.",
  };
}

/** The top of every dashboard page: title, who is signed in, and Sign out. */
export default function DashboardHeader({ user }: { user: User }) {
  const pathname = usePathname();
  const name = user.fullName?.trim() || user.email.split("@")[0];
  const { title, text } = headingFor(pathname, name);

  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
      </div>
      <div className={styles.right}>
        {/* The round initial is a drop-down: who is signed in, then Log out. */}
        <AvatarMenu name={name} imageSrc={user.avatarVersion ? profileImageUrl("avatar", user.avatarVersion) : null} label="Account menu">
          {(close) => (
            <>
              <div className={styles.who}>
                <p className={styles.name}>{name}</p>
                <p className={styles.email}>{user.email}</p>
              </div>
              <ProfileLink href={user.role === "student" ? "/student/profile" : "/tutor/dashboard/profile"} onDone={close} />
              <LogoutButton variant="menu" onDone={close} />
            </>
          )}
        </AvatarMenu>
      </div>
    </header>
  );
}
