// Shapes of what the Student API sends (see backend/src/modules/student).
import type { ItemKind, TopicStatus } from "@/types/tutor";

export type { TopicStatus };

export interface StudentSummary {
  name: string;
  unread: number;
}

export interface StudentSubject {
  id: number;
  subject: { id: string; icon: string; color: string };
  pathName: string;
  diagnosticDone: boolean;
}

export interface StudentTask {
  itemId: number;
  kind: ItemKind;
  title: string;
  topic: string;
  done: boolean;
  due: string;
  late: boolean;
  routeName: string;
}

export interface StudentHomeData {
  student: { name: string; level: string; plan: { name: string; live: boolean } };
  subjects: StudentSubject[];
  current: {
    id: number;
    subject: { id: string; name: string; icon: string; color: string };
    pathName: string;
    diagnosticDone: boolean;
    currentGrade: string;
    targetGrade: string;
    strands: { id: number; name: string; topics: { id: number; name: string; status: TopicStatus }[] }[];
    mastered: number;
    total: number;
    tasks: StudentTask[];
    sessions: { id: number; date: string; start: string; who: string; zoom: string }[];
  } | null;
}

export interface TopicSheetData {
  enrolmentId: number;
  topic: { id: number; name: string; strand: string; status: TopicStatus };
  items: { id: number; kind: ItemKind; title: string; done: boolean }[];
}

export type PlayerBlock =
  | { type: "slide"; title: string; body: string }
  | { type: "video"; title: string; url: string; note: string }
  | { type: "mcq"; question: string; options: string[]; correct: number; explain: string }
  | { type: "written"; question: string; markScheme: string; marks: number };

export interface PlayerItem {
  id: number;
  enrolmentId: number;
  kind: ItemKind;
  title: string;
  topicId: number | null;
  done: boolean;
  blocks: PlayerBlock[];
}

export interface FinishResult {
  got: number;
  max: number;
  pct: number;
  mastered: boolean;
}

export interface StudentThread {
  id: number;
  tutorName: string;
  unread: number;
  last: { from: "student" | "tutor" | "admin"; text: string; hasAttachment: boolean; at: string } | null;
}

/** For an administrator looking at the Teacher or Student panel: who they are looking at, and who they could choose. */
export interface ViewAsData {
  current: { id: number; name: string; detail: string } | null;
  options: { id: number; name: string; detail: string }[];
}

export interface DiagnosticData {
  enrolmentId: number;
  done: boolean;
  pathName: string;
  subject: { id: string; icon: string; color: string };
  /** "quiz": multiple-choice questions. "conf": the student rates how confident they are with each topic. */
  mode: "quiz" | "conf";
  questions: { q: string; o: string[]; topic: string }[];
  strands: { id: number; name: string; topics: { id: number; name: string }[] }[];
}

export interface DiagnosticResult {
  score: number | null;
  total: number | null;
  misconceptions: string[];
  needsWork: string[];
  notLearned: string[];
}

/** What the public sign-up wizard offers (see backend auth/signup.model.ts). */
export interface SignupOptions {
  welcome: string;
  levels: { id: string; name: string; short: string; years: string[]; tiers: string[]; boards: string[]; grades: string[] }[];
  subjects: { id: string; name: string; icon: string; color: string; levels: string[] }[];
  plans: { id: string; name: string; tagline: string; popular: boolean; features: string[]; prices: Record<string, string> }[];
}
