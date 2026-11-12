import type { BlockData, ItemKind, TopicStatus } from "@/types/tutor";

/** Label and colour of each status on the learning map. */
export const STATUS_LABEL: Record<TopicStatus, [string, string]> = {
  M: ["Mastered", "c-navy"],
  P: ["In progress", "c-blue"],
  W: ["Needs work", "c-pink"],
  N: ["Not started", "c-out"],
};

/** Name and icon of each kind of item. */
export const KIND: Record<ItemKind, { label: string; icon: string }> = {
  lesson: { label: "Lesson", icon: "lesson" },
  notes: { label: "Notes", icon: "notes" },
  quiz: { label: "Quiz", icon: "quiz" },
  video: { label: "Video", icon: "video" },
};

export const BLOCK_LABEL: Record<BlockData["type"], string> = { slide: "Slide", video: "Video", mcq: "Multiple choice", written: "Written question" };

/** The icon family of a part: questions look like quizzes, videos like videos, slides like lessons. */
export const blockKind = (t: BlockData["type"]): ItemKind => (t === "mcq" || t === "written" ? "quiz" : t === "video" ? "video" : "lesson");

export function newBlock(type: BlockData["type"]): BlockData {
  if (type === "slide") return { type, title: "", body: "" };
  if (type === "video") return { type, title: "", url: "", note: "" };
  if (type === "mcq") return { type, question: "", options: ["", "", "", ""], correct: 0, explain: "" };
  return { type: "written", question: "", markScheme: "", marks: 2 };
}

/** The address of a Content screen. */
export function contentHref(params: { path?: string; view?: "routes"; item?: number; route?: number }): string {
  const q = new URLSearchParams();
  if (params.path) q.set("path", params.path);
  if (params.view) q.set("view", params.view);
  if (params.item) q.set("item", String(params.item));
  if (params.route) q.set("route", String(params.route));
  const s = q.toString();
  return `/tutor/content${s ? `?${s}` : ""}`;
}
