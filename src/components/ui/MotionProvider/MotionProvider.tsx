"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/** Wraps the app so every animation is skipped for visitors who turned on "reduce motion". */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
