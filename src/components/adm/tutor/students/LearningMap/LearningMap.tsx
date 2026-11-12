"use client";

import Chip from "@/components/adm/ui/Chip";
import Icon from "@/components/adm/ui/Icon";
import { STATUS_LABEL } from "@/lib/content";
import { topicIcon } from "@/lib/icons";
import type { StudentProfileData, TopicStatus } from "@/types/tutor";


/** The student's learning map. Click a topic to move it through Not started, In progress, Needs work and Mastered. */
export default function LearningMap({ strands, misconceptions, onCycle }: { strands: StudentProfileData["strands"]; misconceptions: string[]; onCycle: (topicId: number) => void }) {
  return (
    <section className="card">
      <div className="row between">
        <h2>
          <Icon name="route" /> Learning map
        </h2>
        <span className="small muted">Click a topic to change its status</span>
      </div>
      {strands.map((st) => (
        <div className="mini-strand" key={st.id}>
          <span className="label">
            <Icon name={topicIcon(st.name)} />
            {st.name}
          </span>
          <div className="row">
            {st.topics.map((t) => (
              <button key={t.id} type="button" className={`tchip st-${t.status}`} title={t.name} onClick={() => onCycle(t.id)}>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="legend">
        {(["M", "P", "W", "N"] as TopicStatus[]).map((k) => (
          <Chip key={k} tone={STATUS_LABEL[k][1]}>{STATUS_LABEL[k][0]}</Chip>
        ))}
      </div>
      {misconceptions.length > 0 && (
        <div className="tip">
          <Icon name="target" />
          <span>
            <strong>From the diagnostic:</strong> {misconceptions.join("; ")}
          </span>
        </div>
      )}
    </section>
  );
}
