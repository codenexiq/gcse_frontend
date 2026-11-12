"use client";

import { useRouter } from "next/navigation";
import Empty from "@/components/adm/ui/Empty";
import { useToast } from "@/components/adm/ui/Toast";
import { send } from "@/lib/api";
import type { ViewAsData } from "@/types/student";

type Panel = "tutor" | "student";
const WORD: Record<Panel, string> = { tutor: "teacher", student: "student" };

function useChoose(panel: Panel) {
  const router = useRouter();
  const toast = useToast();
  return async (userId: number | null) => {
    try {
      await send("POST", "/admin/view-as", { panel, userId });
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be done.");
    }
  };
}

/** Shown to an administrator who opens the Teacher or Student panel before choosing whose panel to look at. */
export function ViewAsPicker({ panel, options }: { panel: Panel; options: ViewAsData["options"] }) {
  const choose = useChoose(panel);
  if (options.length === 0) return <Empty title={`No ${WORD[panel]}s yet`} text={`Add a ${WORD[panel]} in Admin > People first.`} />;
  return (
    <section className="card stack">
      <h2>Which {WORD[panel]}?</h2>
      <p className="muted small">You see this panel exactly as they do, and can use it. Pick a {WORD[panel]} to look at.</p>
      <div className="stack">
        {options.map((o) => (
          <button key={o.id} type="button" className="list-btn" onClick={() => void choose(o.id)}>
            <strong>{o.name}</strong>
            <span className="small muted">{o.detail || "Nothing assigned yet"}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/** The strip above the panel while an administrator is looking at someone's panel. */
export function ViewAsBar({ panel, current }: { panel: Panel; current: NonNullable<ViewAsData["current"]> }) {
  const choose = useChoose(panel);
  return (
    <div className="tip warn row between">
      <span>
        Viewing the {WORD[panel]} panel as <strong>{current.name}</strong>
      </span>
      <button type="button" className="btn sm" onClick={() => void choose(null)}>
        Choose someone else
      </button>
    </div>
  );
}
