"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ChatBubbles from "@/components/adm/messages/ChatBubbles";
import ChatComposer, { type Draft } from "@/components/adm/messages/ChatComposer";
import { useToast } from "@/components/adm/ui/Toast";
import { useTypeset } from "@/hooks/useTypeset";
import { send } from "@/lib/api";
import type { Sender, ThreadDetail } from "@/types/admin";

export interface ChatListItem {
  id: string | number;
  title: string;
  preview: string;
  unread: number;
}

interface Props {
  items: ChatListItem[];
  initial: ThreadDetail;
  viewer: Sender;
  /** Where the list links go, e.g. "/teacher/messages" (the conversation is added as ?thread=). */
  basePath: string;
  /** The address messages are sent to, e.g. "/teacher/messages/threads". */
  apiPath: string;
  /** The heading above the conversation. */
  heading: (t: ThreadDetail) => string;
  /** The small print beside the Send button. */
  note: string;
}

/** The two-column messages layout shared by the Admin and Teacher screens: conversations on the left, the chat on the right. */
export default function ChatLayout({ items, initial, viewer, basePath, apiPath, heading, note }: Props) {
  const toast = useToast();
  const [thread, setThread] = useState(initial);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => setThread(initial), [initial]);
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [thread.messages.length, thread.id]);
  useTypeset(box, [thread]);

  async function sendMessage(draft: Draft) {
    setBusy(true);
    try {
      const saved = await send<ThreadDetail>("POST", `${apiPath}/${thread.id}/messages`, {
        text: draft.text,
        attachment: draft.attachment ? { name: draft.attachment.name, type: draft.attachment.type, size: draft.attachment.size, data: draft.attachment.data ?? undefined } : undefined,
      });
      setThread(saved);
      return true;
    } catch (err) {
      toast(err instanceof Error ? err.message : "That could not be sent.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="msg-layout" ref={box}>
      <div className="stack thread-list">
        {items.map((t) => (
          <Link key={t.id} href={`${basePath}?thread=${t.id}`} className="list-btn" aria-current={t.id === thread.id}>
            <span className="row between">
              <strong>{t.title}</strong>
              {t.unread > 0 && <span className="count">{t.unread}</span>}
            </span>
            <span className="small muted clamp">{t.preview}</span>
          </Link>
        ))}
      </div>
      <section className="card stack">
        <h2>{heading(thread)}</h2>
        <div className="thread" id="thread" ref={scroller}>
          <ChatBubbles thread={thread} viewer={viewer} />
        </div>
        <ChatComposer onSend={sendMessage} busy={busy} note={note} />
      </section>
    </div>
  );
}
