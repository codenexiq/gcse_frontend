"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import { useToast } from "@/components/adm/ui/Toast";
import { send } from "@/lib/api";
import type { SignupOptions } from "@/types/student";

const STEPS = ["Level", "Plan", "Subjects", "Your details"];
const NOT_SURE = "Not sure";

interface Pick {
  tier: string;
  board: string;
  current: string;
  target: string;
}

/**
 * The sign-up wizard: level, plan, subjects (each with tier, exam board and grades), then the student's and parent's details.
 * It makes the account, enrols the student in the chosen subjects, signs them in and opens their dashboard to start the diagnostic.
 */
export default function SignupWizard({ options }: { options: SignupOptions }) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0); // 0 is the welcome screen
  const [level, setLevel] = useState(options.levels.find((l) => l.id === "gcse")?.id ?? options.levels[0]?.id ?? "");
  const [plan, setPlan] = useState(options.plans.find((p) => p.popular)?.id ?? options.plans[0]?.id ?? "");
  const [picked, setPicked] = useState<Record<string, Pick>>({});
  const [f, setF] = useState({ name: "", year: "", email: "", password: "", pName: "", pEmail: "", pPhone: "", consent: false, rec: true });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lv = options.levels.find((l) => l.id === level);
  if (!lv) return <p className="muted">Sign-up is not open yet. Please try again later.</p>;
  const subjects = options.subjects.filter((s) => s.levels.includes(level));
  const set = (patch: Partial<typeof f>) => setF({ ...f, ...patch });
  const canNext = (step === 1 && level) || (step === 2 && plan) || (step === 3 && Object.keys(picked).length > 0);

  function toggle(id: string) {
    const next = { ...picked };
    if (next[id]) delete next[id];
    else next[id] = { tier: lv!.tiers[lv!.tiers.length - 1] ?? "", board: lv!.boards[0] ?? "", current: NOT_SURE, target: NOT_SURE };
    setPicked(next);
  }
  const patchPick = (id: string, patch: Partial<Pick>) => setPicked({ ...picked, [id]: { ...picked[id], ...patch } });

  async function submit() {
    const bad = !f.name.trim()
      ? "Add the student's name."
      : !/^\S+@\S+\.\S+$/.test(f.email)
        ? "Add a valid student email."
        : f.password.length < 10 || !/[a-z]/.test(f.password) || !/[A-Z]/.test(f.password) || !/[0-9]/.test(f.password)
          ? "Use a password of at least 10 characters with a lowercase letter, an uppercase letter and a number."
          : !f.pName.trim() || !/^\S+@\S+\.\S+$/.test(f.pEmail)
            ? "Add the parent's name and a valid email."
            : !f.consent
              ? "Tick to agree to the terms."
              : "";
    if (bad) return setError(bad);
    setError("");
    setBusy(true);
    try {
      await send("POST", "/auth/signup", {
        level,
        plan,
        subjects: Object.entries(picked).map(([id, p]) => ({ id, tier: p.tier, board: p.board === NOT_SURE ? "" : p.board, current: p.current === NOT_SURE ? "" : p.current, target: p.target === NOT_SURE ? "" : p.target })),
        name: f.name,
        email: f.email,
        password: f.password,
        year: f.year || lv!.years[lv!.years.length - 1] || "",
        parent: { name: f.pName, email: f.pEmail, phone: f.pPhone },
        consent: f.consent,
        recordingOk: f.rec,
      });
      toast(`Welcome, ${f.name.trim().split(/\s+/)[0]}! Start with your diagnostic.`);
      router.push("/student");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That could not be saved.");
      setBusy(false);
    }
  }

  const planName = options.plans.find((p) => p.id === plan)?.name ?? "";
  if (step === 0)
    return (
      <section className="hero card">
        <div className="stack">
          <span className="eyebrow">Educate Cloud</span>
          <h1>Find your gaps. Follow your plan. Learn with a real teacher.</h1>
          <p className="lead">A quick diagnostic finds your gaps, a personal learning map shows you what to do next, and real teachers help you in small live classes.</p>
          <div className="row">
            <button type="button" className="btn primary lg" onClick={() => setStep(1)}>
              Get started
            </button>
            <Link href="/login" className="btn ghost lg">
              I already have an account
            </Link>
            <span className="small muted">Sign-up takes about 3 minutes</span>
          </div>
        </div>
        <ol className="how">
          {[
            ["target", "Pick your level and plan"],
            ["quiz", "Take a short diagnostic"],
            ["route", "Follow your learning map"],
            ["users", "Learn with a real teacher"],
          ].map(([icon, text], i) => (
            <li key={text}>
              <Icon name={icon} />
              <span>
                <b>{i + 1}.</b> {text}
              </span>
            </li>
          ))}
        </ol>
      </section>
    );
  return (
    <>
      <ol className="stepper" aria-label="Sign-up progress">
        {STEPS.map((label, i) => (
          <li key={label} className={i + 1 < step ? "done" : i + 1 === step ? "now" : ""} aria-current={i + 1 === step ? "step" : undefined}>
            <span className="dot">{i + 1 < step ? "✓" : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <div className="narrow">
          <h1>What are you studying for?</h1>
          <p className="muted">Choose your level. You can add more subjects in a moment.</p>
          <div className="pick-grid">
            {options.levels.map((l) => (
              <button
                key={l.id}
                type="button"
                className="pick"
                aria-pressed={level === l.id}
                onClick={() => {
                  if (level !== l.id) setPicked({});
                  setLevel(l.id);
                }}
              >
                <span className="pick-ic">
                  <Icon name={l.id === "ks3" ? "book" : l.id === "alevel" ? "star" : "target"} />
                </span>
                <strong>{l.name}</strong>
                <span className="small muted">{l.years.join(", ")}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wide">
          <h1>Choose your plan</h1>
          <p className="muted">{lv.name} plans. Prices are per subject. You can change plan at any time.</p>
          <div className="plans">
            {options.plans.map((p) => (
              <div key={p.id} className={`plan${p.popular ? " popular" : ""}${plan === p.id ? " on" : ""}`} onClick={() => setPlan(p.id)}>
                {p.popular && <span className="ribbon">Most popular</span>}
                <strong>{p.name}</strong>
                <span className="small muted">{p.tagline}</span>
                <span className="price">{p.prices[level] || "£—"}</span>
                <ul>
                  {p.features.map((x) => (
                    <li key={x}>
                      <Icon name="check" />
                      {x}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`btn ${plan === p.id ? "primary" : "ghost"}`}
                  aria-pressed={plan === p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlan(p.id);
                  }}
                >
                  {plan === p.id ? "Selected" : `Choose ${p.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="narrow">
          <h1>Which subjects?</h1>
          <p className="muted">Pick one or more. Each subject gets its own diagnostic and learning map.</p>
          <div className="pick-grid sm">
            {subjects.map((s) => (
              <button key={s.id} type="button" className="pick" aria-pressed={Boolean(picked[s.id])} onClick={() => toggle(s.id)}>
                <SubjectBadge icon={s.icon} color={s.color} size="lg" />
                <strong>{s.name}</strong>
                {picked[s.id] && (
                  <span className="tick">
                    <Icon name="check" />
                  </span>
                )}
              </button>
            ))}
          </div>
          {Object.entries(picked).map(([id, x]) => {
            const s = options.subjects.find((y) => y.id === id)!;
            return (
              <div className="card sub-set" key={id}>
                <div className="row">
                  <SubjectBadge icon={s.icon} color={s.color} />
                  <h3>
                    {lv.short} {s.name}
                  </h3>
                </div>
                <div className="form-grid">
                  {lv.tiers.length > 0 && (
                    <Field id={`tier-${id}`} label="Tier">
                      <select id={`tier-${id}`} value={x.tier} onChange={(e) => patchPick(id, { tier: e.target.value })}>
                        {lv.tiers.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                  {lv.boards.length > 0 && (
                    <Field id={`board-${id}`} label="Exam board">
                      <select id={`board-${id}`} value={x.board} onChange={(e) => patchPick(id, { board: e.target.value })}>
                        {[...lv.boards, NOT_SURE].map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                  <Field id={`cur-${id}`} label="Current grade">
                    <select id={`cur-${id}`} value={x.current} onChange={(e) => patchPick(id, { current: e.target.value })}>
                      {[NOT_SURE, ...lv.grades].map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </Field>
                  <Field id={`tgt-${id}`} label="Target grade">
                    <select id={`tgt-${id}`} value={x.target} onChange={(e) => patchPick(id, { target: e.target.value })}>
                      {[NOT_SURE, ...lv.grades].map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {step === 4 && (
        <form
          className="narrow stack"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <h1>Your details</h1>
          <p className="muted">Your parent or guardian gets progress reports and lesson updates.</p>
          <div className="card stack">
            <h3>
              <Icon name="users" /> Student
            </h3>
            <div className="form-grid">
              <Field id="su-name" label="Full name">
                <input id="su-name" type="text" autoComplete="name" maxLength={100} value={f.name} onChange={(e) => set({ name: e.target.value })} />
              </Field>
              <Field id="su-year" label="Year group">
                <select id="su-year" value={f.year || lv.years[lv.years.length - 1] || "Other"} onChange={(e) => set({ year: e.target.value })}>
                  {(lv.years.length ? lv.years : ["Other"]).map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </Field>
              <Field id="su-email" label="Email">
                <input id="su-email" type="email" autoComplete="email" maxLength={254} value={f.email} onChange={(e) => set({ email: e.target.value })} />
              </Field>
              <Field id="su-pw" label="Password" hint="10+ characters, with upper and lower case and a number">
                <input id="su-pw" type="password" autoComplete="new-password" maxLength={72} value={f.password} onChange={(e) => set({ password: e.target.value })} />
              </Field>
            </div>
          </div>
          <div className="card stack">
            <h3>
              <Icon name="shield" /> Parent or guardian
            </h3>
            <div className="form-grid">
              <Field id="su-pn" label="Full name">
                <input id="su-pn" type="text" maxLength={100} value={f.pName} onChange={(e) => set({ pName: e.target.value })} />
              </Field>
              <Field id="su-pe" label="Email">
                <input id="su-pe" type="email" maxLength={254} value={f.pEmail} onChange={(e) => set({ pEmail: e.target.value })} />
              </Field>
              <Field id="su-pp" label="Phone or WhatsApp">
                <input id="su-pp" type="tel" maxLength={30} value={f.pPhone} onChange={(e) => set({ pPhone: e.target.value })} />
              </Field>
            </div>
            <label className="choice">
              <input type="checkbox" checked={f.consent} onChange={(e) => set({ consent: e.target.checked })} /> I agree to the terms and the student learning agreement.
            </label>
            <label className="choice">
              <input type="checkbox" checked={f.rec} onChange={(e) => set({ rec: e.target.checked })} /> Live lessons may be recorded for safeguarding and revision.
            </label>
          </div>
          <div className="card summary-bar">
            <span>
              {lv.name} · {planName} · {Object.keys(picked).map((id) => options.subjects.find((s) => s.id === id)?.name).join(", ")}
            </span>
          </div>
          {error && (
            <p className="err center" role="alert">
              {error}
            </p>
          )}
          <div className="row between su-nav">
            <button type="button" className="btn ghost" onClick={() => setStep(3)}>
              Back
            </button>
            <button type="submit" className="btn primary lg" disabled={busy}>
              Create my account
            </button>
          </div>
        </form>
      )}

      {step < 4 && (
        <div className="row between su-nav">
          {step === 1 ? (
            <Link href="/login" className="btn ghost">
              Cancel
            </Link>
          ) : (
            <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button
            type="button"
            className="btn primary lg"
            disabled={!canNext}
            onClick={() => {
              setStep(step + 1);
              window.scrollTo(0, 0);
            }}
          >
            Continue
          </button>
        </div>
      )}
    </>
  );
}
