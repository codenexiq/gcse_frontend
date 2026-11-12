"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChatBubbles from "@/components/adm/messages/ChatBubbles";
import ChatComposer, { type Draft } from "@/components/adm/messages/ChatComposer";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import { useTypeset } from "@/hooks/useTypeset";
import { apiFetch, send } from "@/lib/api";
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
  /** Where the list links go, e.g. "/tutor/messages" (the conversation is added as ?thread=). */
  basePath: string;
  /** The address messages are sent to, e.g. "/tutor/messages/threads". */
  apiPath: string;
  /** The heading above the conversation. */
  heading: (t: ThreadDetail) => string;
  /** The small print beside the Send button. */
  note: string;
  /** One conversation at a time in a narrow column (for students): a Back link, and a switch when there is more than one teacher. */
  single?: { back: string };
}

/** The two-column messages layout shared by the Admin and Teacher screens: conversations on the left, the chat on the right. */
export default function ChatLayout({ items, initial, viewer, basePath, apiPath, heading, note, single }: Props) {
  const toast = useToast();
  const router = useRouter();
  const [thread, setThread] = useState(initial);
  const [busy, setBusy] = useState(false);
  const shown = useRef(thread); // what is on screen now, for the live check below
  shown.current = thread;
  const box = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => setThread(initial), [initial]);
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [thread.messages.length, thread.id]);
  useTypeset(box, [thread]);

  // Live updates: while this chat is open and the tab is visible, look for new messages every few seconds
  // (opening the chat also marks them read). When something new arrives, the list and the unread counts refresh too.
  useEffect(() => {
    let stopped = false;
    let ticks = 0;
    const lastId = (t: ThreadDetail) => String(t.messages[t.messages.length - 1]?.id ?? "");
    const timer = setInterval(async () => {
      if (stopped || document.hidden) return;
      ticks += 1;
      try {
        const fresh = await apiFetch<ThreadDetail>(`${apiPath}/${thread.id}`);
        if (stopped) return;
        const now = shown.current;
        if (fresh.id === now.id && (fresh.messages.length !== now.messages.length || lastId(fresh) !== lastId(now))) {
          setThread(fresh);
          router.refresh();
        }
        if (ticks % 6 === 0) router.refresh(); // every ~30 seconds: unread counts for the other chats and the header
      } catch {
        // A hiccup (offline, signed out): try again next time.
      }
    }, 5000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [apiPath, thread.id, router]);

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

  const chat = (
    <section className="card stack">
      {single ? (
        <div className="row">
          <Icon name="users" />
          <strong>{heading(thread)}</strong>
        </div>
      ) : (
        <h2>{heading(thread)}</h2>
      )}
      <div className="thread" id="thread" ref={scroller}>
        <ChatBubbles thread={thread} viewer={viewer} />
      </div>
      <ChatComposer onSend={sendMessage} busy={busy} note={note} />
    </section>
  );

  if (single) {
    return (
      <div className="narrow stack" ref={box}>
        <Link href={single.back} className="btn ghost sm">
          ‹ Back
        </Link>
        <h1>Messages</h1>
        {items.length > 1 && (
          <div className="seg" role="group" aria-label="Choose teacher">
            {items.map((t) => (
              <Link key={t.id} href={`${basePath}?thread=${t.id}`} className="seg-link" aria-current={String(t.id) === thread.id ? "page" : undefined}>
                {t.title}
                {t.unread > 0 && <span className="count">{t.unread}</span>}
              </Link>
            ))}
          </div>
        )}
        {chat}
      </div>
    );
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
      {chat}
    </div>
  );
}
