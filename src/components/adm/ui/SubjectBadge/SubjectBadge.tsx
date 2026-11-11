import type { CSSProperties } from "react";
import Icon from "@/components/adm/ui/Icon";

/** The coloured square with a subject's icon. */
export default function SubjectBadge({ icon, color, size }: { icon: string; color: string; size?: "sm" | "lg" | "xl" }) {
  return (
    <span className={`sbadge${size ? ` ${size}` : ""}`} style={{ "--sc": color } as CSSProperties}>
      <Icon name={icon} />
    </span>
  );
}
