import type { LucideIcon } from "lucide-react";

// Shapes of the data the Express API sends us.

/** student = normal learner; tutor / admin = tutor (created by an administrator). */
export type Role = "student" | "tutor" | "admin";

export interface User {
  id: number;
  /** Missing on very old sessions. */
  fullName?: string;
  email: string;
  role: Role;
}

export interface Topic {
  id: number;
  name: string;
  slug: string;
}

export interface Subject {
  id: number;
  name: string;
  slug: string;
  topics: Topic[];
}

export interface Item {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  topicId: number | null;
  topicName: string | null;
  subjectName: string | null;
}

export interface Credentials {
  fullName?: string;
  email: string;
  password: string;
}

export interface NewItem {
  title: string;
  description?: string;
  topicId?: number;
}

export interface AuthResponse {
  user: User;
}

/** One entry in the top navigation menu. `icon` is a Lucide icon component. */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export type ToastVariant = "error" | "success" | "warning" | "info";

export interface ToastData {
  id: number;
  variant: ToastVariant;
  /** Bold coloured heading. Defaults to Error / Success / Warning / Information. */
  title: string;
  message: string;
  /** Milliseconds before it closes by itself. */
  duration: number;
}

/** The look of the desktop navigation menu. */
export type NavVariant = "segmented" | "bubbles" | "dots";

/** Numbers shown on the tutor dashboard. */
export interface TutorOverview {
  students: number;
  tutors: number;
  admins: number;
  items: number;
  subjects: number;
  topics: number;
}

/** One row of the student directory. */
export interface StudentSummary {
  id: number;
  email: string;
  created_at: string;
}

/** One row of the tutor accounts list (admins only). */
export interface TutorAccount extends StudentSummary {
  role: Exclude<Role, "student">;
}

/** Which Student Start-up Screen dropdown a choice belongs to. */
export type StartupCategory = "subject" | "exam_board" | "school_year" | "target_grade";

/** One choice in a Student Start-up Screen dropdown (tutors can add, rename and delete these). */
export interface StartupOption {
  id: number;
  category: StartupCategory;
  label: string;
  sort_order: number;
}

/** The wording of the diagnostic intro screen. {level}, {subject}, {questions} and {highlight} are filled in on screen. */
export interface DiagnosticIntroContent {
  badge: string;
  heading: string;
  intro: string;
  hint: string;
  highlight: string;
  buttonLabel: string;
  questions: number;
  /** The "What happens next" card on the results screen. */
  nextLabel: string;
  nextHeading: string;
  nextText: string;
}

export type DiagnosticLevel = "GCSE" | "IGCSE / O-level" | "A-level";
export type DiagnosticTier = "Foundation" | "Higher" | "Any";

/** A diagnostic question written by a tutor. Maths is written between dollar signs, e.g. $\frac{3}{4}$. */
export interface DiagnosticQuestion {
  id: number;
  level: DiagnosticLevel;
  subjectId: number;
  /** The generated set this question belongs to, or null if it was written by hand. */
  batchId: number | null;
  tier: DiagnosticTier;
  topic: string;
  question: string;
  options: { text: string; isCorrect: boolean; misconception?: string | null }[];
}

/** What a tutor sends when creating or changing a question. */
export type DiagnosticQuestionInput = Omit<DiagnosticQuestion, "id" | "batchId">;

/** One click of "Generate questions": a set of questions, shown as one card. */
export interface DiagnosticBatch {
  id: number;
  level: DiagnosticLevel;
  subjectId: number;
  tier: DiagnosticTier;
  topic: string | null;
  createdAt: string;
}

/** What a tutor asks for when generating questions. */
export interface DiagnosticGenerateInput {
  level: DiagnosticLevel;
  subjectId: number;
  tier: DiagnosticTier;
  /** Leave empty to spread the questions across the whole course. */
  topic: string;
  count: number;
}

/** A topic the free built-in generator can write, and where it is available. */
export interface DiagnosticTopic {
  topic: string;
  levels: DiagnosticLevel[];
  tiers: ("Foundation" | "Higher")[];
}

/** What a student chose on the "About you" screen. */
export interface StudentProfile {
  level: DiagnosticLevel;
  subjectId: number | null;
  examBoardId: number | null;
  schoolYearId: number | null;
  targetGradeId: number | null;
  tier: "Foundation" | "Higher" | "Not sure yet";
}

/** The input for saving it: every choice is required. */
export type StudentProfileInput = {
  [K in keyof StudentProfile]: NonNullable<StudentProfile[K]>;
};

/** A diagnostic question as a student sees it: no correct answer. */
export interface StudentQuestion {
  id: number;
  topic: string;
  question: string;
  options: { text: string }[];
}

/** The totals shown when a student finishes the diagnostic. */
export interface StudentDiagnosticResult {
  correct: number;
  notLearned: number;
  incorrect: number;
  total: number;
  /** Topics the student got right. */
  strong: string[];
  /** Topics with a wrong answer. */
  needWork: string[];
  /** Topics the student has not learned yet. */
  notLearnedTopics: string[];
  /** The mistakes behind the wrong answers. */
  misconceptions: { topic: string; text: string }[];
}
