"use client";

import { Agentation } from "agentation";

/** Agentation: click on anything in the page and write a note about it, to hand to a coding agent. Shown in development only. */
export default function DevFeedback() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Agentation />;
}
