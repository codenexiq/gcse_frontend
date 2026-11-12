// Shapes of what the Teacher API sends (see backend/src/modules/tutor).

export interface TutorSummary {
  name: string;
  pendingLogs: number;
  unread: number;
}

export interface SubjectRef {
  id: string;
  icon: string;
  color: string;
}

export interface Session {
  id: number;
  who: string;
  kind: "group" | "one";
  date: string;
  start: string;
  mins: number;
  logged: boolean;
  past: boolean;
  subject: SubjectRef | null;
}

export interface TodayData {
  kpis: { students: number; sessionsThisWeek: number; toLog: number; unread: number };
  today: Session[];
  pending: Session[];
  weekStart: string;
  days: { date: string; day: number; isToday: boolean; sessions: Session[] }[];
  bookOptions: { value: string; label: string }[];
  pendingCount: number;
}

export interface LogFormData {
  session: Session;
  topics: { id: number; label: string }[];
  students: { enrolmentId: number; name: string }[];
}

export type TopicStatus = "M" | "P" | "W" | "N";

export interface MyStudentRow {
  enrolmentId: number;
  name: string;
  year: string;
  pathName: string;
  groupName: string | null;
  current: string;
  target: string;
  mastered: number;
  total: number;
  diagnosticDone: boolean;
  subject: SubjectRef;
}
export interface MyGroup {
  id: number;
  name: string;
  day: number;
  start: string;
  students: number;
  subject: SubjectRef;
}
export interface MyStudents {
  students: MyStudentRow[];
  groups: MyGroup[];
}

export interface StudentProfileData {
  enrolment: {
    id: number;
    studentId: number;
    studentName: string;
    year: string;
    pathName: string;
    board: string;
    planName: string;
    subject: SubjectRef;
    current: string;
    target: string;
    groupId: number | null;
  };
  grades: string[];
  stats: { mastered: number; all: number; diagnostic: string; minutesThisWeek: number; quizzes: number };
  strands: { id: number; name: string; topics: { id: number; name: string; status: TopicStatus }[] }[];
  misconceptions: string[];
  recent: { title: string; pct: number; at: string }[];
  sessions: { id: number; date: string; topicName: string; present: boolean; note: string }[];
  groups: { id: number; name: string }[];
}

export interface ReportFacts {
  month: string;
  attended: number;
  sessions: number;
  topics: string[];
  quizzes: number;
  avg: number | null;
  mastered: number;
  all: number;
  weak: string[];
  notes: string[];
}
export interface ReportData {
  facts: ReportFacts;
  text: string;
  status: string | null;
}

export interface TutorThread {
  id: number;
  studentName: string;
  unread: number;
  last: { from: "student" | "tutor" | "admin"; text: string; hasAttachment: boolean; at: string } | null;
}

// ---------- Content: the library and the learning routes ----------

export type ItemKind = "lesson" | "notes" | "quiz" | "video";

export interface ContentPath {
  key: string;
  subject: { id: string; name: string; icon: string; color: string };
  level: { id: string; short: string };
  label: string;
  students: number;
}

export interface LibraryItem {
  id: number;
  kind: ItemKind;
  title: string;
  published: boolean;
}
export interface LibraryData {
  strands: { id: number; name: string; topics: { id: number; name: string; items: LibraryItem[] }[] }[];
  unsorted: LibraryItem[];
}

export type BlockData =
  | { type: "slide"; title: string; body: string }
  | { type: "video"; title: string; url: string; note: string }
  | { type: "mcq"; question: string; options: string[]; correct: number; explain: string }
  | { type: "written"; question: string; markScheme: string; marks: number };

export interface ContentItem {
  id: number;
  kind: ItemKind;
  title: string;
  subject: string;
  level: string;
  topicId: number | null;
  published: boolean;
  source: string;
  blocks: BlockData[];
  topics: { id: number; label: string }[];
}

export interface RoutesData {
  routes: { id: number; name: string; steps: number; shownTo: string[] }[];
  items: { id: number; kind: ItemKind; title: string; topic: string; published: boolean }[];
  groups: { id: number; name: string }[];
  students: { enrolmentId: number; name: string }[];
}
export interface RouteDetail {
  id: number;
  name: string;
  steps: { itemId: number; week: number }[];
  groups: number[];
  enrolments: number[];
}
