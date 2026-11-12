import Link from "next/link";
import { notFound } from "next/navigation";
import Chip from "@/components/adm/ui/Chip";
import Icon from "@/components/adm/ui/Icon";
import { ApiError } from "@/lib/api";
import { KIND, STATUS_LABEL } from "@/lib/content";
import { topicIcon } from "@/lib/icons";
import { serverFetch } from "@/lib/serverApi";
import type { TopicSheetData } from "@/types/student";

/** Student > one topic of the learning map: its status and the lessons, notes and quizzes on it. */
export default async function StudentTopicPage({ id, enrolment }: { id: string; enrolment?: string }) {
  if (!/^\d+$/.test(id) || !enrolment || !/^\d+$/.test(enrolment)) notFound();
  let data: TopicSheetData;
  try {
    data = await serverFetch<TopicSheetData>(`/student/topics/${id}?enrolment=${enrolment}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const { topic } = data;
  return (
    <div className="narrow stack">
      <Link href={`/student?enrolment=${enrolment}`} className="btn ghost sm">
        ‹ Back to my map
      </Link>
      <div className="row">
        <span className="tic lg">
          <Icon name={topicIcon(topic.strand, topic.name)} />
        </span>
        <div>
          <span className="label muted">{topic.strand}</span>
          <h1 style={{ margin: 0 }}>{topic.name}</h1>
        </div>
        <Chip tone={STATUS_LABEL[topic.status][1]}>{STATUS_LABEL[topic.status][0]}</Chip>
      </div>
      {data.items.length ? (
        <ol className="tasks">
          {data.items.map((i) => (
            <li key={i.id} className={i.done ? "done" : ""}>
              <span className={`kind k-${i.kind}`}>
                <Icon name={KIND[i.kind].icon} />
              </span>
              <div className="stack grow">
                <strong>{i.title}</strong>
                <span className="small muted">{KIND[i.kind].label}</span>
              </div>
              {i.done && <Chip tone="c-navy">Done ✓</Chip>}
              <Link href={`/student/items/${i.id}?enrolment=${enrolment}`} className="btn primary sm">
                Open
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <div className="card">
          <p className="muted">No lessons on this topic yet. Try a practice set, or message your teacher.</p>
        </div>
      )}
      <div className="card row between">
        <span>Want extra practice on {topic.name}?</span>
        <Link href={`/student/practice/${topic.id}?enrolment=${enrolment}`} className="btn">
          Practice set
        </Link>
      </div>
    </div>
  );
}
