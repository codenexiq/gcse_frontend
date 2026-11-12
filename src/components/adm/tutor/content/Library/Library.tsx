"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Chip from "@/components/adm/ui/Chip";
import Empty from "@/components/adm/ui/Empty";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { send } from "@/lib/api";
import { contentHref, KIND } from "@/lib/content";
import { topicIcon } from "@/lib/icons";
import { plural } from "@/lib/format";
import type { ContentItem, ContentPath, ItemKind, LibraryData, LibraryItem } from "@/types/tutor";

const CREATE: { kind: ItemKind; title: string; text: string }[] = [
  { kind: "lesson", title: "Lesson", text: "Slides with questions between" },
  { kind: "quiz", title: "Quiz", text: "Multiple choice and written questions" },
  { kind: "notes", title: "Notes", text: "Revision notes pages" },
  { kind: "video", title: "Video lesson", text: "A video with a question or two" },
];

function ItemButton({ item, path }: { item: LibraryItem; path: string }) {
  return (
    <Link href={contentHref({ path, item: item.id })} className="lib-item">
      <span className={`kind k-${item.kind}`}>
        <Icon name={KIND[item.kind].icon} />
      </span>
      <span className="grow">{item.title}</span>
      {item.published ? <Chip tone="c-navy">Visible</Chip> : <Chip tone="c-cream">Draft</Chip>}
    </Link>
  );
}

/** The library for one pathway: ways to make something new, then every topic with what is in it. */
export default function Library({ path, data }: { path: ContentPath; data: LibraryData }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function create(kind: ItemKind) {
    setBusy(true);
    try {
      const item = await send<ContentItem>("POST", "/tutor/content/items", { subject: path.subject.id, level: path.level.id, kind });
      router.push(contentHref({ path: path.key, item: item.id }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be created.");
      setBusy(false);
    }
  }

  return (
    <>
      <div className="create-row">
        {CREATE.map((c) => (
          <button key={c.kind} type="button" className="create" disabled={busy} onClick={() => create(c.kind)}>
            <Icon name={KIND[c.kind].icon} />
            <strong>{c.title}</strong>
            <span>{c.text}</span>
          </button>
        ))}
      </div>
      {data.strands.length === 0 && <Empty title="No topics yet" text="The admin can add topics for this pathway in Settings." />}
      {data.strands.map((st) => (
        <section className="card" key={st.id}>
          <h3 className="row">
            <span className="tic">
              <Icon name={topicIcon(st.name)} />
            </span>
            {st.name}
          </h3>
          {st.topics.map((t) => (
            <div className="lib-topic" key={t.id}>
              <div className="row">
                <span className="tic sm">
                  <Icon name={topicIcon(st.name, t.name)} />
                </span>
                <strong>{t.name}</strong>
                <span className="small muted">{t.items.length ? plural(t.items.length, "item") : "Nothing yet"}</span>
              </div>
              <div className="lib-items">
                {t.items.map((i) => (
                  <ItemButton key={i.id} item={i} path={path.key} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
      {data.unsorted.length > 0 && (
        <section className="card">
          <h3>Not on a topic</h3>
          <div className="lib-items">
            {data.unsorted.map((i) => (
              <ItemButton key={i.id} item={i} path={path.key} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
