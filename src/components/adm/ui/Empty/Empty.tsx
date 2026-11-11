import type { ReactNode } from "react";
import Icon from "@/components/adm/ui/Icon";

/** A card that says there is nothing here yet. */
export default function Empty({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="card empty">
      <Icon name="book" className="ico-lg" />
      <h3>{title}</h3>
      <p className="muted">{text}</p>
      {children}
    </div>
  );
}
