import type { ReactNode } from "react";
import type { DiagramPosition } from "@/types";
import styles from "./QuestionLayout.module.css";

interface Props {
  /** Where the picture sits next to the question text. A quiz saved before this existed has none, which means below. */
  position?: DiagramPosition;
  /** The diagram (an <img>), or nothing when the question has none. */
  picture?: ReactNode;
  /** The question text. */
  children: ReactNode;
}

/** A question's text with its diagram above, below, to the left or to the right of it. On a narrow screen the sides stack. */
export default function QuestionLayout({ position = "below", picture, children }: Props) {
  if (!picture) return <>{children}</>;
  const pictureFirst = position === "above" || position === "left";
  const side = position === "left" || position === "right";
  return (
    <div className={`${styles.layout} ${side ? styles.side : ""}`}>
      {pictureFirst && <div className={styles.picture}>{picture}</div>}
      <div className={styles.text}>{children}</div>
      {!pictureFirst && <div className={styles.picture}>{picture}</div>}
    </div>
  );
}
