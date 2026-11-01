export type Mastery = "Secure" | "Developing" | "Not yet";
export const MASTERY: Mastery[] = ["Secure", "Developing", "Not yet"];

export type BehaviourKey = "engagement" | "focus" | "effort" | "homework" | "confidence";

/** What each 1-5 score means, so every tutor scores the same way. */
export const BEHAVIOURS: { key: BehaviourKey; label: string; levels: string[] }[] = [
  { key: "engagement", label: "Engagement", levels: ["Rarely contributes", "Contributes when asked", "Joins in most sessions", "Often contributes", "Always involved and eager"] },
  { key: "focus", label: "Focus", levels: ["Often off-task", "Drifts off regularly", "Focused for parts of a session", "Focused most of the time", "Fully focused throughout"] },
  { key: "effort", label: "Effort", levels: ["Little effort shown", "Effort on some tasks", "Reasonable effort", "Works hard on most tasks", "Gives full effort every time"] },
  { key: "homework", label: "Homework", levels: ["Rarely completed", "Sometimes completed", "Usually completed", "Almost always completed", "Always completed on time"] },
  { key: "confidence", label: "Confidence", levels: ["Very unsure", "Unsure on most work", "Growing in confidence", "Confident on most work", "Very confident"] },
];

export const WENT_WELL = [
  "Shows clear working or reasoning", "Improved accuracy", "Asks good questions", "Homework on time", "Good exam technique",
  "Works well independently", "Contributes to discussion", "Uses subject vocabulary well", "Bounces back from mistakes",
];
export const NEXT_STEPS = [
  "Learn key facts, formulae or quotes", "Show full working or reasoning", "Check answers before finishing", "Complete homework on time",
  "Practise exam-style questions", "Read questions carefully", "Write longer, developed answers", "Revisit weaker topics", "Ask for help sooner",
];

export const SUBJECTS = ["English Language", "English Literature", "Maths", "Biology", "Chemistry", "Physics", "Combined Science", "History", "Geography", "Other"];
export const YEAR_GROUPS = ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12", "Year 13"];
export const TIERS = ["Higher", "Foundation", "Not applicable"];
export const PROGRESS = ["Above target", "On target", "Below target"];

export interface TopicRow { name: string; mastery: Mastery | "" }
export interface TestRow { name: string; score: string; outOf: string; grade: string }
export interface TargetRow { what: string; student: string; tutor: string; measured: string }

export interface MonthlyReport {
  /** The registered student the report is sent to (null until chosen). */
  studentId: number | null;
  yourName: string; studentName: string; subject: string; yearGroup: string; tier: string; month: string;
  attended: string; held: string;
  topics: TopicRow[];
  testCount: number; tests: TestRow[];
  behaviours: Record<BehaviourKey, number>;
  wentWell: string[]; example: string; nextSteps: string[]; specificTarget: string;
  progress: string; workingAt: string; targetGrade: string; parentCall: boolean; comment: string;
  targets: TargetRow[]; topicsNext: string; keyDates: string; homeHelp: string;
}

export type UpdateReport = (patch: Partial<MonthlyReport>) => void;

export const monthLabel = (d: Date) => d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

/** The last four months, this one and the next. */
export function monthOptions(): string[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => monthLabel(new Date(now.getFullYear(), now.getMonth() - 4 + i, 1)));
}

export const emptyTarget = (): TargetRow => ({ what: "", student: "", tutor: "", measured: "" });

export function emptyReport(): MonthlyReport {
  return {
    studentId: null, yourName: "", studentName: "", subject: SUBJECTS[0], yearGroup: "Year 11", tier: "Higher", month: monthLabel(new Date()),
    attended: "", held: "",
    topics: [1, 2, 3].map(() => ({ name: "", mastery: "" as const })),
    testCount: 0, tests: [1, 2, 3].map(() => ({ name: "", score: "", outOf: "", grade: "" })),
    behaviours: { engagement: 3, focus: 3, effort: 3, homework: 3, confidence: 3 },
    wentWell: [], example: "", nextSteps: [], specificTarget: "",
    progress: "On target", workingAt: "", targetGrade: "", parentCall: false, comment: "",
    targets: [emptyTarget()], topicsNext: "", keyDates: "", homeHelp: "",
  };
}

const num = (s: string) => (s.trim() === "" || Number.isNaN(Number(s)) ? null : Number(s));

/** Whole-number percentage, or null when it cannot be worked out. */
export function attendancePercent(r: MonthlyReport): number | null {
  const a = num(r.attended), h = num(r.held);
  return a === null || h === null || h <= 0 ? null : Math.round((a / h) * 100);
}

export function testAveragePercent(r: MonthlyReport): number | null {
  const marks = r.tests
    .slice(0, r.testCount)
    .map((t) => ({ s: num(t.score), o: num(t.outOf) }))
    .filter((t): t is { s: number; o: number } => t.s !== null && t.o !== null && t.o > 0);
  return marks.length === 0 ? null : Math.round(marks.reduce((sum, t) => sum + (t.s / t.o) * 100, 0) / marks.length);
}

export function summaryText(r: MonthlyReport): string {
  const who = r.studentName.trim() || "The student";
  const best = BEHAVIOURS.reduce((a, b) => (r.behaviours[b.key] > r.behaviours[a.key] ? b : a));
  return `${who}'s strongest area this month was ${best.label.toLowerCase()}. Overall, ${who} is ${r.progress.toLowerCase()}.`;
}
