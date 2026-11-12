"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LearningMap from "@/components/adm/tutor/students/LearningMap";
import ReportPanel from "@/components/adm/tutor/students/ReportPanel";
import WhatTheySee from "@/components/adm/tutor/students/WhatTheySee";
import Chip from "@/components/adm/ui/Chip";
import Field from "@/components/adm/ui/Field";
import Icon from "@/components/adm/ui/Icon";
import Kpi from "@/components/adm/ui/Kpi";
import SubjectBadge from "@/components/adm/ui/SubjectBadge";
import { useToast } from "@/components/adm/ui/Toast";
import { useAutosave } from "@/hooks/useAutosave";
import { send } from "@/lib/api";
import { first, fmtTime, shortDate } from "@/lib/format";
import type { StudentProfileData, TopicStatus } from "@/types/tutor";

/** One student's subject, as the tutor sees it: grades, learning map, recent work, sessions and what the student sees. */
export default function StudentProfile({ initial }: { initial: StudentProfileData }) {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState(initial);
  const [reportOpen, setReportOpen] = useState(false);
  const e = data.enrolment;

  const saveGrades = useAutosave((grades: { current: string; target: string }) => send("PUT", `/tutor/students/${e.id}`, grades));

  function setGrade(patch: Partial<{ current: string; target: string }>) {
    const next = { current: e.current, target: e.target, ...patch };
    setData((d) => ({ ...d, enrolment: { ...d.enrolment, ...patch } }));
    saveGrades(next, true);
  }

  async function setGroup(groupId: number | null) {
    setData((d) => ({ ...d, enrolment: { ...d.enrolment, groupId } }));
    try {
      await send("PUT", `/tutor/students/${e.id}`, { groupId });
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be saved.");
      router.refresh();
    }
  }

  async function cycle(topicId: number) {
    try {
      const { status } = await send<{ status: TopicStatus }>("POST", `/tutor/students/${e.id}/topics/${topicId}/cycle`);
      setData((d) => {
        const strands = d.strands.map((s) => ({ ...s, topics: s.topics.map((t) => (t.id === topicId ? { ...t, status } : t)) }));
        const all = strands.flatMap((s) => s.topics);
        return { ...d, strands, stats: { ...d.stats, mastered: all.filter((t) => t.status === "M").length } };
      });
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be saved.");
    }
  }

  async function message() {
    try {
      const { id } = await send<{ id: number }>("POST", "/tutor/messages/open", { studentId: e.studentId });
      router.push(`/tutor/messages?thread=${id}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "The conversation could not be opened.");
    }
  }

  return (
    <div className="stack">
      <div className="row between">
        <Link href="/tutor/students" className="btn ghost sm">‹ All students</Link>
        <div className="row">
          <button type="button" className="btn sm" onClick={() => void message()}>
            <Icon name="message" />
            Message
          </button>
          <button type="button" className="btn primary sm" onClick={() => setReportOpen(true)}>
            <Icon name="notes" />
            Monthly report
          </button>
        </div>
      </div>

      <section className="card prof-head">
        <SubjectBadge icon={e.subject.icon} color={e.subject.color} size="lg" />
        <div className="stack grow">
          <h1>{e.studentName}</h1>
          <span className="muted">
            {e.year} · {e.pathName}
            {e.board ? ` · ${e.board}` : ""} · {e.planName} plan
          </span>
        </div>
        <div className="prof-grades">
          <Field id="pg-cur" label="Current grade">
            <select id="pg-cur" value={e.current} onChange={(ev) => setGrade({ current: ev.target.value })}>
              <option value="">–</option>
              {data.grades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field id="pg-tgt" label="Target grade">
            <select id="pg-tgt" value={e.target} onChange={(ev) => setGrade({ target: ev.target.value })}>
              <option value="">–</option>
              {data.grades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>
      <p className="small muted privacy">
        <Icon name="lock" /> Contact details and login information are held by the admin team. Message the student here, or ask the admin team to contact parents.
      </p>

      {reportOpen && <ReportPanel enrolmentId={e.id} onClose={() => setReportOpen(false)} />}

      <div className="kpis">
        <Kpi icon="target" value={`${data.stats.mastered}/${data.stats.all}`} label="topics mastered" />
        <Kpi icon="star" value={data.stats.diagnostic} label="diagnostic" />
        <Kpi icon="clock" value={data.stats.minutesThisWeek} label="mins this week" />
        <Kpi icon="quiz" value={data.stats.quizzes} label="quizzes done" />
      </div>

      <div className="grid2">
        <div className="stack">
          <LearningMap strands={data.strands} misconceptions={data.misconceptions} onCycle={(id) => void cycle(id)} />
          <section className="card">
            <h2>
              <Icon name="chart" /> Recent work
            </h2>
            {data.recent.length ? (
              <ul className="plain">
                {data.recent.map((r, i) => (
                  <li className="row between" key={i}>
                    <span>
                      {r.title} <span className="small muted">· {fmtTime(r.at)}</span>
                    </span>
                    <Chip tone={r.pct >= 70 ? "c-navy" : "c-pink"}>
                      {r.pct}% · {r.pct >= 70 ? "Mastered" : "Needs work"}
                    </Chip>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">Nothing yet.</p>
            )}
          </section>
        </div>
        <div className="stack">
          <WhatTheySee firstName={first(e.studentName)} groupId={e.groupId} groups={data.groups} onGroup={(id) => void setGroup(id)} />
          <section className="card">
            <h2>
              <Icon name="calendar" /> Sessions
            </h2>
            {data.sessions.length ? (
              <ul className="plain">
                {data.sessions.map((l) => (
                  <li key={l.id}>
                    <strong>{shortDate(l.date)}</strong> · {l.topicName}
                    {!l.present && (
                      <>
                        {" · "}
                        <Chip tone="c-pink">Absent</Chip>
                      </>
                    )}
                    {l.note && <div className="small muted">{l.note}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">No logged sessions yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
