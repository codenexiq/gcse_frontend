import type { ReactNode } from "react";

/** A laptop drawing. Its screen shows a small picture of the platform (scaled with the laptop). */
export default function Laptop({ children }: { children: ReactNode }) {
  return (
    <div className="laptop" role="img" aria-label="The Educate Cloud platform on a laptop">
      <div className="lid">
        <div className="scr">{children}</div>
      </div>
      <div className="base" />
    </div>
  );
}
