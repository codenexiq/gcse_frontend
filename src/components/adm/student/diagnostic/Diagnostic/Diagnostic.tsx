"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Chip from "@/components/adm/ui/Chip";
import Icon from "@/components/adm/ui/Icon";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import { useToast } from "@/components/adm/ui/Toast";
import { useTypeset } from "@/hooks/useTypeset";
import { send } from "@/lib/api";
import { topicIcon } from "@/lib/icons";
import type { DiagnosticData, DiagnosticResult } from "@/types/student";

const CHOICES: [string, string][] = [
  ["P", "Confident"],
  ["W", "Not sure"],
  ["N", "Not learned"],
];
const LETTERS = "ABCD";

/**
 * The first-time diagnostic for one subject. Where there are questions: one question at a time, then results (score, common
 * mistakes, topics that need work). Otherwise the student rates how confident they are with each topic. Either way it becomes their learning map.
 */
export default function Diagnostic({ data, plan }: { data: DiagnosticData; plan: { name: string; live: boolean } }) {
  const router = useRouter();
  const toast = useToast();
  const box = useRef<HTMLDivElement>(null);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | "nl">>({});
  const [conf, setConf] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const home = `/student?enrolment=${data.enrolmentId}`;
  useTypeset(box, [qi, answers[qi], result]);

  async function finish() {
    setBusy(true);
    try {
      const body = data.mode === "quiz" ? { answers } : { conf };
      setResult(await send<DiagnosticResult>("POST", `/student/enrolments/${data.enrolmentId}/diagnostic`, body));
      window.scrollTo(0, 0);
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  const head = (
    <div className="row">
      <SubjectBadge icon={data.subject.icon} color={data.subject.color} size={result ? "lg" : undefined} />
      <div>
        <span className="label muted">{result ? "Your results" : "Diagnostic"}</span>
        <h1 style={{ margin: 0 }}>{data.pathName}</h1>
      </div>
    </div>
  );

  if (result) {
    return (
      <div className="narrow stack" ref={box}>
        {head}
        <div className="card">
          {result.score !== null ? (
            <>
              <div className="big">
                {result.score}/{result.total}
              </div>
              <p className="muted">on the diagnostic</p>
            </>
          ) : (
            <p>Thanks! Your learning map is ready.</p>
          )}
          {result.misconceptions.length > 0 && (
            <div className="stack">
              <span className="label muted">Common mistakes we spotted</span>
              <div className="row">
                {result.misconceptions.map((m) => (
                  <Chip key={m} tone="c-pink">
                    {m}
                  </Chip>
                ))}
              </div>
            </div>
          )}
          {result.needsWork.length > 0 && (
            <div className="stack">
              <span className="label muted">Needs work</span>
              <div className="row">
                {result.needsWork.map((t) => (
                  <Chip key={t} tone="c-pink">
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          )}
          {result.notLearned.length > 0 && (
            <div className="stack">
              <span className="label muted">Not learned yet</span>
              <div className="row">
                {result.notLearned.slice(0, 10).map((t) => (
                  <Chip key={t} tone="c-out">
                    {t}
                  </Chip>
                ))}
                {result.notLearned.length > 10 && <Chip tone="c-out">+{result.notLearned.length - 10} more</Chip>}
              </div>
            </div>
          )}
        </div>
        <div className="tip">
          <Icon name="users" />
          {plan.live ? "Your teacher will look at these results and add you to the right class. You will get a message when it is confirmed." : "Your learning map shows what to do next. Start with the first task."}
        </div>
        <div className="row">
          <button
            type="button"
            className="btn primary lg"
            onClick={() => {
              router.push(home);
              router.refresh();
            }}
          >
            Go to my learning map
          </button>
        </div>
      </div>
    );
  }

  if (data.mode === "conf") {
    return (
      <div className="narrow stack">
        {head}
        <p className="muted">How confident are you with each topic? Be honest: this builds your learning map. Topics you skip count as not learned.</p>
        {data.strands.map((st) => (
          <div className="card stack" key={st.id}>
            <h3 className="row">
              <Icon name={topicIcon(st.name)} />
              {st.name}
            </h3>
            {st.topics.map((t) => (
              <div className="conf-row" key={t.id}>
                <span>{t.name}</span>
                <div className="seg sm" role="group" aria-label={t.name}>
                  {CHOICES.map(([v, label]) => (
                    <button key={v} type="button" aria-pressed={conf[t.id] === v} onClick={() => setConf({ ...conf, [t.id]: v })}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
        <div className="row between">
          <Link href={home} className="btn ghost">
            Cancel
          </Link>
          <button type="button" className="btn primary lg" disabled={busy} onClick={() => void finish()}>
            See my learning map
          </button>
        </div>
      </div>
    );
  }

  const q = data.questions[qi];
  const a = answers[qi];
  const last = qi === data.questions.length - 1;
  return (
    <div className="narrow stack" ref={box}>
      {head}
      <div className="pbar">
        <i style={{ width: `${Math.round(((qi + 1) / data.questions.length) * 100)}%` }} />
      </div>
      <span className="small muted">
        Question {qi + 1} of {data.questions.length}
        {q.topic ? ` · ${q.topic}` : ""}
      </span>
      <div className="slide-card">
        <h2 className="q">{q.q}</h2>
        <div className="opts">
          {q.o.map((o, k) => (
            <button key={k} type="button" className={`opt${a === k ? " sel" : ""}`} onClick={() => setAnswers({ ...answers, [qi]: k })}>
              <span className="letter">{LETTERS[k]}</span>
              <span>{o}</span>
            </button>
          ))}
          <button type="button" className={`opt nl${a === "nl" ? " sel" : ""}`} onClick={() => setAnswers({ ...answers, [qi]: "nl" })}>
            <span className="letter">?</span>
            <span>I have not learned this yet</span>
          </button>
        </div>
      </div>
      <div className="row between">
        {qi === 0 ? (
          <Link href={home} className="btn ghost">
            Cancel
          </Link>
        ) : (
          <button type="button" className="btn ghost" onClick={() => setQi(qi - 1)}>
            Back
          </button>
        )}
        <button type="button" className="btn primary" disabled={a === undefined || busy} onClick={() => (last ? void finish() : setQi(qi + 1))}>
          {last ? "See my results" : "Next"}
        </button>
      </div>
    </div>
  );
}
