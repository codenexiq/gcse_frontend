"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ChoicePills from "@/components/ui/ChoicePills";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { saveStudentProfile } from "@/services/studentService";
import type { StartupCategory, StartupOption, StudentProfile } from "@/types";
import styles from "./StudentAboutYou.module.css";

const LEVELS = ["GCSE", "IGCSE / O-level", "A-level"];
const TIERS = ["Foundation", "Higher", "Not sure yet"];

const DROPDOWNS: { category: StartupCategory; label: string; key: "subjectId" | "examBoardId" | "schoolYearId" | "targetGradeId" }[] = [
  { category: "subject", label: "Subject", key: "subjectId" },
  { category: "exam_board", label: "Exam board", key: "examBoardId" },
  { category: "school_year", label: "School year", key: "schoolYearId" },
  { category: "target_grade", label: "Target grade", key: "targetGradeId" },
];

interface Props {
  /** First name, for the heading. */
  name: string;
  options: StartupOption[];
  /** What the student chose last time, or null on the very first visit. */
  profile: StudentProfile | null;
}

/** The first screen a student sees after registering or logging in. */
export default function StudentAboutYou({ name, options, profile }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState<string>(profile?.level ?? "GCSE");
  const [tier, setTier] = useState<string>(profile?.tier ?? "Higher");
  const [picked, setPicked] = useState<Partial<Record<(typeof DROPDOWNS)[number]["key"], string>>>({});

  const optionsOf = (c: StartupCategory) => options.filter((o) => o.category === c);
  // The saved choice if it still exists, otherwise the first one in the list.
  const valueOf = (c: StartupCategory, key: (typeof DROPDOWNS)[number]["key"]) => {
    const list = optionsOf(c);
    const wanted = picked[key] ?? String(profile?.[key] ?? "");
    return String(list.find((o) => String(o.id) === wanted)?.id ?? list[0]?.id ?? "");
  };
  const missing = DROPDOWNS.filter((d) => optionsOf(d.category).length === 0);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveStudentProfile({
        level: level as StudentProfile["level"],
        tier: tier as StudentProfile["tier"],
        subjectId: Number(valueOf("subject", "subjectId")),
        examBoardId: Number(valueOf("exam_board", "examBoardId")),
        schoolYearId: Number(valueOf("school_year", "schoolYearId")),
        targetGradeId: Number(valueOf("target_grade", "targetGradeId")),
      });
      router.push("/student/diagnostic");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form className={styles.screen} onSubmit={save} aria-label="About you">
      <h2 className={styles.title}>Tell us about you, {name}</h2>
      <p className={styles.subtitle}>We use this to pick the right diagnostic and the right group.</p>

      <div className={styles.card}>
        <ChoicePills legend="Which level are you studying?" name="level" options={LEVELS} value={level} onChange={setLevel} />
        <div className={styles.grid}>
          {DROPDOWNS.map((d) => (
            <div key={d.key} className={styles.field}>
              <label htmlFor={`about-${d.key}`} className={styles.label}>{d.label}</label>
              <select id={`about-${d.key}`} className={styles.select} value={valueOf(d.category, d.key)} onChange={(e) => setPicked((p) => ({ ...p, [d.key]: e.target.value }))}>
                {optionsOf(d.category).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>
        <ChoicePills legend="Tier" name="tier" options={TIERS} value={tier} onChange={setTier} />
        {missing.length > 0 && <p className={styles.warn}>This screen is not ready yet: a tutor still needs to add choices for {missing.map((m) => m.label.toLowerCase()).join(", ")}.</p>}
      </div>

      <div className={styles.actions}>
        <Button href="/" variant="outline" size="md">Back</Button>
        <button type="submit" className={styles.continue} disabled={busy || missing.length > 0}>
          {busy ? "Saving..." : "Continue to diagnostic"}
        </button>
      </div>
    </form>
  );
}
