"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";

/** A number that counts up from 0 when it scrolls into view (and again if `value` changes). */
export default function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 1.6, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, value, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}
