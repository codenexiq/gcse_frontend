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
  /** Changes whenever the profile picture changes; null or missing when there is none. */
  avatarVersion?: number | null;
  /** The colour this person chose for the chat area (like #dff3e6); null = the standard colour. */
  chatColor?: string | null;
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
  /** The student's unique ID, e.g. STU-00042. */
  student_code?: string | null;
  /** An inactive student cannot sign in. */
  is_active?: boolean;
  headline?: string | null;
  location?: string | null;
  /** From the student's "About you" answers (empty until they fill them in). */
  level?: string | null;
  subject?: string | null;
  school_year?: string | null;
  /** Changes whenever the student's profile picture changes; null or missing when they have none. */
  avatar_version?: number | null;
  /** Missing until the back-end that sends it is updated. */
  full_name?: string;
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

/** One line in a student's list of monthly progress reports. */
export interface MonthlyReportSummary {
  id: number;
  subject: string;
  month: string;
  updated_at: string;
}

/** A report a tutor sent to a student (read-only for the student). */
export interface MonthlyReportRecord<T> extends MonthlyReportSummary {
  data: T;
}

/** One row of the tutor's table of monthly progress reports. */
export interface MonthlyReportRow extends MonthlyReportSummary {
  student_id: number;
  full_name?: string;
  email: string;
  /** Changes whenever the student's profile picture changes; null or missing when they have none. */
  avatar_version?: number | null;
}

/** One line of a chat list: the OTHER person (a student for a tutor, a tutor or admin for a student), the latest message and how many are unread. */
export interface ChatConversation {
  peerId: number;
  fullName: string;
  email: string;
  peerRole: Role;
  /** Changes whenever the person's profile picture changes; null when they have none. */
  avatarVersion: number | null;
  lastBody: string | null;
  lastHasFile: boolean;
  lastAt: string | null;
  unread: number;
}

/** One chat message. */
export interface ChatMessageItem {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: Role;
  /** Only in a group chat: the sender's profile picture version, so everybody's picture can be shown. */
  senderAvatarVersion?: number | null;
  body: string | null;
  createdAt: string;
  /** Its sender deleted it: no text and no file, only a note that it was deleted. */
  deleted: boolean;
  /** The message this one answers, as a short quote (null when it is not a reply). */
  replyTo: { id: number; senderName: string; body: string | null; fileName: string | null; deleted: boolean } | null;
  /** Seconds that were left, when it arrived, in which its sender could still delete it for everyone. */
  windowLeft: number;
  /** When this screen received it (set here in the browser), to work out how much of the time is left now. */
  receivedAt?: number;
  attachment: { id: number; name: string; size: number } | null;
}

/** How far each side has received and read a conversation (message ids), for the ticks. */
export interface ChatPointers {
  tutorRead: number;
  tutorDelivered: number;
  studentRead: number;
  studentDelivered: number;
  /** Everything up to this message id was removed when the whole chat was deleted. */
  wipedUpTo: number;
}

/** What a message's ticks show: one tick = sent, two grey = delivered, two blue = read. */
export type ChatStatus = "sent" | "delivered" | "read";

/** The signed-in person's profile (what the "My profile" page shows and edits). */
export interface ProfileData {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  /** The account's unique User ID, e.g. STU-00042, TUT-00002 or ADM-00001. */
  userCode: string | null;
  username: string;
  phone: string;
  gender: string;
  headline: string;
  location: string;
  bio: string;
  createdAt: string;
  /** Changes whenever the picture changes; null when there is no picture. */
  avatarVersion: number | null;
  coverVersion: number | null;
}

/** One student's full profile, as an admin or tutor sees and edits it. */
export interface StudentProfileData {
  id: number;
  studentCode: string | null;
  username: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  headline: string;
  location: string;
  bio: string;
  isActive: boolean;
  createdAt: string;
  avatarVersion: number | null;
  coverVersion: number | null;
}

/** What the contact card beside a chat shows about the other person (no email, no phone number). */
export interface ChatPeer {
  id: number;
  fullName: string;
  role: Role;
  username: string;
  headline: string;
  location: string;
  bio: string;
  avatarVersion: number | null;
  coverVersion: number | null;
  /** Only when a tutor or admin looks at a student: every detail of the student. */
  userCode?: string | null;
  email?: string;
  phone?: string;
  gender?: string;
  createdAt?: string;
  isActive?: boolean;
}

/** One group chat in the list. */
export interface ChatGroupSummary {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  lastBody: string | null;
  lastHasFile: boolean;
  lastAt: string | null;
  unread: number;
}

/** A student in a group. */
export interface ChatGroupMember {
  id: number;
  fullName: string;
  avatarVersion: number | null;
}

/** A group with the students in it. */
export interface ChatGroupDetail {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  members: ChatGroupMember[];
}

/** One entry of the lesson log: the attendance and feedback form a tutor fills in after each lesson. */
export interface LessonLogEntry {
  id: number;
  tutorId: number;
  tutorName: string;
  tutorEmail: string;
  /** Plain date text, like 2026-11-02. */
  lessonDate: string;
  studentOrClass: string;
  lessonType: "1:1" | "Group" | "Admin";
  attendance: "Present" | "Late" | "Absent / No show";
  durationMinutes: number;
  completed: "Yes" | "No" | "Maybe";
  homeworkAssigned: boolean;
  homeworkOther: string;
  engagementNotes: string;
  nextFocus: string;
  zoomRecorded: boolean;
  createdAt: string;
}

/** One quiz in a list. A student's list carries their own tries (`myAttempts`, `myBest`); a tutor's carries `attemptCount` and who uploaded it. */
export interface QuizSummary {
  id: number;
  title: string;
  subtitle: string;
  instructions: string;
  questionCount: number;
  totalMarks: number;
  published: boolean;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  attemptCount: number;
  myAttempts?: number;
  /** The most questions this student has got right in one try, or null if they have not tried. */
  myBest?: number | null;
}

export interface QuizQuestion {
  id: number;
  ref: string;
  marks: number;
  topic: string;
  /** A written description of the diagram the question refers to. */
  diagram: string;
  /** The name of the SVG picture for this question, or "" (older quizzes have none). Shown with diagramUrl(). */
  diagramKey?: string;
  question: string;
  /** Letter -> text, like { A: "44°", B: "54°" }. */
  options: Record<string, string>;
}

/** What a tutor sees: the answers and explanations too. */
export interface QuizQuestionWithAnswer extends QuizQuestion {
  correct: string;
  explanation: string;
}
export interface QuizForTutor extends QuizSummary {
  questions: QuizQuestionWithAnswer[];
}

/** What a student answers: never the correct answers. */
export interface QuizForStudent {
  id: number;
  title: string;
  subtitle: string;
  instructions: string;
  questionCount: number;
  totalMarks: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  /** Questions answered correctly. */
  score: number;
  marks: number;
  questionCount: number;
  totalMarks: number;
  createdAt: string;
}

/** The marked attempt, with the right answers, sent back once when a student hands in. */
export interface QuizResult {
  attemptId: number;
  score: number;
  questionCount: number;
  marks: number;
  totalMarks: number;
  message: string;
  results: {
    id: number;
    chosen: string;
    correct: string;
    isCorrect: boolean;
    marks: number;
    explanation: string;
    options: Record<string, string>;
    question: string;
    topic: string;
  }[];
}
