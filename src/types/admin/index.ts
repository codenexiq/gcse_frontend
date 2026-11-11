// Shapes of what the Admin API sends (see backend/src/modules/admin).

export interface Level {
  id: string;
  name: string;
  short: string;
  years: string[];
  tiers: string[];
  boards: string[];
  grades: string[];
}
export interface LevelWithUse extends Level {
  inUse: boolean;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  levels: string[];
}
export interface SubjectWithUse extends Subject {
  inUse: boolean;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  live: number;
  mocks: boolean;
  popular: boolean;
  features: string[];
  prices: Record<string, string>;
}

export interface TutorOption {
  id: number;
  name: string;
  subjects: string[];
}
export interface GroupOption {
  id: number;
  name: string;
  subjectId: string;
  levelId: string;
}
export interface Lookups {
  levels: Level[];
  subjects: Subject[];
  plans: { id: string; name: string; live: number }[];
  tutors: TutorOption[];
  groups: GroupOption[];
}

export interface Pathway {
  key: string;
  subjectId: string;
  levelId: string;
  label: string;
}
export interface Strand {
  id: number;
  name: string;
  topics: { id: number; name: string }[];
}
export interface TopicsData {
  strands: Strand[];
  diagnosticQuestions: number;
}

export interface NeedsActionRow {
  enrolmentId: number;
  student: { id: number; name: string; email: string };
  pathway: string;
  planName: string;
  subjectId: string;
  levelId: string;
  tutorId: number | null;
  groupId: number | null;
}
export interface ReadyReport {
  id: number;
  studentName: string;
  pathway: string;
  month: string;
  tutorName: string;
  text: string;
  parent: { name: string; email: string };
}
export interface OverviewData {
  kpis: { students: number; pathways: number; tutors: number; groups: number };
  plans: { id: string; name: string; count: number; percent: number }[];
  subjects: { id: string; name: string; icon: string; color: string; count: number; percent: number }[];
  needsAction: NeedsActionRow[];
  reports: ReadyReport[];
  tutors: { id: number; name: string; students: number; pendingLogs: number }[];
}

export interface Parent {
  name: string;
  email: string;
  phone: string;
}
export interface StudentListItem {
  id: number;
  name: string;
  email: string;
  year: string;
  planName: string;
  parent: Parent;
  enrolments: { id: number; subjectId: string; pathName: string }[];
}
export interface Enrolment {
  id: number;
  subjectId: string;
  levelId: string;
  tier: string;
  board: string;
  current: string;
  target: string;
  tutorId: number | null;
  groupId: number | null;
  pathName: string;
}
export interface StudentDetail {
  id: number;
  name: string;
  email: string;
  level: string;
  year: string;
  plan: string;
  joined: string;
  parent: Parent;
  enrolments: Enrolment[];
  conversations: { id: number; tutorId: number; tutorName: string; messages: number }[];
}

export interface Tutor {
  id: number;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  students: number;
  groups: number;
}
export interface Group {
  id: number;
  name: string;
  subjectId: string;
  levelId: string;
  tutorId: number | null;
  day: number;
  start: string;
  zoom: string;
  students: number;
}

export type Sender = "student" | "tutor" | "admin";
export interface ThreadSummary {
  id: string;
  studentName: string;
  tutorName: string;
  last: { from: Sender; text: string; hasAttachment: boolean; at: string } | null;
}
export interface Attachment {
  name: string;
  type: string;
  size: number;
  data: string | null;
}
export interface ThreadMessage {
  id: number;
  from: Sender;
  text: string;
  attachment: Attachment | null;
  at: string;
}
export interface ThreadDetail {
  id: string;
  studentName: string;
  tutorName: string;
  messages: ThreadMessage[];
}
