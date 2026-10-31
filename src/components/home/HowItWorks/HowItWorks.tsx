"use client";

import { motion } from "framer-motion";
import { ListChecks, PenLine, Target } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import StepCard from "../StepCard";
import styles from "./HowItWorks.module.css";

const steps = [
  { icon: <Target />, title: "Pick a topic", text: "Choose the subject and topic you want to work on." },
  { icon: <PenLine />, title: "Add your items", text: "Write down what to revise, with notes if you like." },
  { icon: <ListChecks />, title: "Keep on track", text: "See everything in one tidy list and revise with confidence." },
];

export default function HowItWorks() {
  return (
    <section className={styles.section}>
      <SectionHeading
        eyebrow="How it works"
        title="Three simple steps"
        subtitle="From idea to organised revision in under a minute."
      />
      <div className={styles.steps}>
        {/* The line between the steps draws itself as it scrolls into view. */}
        <motion.div
          className={styles.line}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          aria-hidden="true"
        />
        {steps.map((step, i) => (
          <StepCard key={step.title} number={i + 1} delay={i * 0.25} {...step} />
        ))}
      </div>
    </section>
  );
}
