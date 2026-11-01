"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Trash2 } from "lucide-react";
import ChatComposer from "@/components/dashboard/ChatComposer";
import ChatMessage from "@/components/dashboard/ChatMessage";
import { CHAT_READ_EVENT } from "@/hooks/useChatUnread";
import { clearChat, deleteChat, deleteMessage, getMessages, sendMessage, uploadAttachment } from "@/services/chatService";
import type { ChatMessageItem, ChatPointers, ChatStatus } from "@/types";
import styles from "./ChatThread.module.css";

const POLL_MS = 8000;

interface Props {
  /** The student whose conversation this is. Leave out for a student: they always chat in their own. */
  studentId?: number;
  /** The signed-in user, so their own messages show on the right. */
  meId: number;
  title: string;
  emptyText: string;
  /** Called after the thread has loaded, so a list can refresh its unread counts. */
  onRead?: () => void;
  /** Called after the chat was cleared or deleted, so a list can refresh. */
  onChanged?: () => void;
}

/** One conversation: the messages (checked for new ones every few seconds) and the box to answer. */
export default function ChatThread({ studentId, meId, title, emptyText, onRead, onChanged }: Props) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [problem, setProblem] = useState("");
  const [pointers, setPointers] = useState<ChatPointers | null>(null);
  const lastId = useRef(0);
  const listEnd = useRef<HTMLLIElement>(null);

  const load = useCallback(async () => {
    try {
      const { messages: fresh, pointers: latest, deletedIds } = await getMessages(studentId, lastId.current);
      setProblem("");
      setPointers(latest); // older messages can turn from one tick to two blue ticks
      // Keep what is on screen in step with the server: drop what a "delete chat" wiped, mark deleted messages, add new ones.
      setMessages((old) => {
        const kept = old.filter((m) => m.id > latest.wipedUpTo);
        const marked = kept.map((m) => (!m.deleted && deletedIds.includes(m.id) ? { ...m, body: null, attachment: null, deleted: true } : m));
        // Messages can arrive twice (a poll and a send at the same moment): keep each id once.
        const added = fresh.filter((m) => !marked.some((o) => o.id === m.id));
        const unchanged = added.length === 0 && kept.length === old.length && marked.every((m, i) => m === kept[i]);
        return unchanged ? old : [...marked, ...added];
      });
      if (fresh.length > 0) {
        lastId.current = fresh[fresh.length - 1].id;
        onRead?.();
        window.dispatchEvent(new Event(CHAT_READ_EVENT)); // these messages are read now: update the red badge
      }
      setLoaded(true);
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Could not load the messages.");
      setLoaded(true);
    }
  }, [studentId, onRead]);

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (!document.hidden) load();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    listEnd.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  /** Ticks for one of your own messages: how far the other side has got. */
  function statusOf(m: ChatMessageItem): ChatStatus | undefined {
    if (!pointers || m.senderId !== meId) return undefined;
    const seen = m.senderRole === "student" ? { read: pointers.tutorRead, delivered: pointers.tutorDelivered } : { read: pointers.studentRead, delivered: pointers.studentDelivered };
    return m.id <= seen.read ? "read" : m.id <= seen.delivered ? "delivered" : "sent";
  }

  // A student's chat can have several tutors: say who has written, so it is clear who they are talking to.
  const tutorNames = studentId === undefined ? [...new Map(messages.filter((m) => m.senderRole !== "student").map((m) => [m.senderId, m.senderName])).values()] : [];

  const fail = (err: unknown) => setProblem(err instanceof Error ? err.message : "Something went wrong. Please try again.");

  async function removeMessage(m: ChatMessageItem) {
    if (!window.confirm("Delete this message for everyone? The other side will see that it was deleted.")) return;
    try {
      await deleteMessage(studentId, m.id);
      await load();
    } catch (err) {
      fail(err);
    }
  }

  async function clear() {
    if (!window.confirm("Clear this chat? The messages disappear from YOUR screen only. The other side keeps them.")) return;
    try {
      await clearChat(studentId);
      setMessages([]);
      onChanged?.();
    } catch (err) {
      fail(err);
    }
  }

  async function removeChat() {
    if (!window.confirm("Delete this whole chat for EVERYONE? Every message and file is removed permanently. This cannot be undone.")) return;
    try {
      await deleteChat(studentId);
      setMessages([]);
      onChanged?.();
    } catch (err) {
      fail(err);
    }
  }

  async function send(text: string, file: File | null) {
    let attachmentId: number | undefined;
    if (file) attachmentId = (await uploadAttachment(studentId, file)).id;
    await sendMessage(studentId, text, attachmentId);
    await load();
  }

  return (
    <section className={styles.thread} aria-label={title}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <h2 className={styles.title}>{title}</h2>
          {studentId === undefined && tutorNames.length > 0 && <p className={styles.who}>{tutorNames.join(", ")}</p>}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.action} onClick={clear} disabled={messages.length === 0} title="Empty the chat on your screen only">
            <Eraser size={14} aria-hidden="true" /> Clear chat
          </button>
          <button type="button" className={`${styles.action} ${styles.danger}`} onClick={removeChat} title="Remove the whole chat for everyone">
            <Trash2 size={14} aria-hidden="true" /> Delete chat
          </button>
        </div>
      </div>
      <ul className={styles.list} aria-live="polite">
        {loaded && messages.length === 0 && !problem && <li className={styles.empty}>{emptyText}</li>}
        {problem && <li className={styles.problem}>{problem}</li>}
        {messages.map((m) => <ChatMessage key={m.id} message={m} mine={m.senderId === meId} status={statusOf(m)} onDelete={m.senderId === meId ? () => removeMessage(m) : undefined} />)}
        <li ref={listEnd} aria-hidden="true" />
      </ul>
      <ChatComposer onSend={send} />
    </section>
  );
}
