export { ICON_PATHS } from "./paths";

/** The icon for a topic, chosen from its strand and topic names. */
export function topicIcon(strand: string, topic?: string): string {
  const s = `${strand} ${topic || ""}`.toLowerCase();
  const map: [string, string][] = [
    ["calcul|differen|integra", "calculus"],
    ["number|place value|fraction|indices|standard form|negative", "number"],
    ["algebra|equation|express|function|sequence|proof|quadratic", "algebra"],
    ["ratio|percent|proportion|interest", "ratio"],
    ["geometr|angle|area|pythag|trigon|circle|shape|vector", "geometry"],
    ["probab", "probability"],
    ["statist|data|averag|chart", "statistics"],
    ["energy|power|efficien", "energy"],
    ["electric|circuit|resist|mains", "electricity"],
    ["force|motion|newton|momentum|mechanic|kinemat", "forces"],
    ["wave|spectrum|light|sound", "waves"],
    ["particle|density|state", "particles"],
    ["atom|isotop|radio|nuclear|periodic|bond", "atom"],
    ["magnet|motor", "magnet"],
    ["space|planet|star", "space"],
    ["cell|organis|infection|bioenerg|homeostasis|inherit|ecolog", "cells"],
    ["read|language analysis|structure|literature|poetry|shakespeare", "reading"],
    ["writ", "writing"],
    ["rate|reaction|quantit|chemical|energy change", "chemistry"],
  ];
  for (const [pattern, icon] of map) if (new RegExp(pattern).test(s)) return icon;
  return "book";
}

export const SUBJECT_ICONS = ["maths", "physics", "chemistry", "biology", "english", "computing", "humanities", "languages", "book"];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
