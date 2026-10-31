import type { ReactNode } from "react";
import HoverCard from "@/components/ui/HoverCard";
import styles from "./FeatureCard.module.css";

interface FeatureCardProps {
  /** A Lucide element, e.g. <Lock /> */
  icon: ReactNode;
  title: string;
  text: string;
  delay?: number;
  /** Spans two columns in the grid. */
  wide?: boolean;
}

export default function FeatureCard({ icon, title, text, delay = 0, wide = false }: FeatureCardProps) {
  return (
    <div className={`${styles.cell} ${wide ? styles.wide : ""}`}>
      <HoverCard delay={delay} className={styles.card}>
        <span className={styles.icon}>{icon}</span>
        <h3>{title}</h3>
        <p>{text}</p>
      </HoverCard>
    </div>
  );
}
