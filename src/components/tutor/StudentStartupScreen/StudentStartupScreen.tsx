"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import Button from "@/components/ui/Button";
import StartupOptionsManager from "@/components/tutor/StartupOptionsManager";
import StartupSteps from "@/components/tutor/StartupSteps";
import StartupStepPlaceholder from "@/components/tutor/StartupStepPlaceholder";
import DiagnosticQuiz from "@/components/tutor/DiagnosticQuiz";
import DiagnosticIntroScreen from "@/components/tutor/DiagnosticIntroScreen";
import type { DiagnosticIntroContent, DiagnosticQuestion, StartupCategory, StartupOption } from "@/types";
import styles from "./StudentStartupScreen.module.css";

const LEVELS = ["GCSE", "IGCSE / O-level", "A-level"];
const TIERS = ["Foundation", "Higher", "Not sure yet"];

/** The steps in the bar at the top. Step 2 is the form, step 3 the diagnostic intro; steps 4 and 5 are placeholders. */
const STEPS = [
  { number: 2, label: "About you" },
  { number: 3, label: "Diagnostic" },
  { number: 4, label: "Your group" },
  { number: 5, label: "Learning map" },
];

/** The four dropdowns tutors can edit. */
const DROPDOWNS: { category: StartupCategory; label: string; title: string; noun: string }[] = [
  { category: "subject", label: "Subject", title: "Subjects", noun: "subject" },
  { category: "exam_board", label: "Exam board", title: "Exam boards", noun: "exam board" },
  { category: "school_year", label: "School year", title: "School years", noun: "school year" },
  { category: "target_grade", label: "Target grade", title: "Target grades", noun: "target grade" },
];

/** A row of pill-shaped radio choices. */
function Choices({ legend, name, options, value, onChange }: { legend: string; name: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{legend}</legend>
      <div className={styles.choices}>
        {options.map((o) => (
          <label key={o} className={`${styles.choice} ${value === o ? styles.chosen : ""}`}>
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className={styles.radio} />
            <span className={styles.dot} aria-hidden="true" />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Select({ label, id, options, value, onChange, onManage }: { label: string; id: string; options: StartupOption[]; value: string; onChange: (v: string) => void; onManage: () => void }) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        <button type="button" className={styles.manage} onClick={onManage} aria-label={`Manage ${label.toLowerCase()} choices`}>
          <Settings2 size={13} aria-hidden="true" /> Edit
        </button>
      </div>
      <select id={id} className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}

/** The "Student Start-up Screen" (tutor version): collects the student's level, subject, exam board and target. */
export default function StudentStartupScreen({ initialOptions, introContent, questions }: { initialOptions: StartupOption[]; introContent: DiagnosticIntroContent; questions: DiagnosticQuestion[] }) {
  const [options, setOptions] = useState(initialOptions);
  const [picked, setPicked] = useState<Partial<Record<StartupCategory, string>>>({});
  const [managing, setManaging] = useState<StartupCategory | null>(null);
  const [level, setLevel] = useState("GCSE");
  const [tier, setTier] = useState("Higher");
  const [step, setStep] = useState(2);
  const [intro, setIntro] = useState(introContent);
  const [quizOpen, setQuizOpen] = useState(false);

  const optionsOf = (c: StartupCategory) => options.filter((o) => o.category === c);
  // A choice that was deleted falls back to the first one left.
  const valueOf = (c: StartupCategory) => {
    const list = optionsOf(c);
    return String(list.find((o) => String(o.id) === picked[c])?.id ?? list[0]?.id ?? "");
  };
  const current = DROPDOWNS.find((d) => d.category === managing);

  // Not a <form>: the choices manager has its own forms and forms cannot be nested.
  const onContinue = () => setStep(3);
  const subject = optionsOf("subject").find((o) => String(o.id) === valueOf("subject"))?.label ?? "";

  const formScreen = (
    <div className={`${styles.layout} ${current ? styles.withPanel : ""}`}>
      <div className={styles.screen}>
        <h2 className={styles.title}>Tell us about you</h2>
        <p className={styles.subtitle}>We use this to pick the right diagnostic and the right group.</p>

        <div className={styles.card}>
          <Choices legend="Which level are you studying?" name="level" options={LEVELS} value={level} onChange={setLevel} />
          <div className={styles.grid}>
            {DROPDOWNS.map((d) => (
              <Select key={d.category} label={d.label} id={`startup-${d.category}`} options={optionsOf(d.category)} value={valueOf(d.category)}
                onChange={(v) => setPicked((p) => ({ ...p, [d.category]: v }))} onManage={() => setManaging(d.category)} />
            ))}
          </div>
          <Choices legend="Tier" name="tier" options={TIERS} value={tier} onChange={setTier} />
        </div>

        <div className={styles.actions}>
          <Button href="/tutor/dashboard/students" variant="outline" size="md">Back</Button>
          <button type="button" className={styles.continue} onClick={onContinue}>Continue to diagnostic</button>
        </div>
      </div>

      {/* Opens on the right of the form, in the free space. */}
      {current && (
        <div className={styles.side}>
          <StartupOptionsManager
            key={current.category}
            category={current.category}
            title={current.title}
            noun={current.noun}
            options={optionsOf(current.category)}
            onAdded={(o) => setOptions((all) => [...all, o])}
            onRenamed={(o) => setOptions((all) => all.map((x) => (x.id === o.id ? o : x)))}
            onDeleted={(id) => setOptions((all) => all.filter((x) => x.id !== id))}
            onClose={() => setManaging(null)}
          />
        </div>
      )}
    </div>
  );

  // The questions for what was chosen on the form (a tier of "Not sure yet" accepts every tier), at most the number set on the intro card.
  const quizQuestions = questions
    .filter((q) => q.level === level && String(q.subjectId) === valueOf("subject") && (tier === "Not sure yet" || q.tier === "Any" || q.tier === tier))
    .slice(0, intro.questions);
  const quizHeading = `${level} ${subject}${tier === "Not sure yet" ? "" : ` · ${tier}`}`;
  const stepTitle = STEPS.find((s) => s.number === step)?.label ?? "";

  return (
    <div>
      <StartupSteps steps={STEPS} current={step} onSelect={(n) => { setQuizOpen(false); setStep(n); }} />
      {step === 2 && formScreen}
      {step === 3 && quizOpen && (
        <DiagnosticQuiz
          questions={quizQuestions}
          heading={quizHeading}
          onExit={() => setQuizOpen(false)}
          builderHref="/tutor/dashboard/tutor-work/diagnostic-questions"
        />
      )}
      {step === 3 && !quizOpen && (
        <DiagnosticIntroScreen
          initialContent={intro}
          onSaved={setIntro}
          level={level}
          subject={subject}
          onStart={() => setQuizOpen(true)}
          onBack={() => setStep(2)}
        />
      )}
      {step !== 2 && step !== 3 && <StartupStepPlaceholder number={step} title={stepTitle} />}
    </div>
  );
}
