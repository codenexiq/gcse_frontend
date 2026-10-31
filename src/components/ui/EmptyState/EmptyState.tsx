import { Inbox, type LucideIcon } from "lucide-react";
import FadeIn from "../FadeIn";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  text?: string;
}

export default function EmptyState({ icon: Icon = Inbox, title, text }: EmptyStateProps) {
  return (
    <FadeIn>
      <div className={styles.box}>
        <Icon size={36} aria-hidden="true" />
        <h3>{title}</h3>
        {text && <p>{text}</p>}
      </div>
    </FadeIn>
  );
}
