"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "./CallToAction.module.css";

const floaters = [
  { Icon: GraduationCap, className: styles.f1, duration: 5 },
  { Icon: BookOpen, className: styles.f2, duration: 6.5 },
  { Icon: Sparkles, className: styles.f3, duration: 4.5 },
];

/** Closing banner with a solid colour and floating icons. */
/** `dashboardHref` is the signed-in user's dashboard (null when logged out). */
export default function CallToAction({ dashboardHref }: { dashboardHref: string | null }) {
  return (
    <motion.section
      className={styles.panel}
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {floaters.map(({ Icon, className, duration }, i) => (
        <motion.span
          key={i}
          className={`${styles.floater} ${className}`}
          animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
          transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <Icon size={34} />
        </motion.span>
      ))}

      <h2>Ready to start revising?</h2>
      <p>Add your first item and turn today&apos;s revision into progress.</p>
      <Button href={dashboardHref ?? "/register"} variant="secondary" iconRight={<ArrowRight />}>
        {dashboardHref ? "Open my dashboard" : "Create your free account"}
      </Button>
    </motion.section>
  );
}
