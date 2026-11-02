"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ChatColorPicker from "@/components/dashboard/ChatColorPicker";
import ChatComposer from "@/components/dashboard/ChatComposer";
import ChatMessage from "@/components/dashboard/ChatMessage";
import Avatar from "@/components/ui/Avatar";
import ConfirmDialog, { type DialogAction } from "@/components/ui/ConfirmDialog";
import { CHAT_READ_EVENT } from "@/hooks/useChatUnread";
import { quoteText } from "@/lib/chatQuote";
import type { ChatApi } from "@/services/chatService";
import { userAvatarUrl } from "@/services/profileService";
import type { ChatMessageItem, ChatPointers, ChatStatus } from "@/types";
import styles from "./ChatThread.module.css";

const POLL_MS = 8000;

interface Props {
  /** Talks to the server for this conversation: a chat with one person, or a group chat. Keep it the same object while the chat stays open. */
  api: ChatApi;
  /** The signed-in user, so their own messages show on the right. */
  meId: number;
  title: string;
  /** A line under the title, e.g. who the person is. */
  subtitle?: string;
  /** The other person's profile picture, shown beside their messages. */
  peerAvatar?: string | null;
  /** Shown in the title bar instead of the person's picture (a group shows an icon). */
  headIcon?: React.ReactNode;
  /** An admin in a group can delete anyone's message for everyone. */
  canModerate?: boolean;
  /** The colour of the chat area (like #dff3e6), or null for the standard colour. */
  bodyColor?: string | null;
  /** When given, the title bar gets a colour button. */
  onBodyColorChange?: (color: string | null) => void;
  /** The three dots in the title bar. They get a function that empties the screen (for after a chat was cleared or deleted). */
  renderActions?: (reset: () => void) => React.ReactNode;
  emptyText: string;
  /** Called after the thread has loaded, so a list can refresh its unread counts. */
  onRead?: () => void;
}

/** One conversation: the messages (checked for new ones every few seconds) and the box to answer. */
export default function ChatThread({ api, meId, title, subtitle, peerAvatar, headIcon, canModerate, bodyColor, onBodyColorChange, renderActions, emptyText, onRead }: Props) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [problem, setProblem] = useState("");
  const [pointers, setPointers] = useState<ChatPointers | null>(null);
  // The message being deleted (its pop-up is open), and whether "delete for everyone" is still allowed for it.
  const [deleting, setDeleting] = useState<{ message: ChatMessageItem; canEveryone: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState("");
  // The message the next one will answer.
  const [replyingTo, setReplyingTo] = useState<ChatMessageItem | null>(null);
  const lastId = useRef(0);
  const listEnd = useRef<HTMLLIElement>(null);

  const load = useCallback(async () => {
    try {
      const { messages: fresh, pointers: latest, deletedIds } = await api.getMessages(lastId.current);
      setProblem("");
      setPointers(latest); // older messages can turn from one tick to two blue ticks
      const arrived = Date.now();
      // Keep what is on screen in step with the server: drop what a "delete chat" wiped, mark deleted messages (and their quotes), add new ones.
      setMessages((old) => {
        const kept = old.filter((m) => m.id > (latest?.wipedUpTo ?? 0));
        const marked = kept.map((m) => {
          if (!m.deleted && deletedIds.includes(m.id)) return { ...m, body: null, attachment: null, deleted: true };
          if (m.replyTo && !m.replyTo.deleted && deletedIds.includes(m.replyTo.id)) return { ...m, replyTo: { ...m.replyTo, body: null, fileName: null, deleted: true } };
          return m;
        });
        // Messages can arrive twice (a poll and a send at the same moment): keep each id once.
        const added = fresh.filter((m) => !marked.some((o) => o.id === m.id)).map((m) => ({ ...m, receivedAt: arrived }));
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
  }, [api, onRead]);

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

  // If the message you were answering is deleted, the reply box goes away too.
  useEffect(() => {
    if (replyingTo && !messages.some((m) => m.id === replyingTo.id && !m.deleted)) setReplyingTo(null);
  }, [messages, replyingTo]);

  /** Ticks for one of your own messages: how far the other side has got. */
  function statusOf(m: ChatMessageItem): ChatStatus | undefined {
    if (!pointers || m.senderId !== meId) return undefined;
    const seen = m.senderRole === "student" ? { read: pointers.tutorRead, delivered: pointers.tutorDelivered } : { read: pointers.studentRead, delivered: pointers.studentDelivered };
    return m.id <= seen.read ? "read" : m.id <= seen.delivered ? "delivered" : "sent";
  }

  /** Scrolls to the original message of a reply and lights it up for a moment (if it is still on screen). */
  function jumpTo(messageId: number) {
    const el = document.getElementById(`chat-message-${messageId}`);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.dataset.flash = "true";
    setTimeout(() => {
      delete el.dataset.flash;
    }, 1600);
  }

  /** Empties the screen (used after the chat was cleared or deleted). */
  function reset() {
    setMessages([]);
    setReplyingTo(null);
  }

  function closeDialog() {
    setDeleting(null);
    setDialogError("");
  }

  /** Opens the delete choices for a message. "For everyone" is only offered for your own message, in its first 10 minutes. */
  function askAboutMessage(m: ChatMessageItem) {
    const secondsLeft = m.windowLeft - (Date.now() - (m.receivedAt ?? Date.now())) / 1000;
    setDialogError("");
    setDeleting({ message: m, canEveryone: !m.deleted && (Boolean(canModerate) || (m.senderId === meId && secondsLeft > 0)) });
  }

  /** Runs the chosen delete. The pop-up stays open, showing the reason, if it did not work. */
  async function deleteFor(m: ChatMessageItem, scope: "me" | "everyone") {
    setBusy(true);
    setDialogError("");
    try {
      await api.remove(m.id, scope);
      if (scope === "me") setMessages((old) => old.filter((x) => x.id !== m.id)); // gone from your view only
      else await load(); // shows "This message was deleted"
      closeDialog();
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function send(text: string, file: File | null) {
    let attachmentId: number | undefined;
    if (file) attachmentId = (await api.upload(file)).id;
    await api.send(text, attachmentId, replyingTo?.id);
    setReplyingTo(null);
    await load();
  }

  // What the delete pop-up says and offers.
  let dialogActions: DialogAction[] = [];
  let dialogBody: React.ReactNode = null;
  if (deleting) {
    const { message, canEveryone } = deleting;
    const mine = message.senderId === meId;
    dialogBody = (
      <>
        <p className={styles.quote}>{quoteText(message.body, message.attachment?.name ?? null, message.deleted, 120)}</p>
        <p>
          <strong>Delete for me</strong> removes it from your view only. The other person still sees it.
        </p>
        {canEveryone ? (
          <p>
            <strong>Delete for everyone</strong> {canModerate ? "removes it for everyone in the group. As an admin you can do this for any message." : "removes it for everyone in this chat. This works for 10 minutes after you send a message."}
          </p>
        ) : (
          <p className={styles.note}>
            {mine && !message.deleted ? "More than 10 minutes have passed since you sent this message, so it can only be deleted for you." : !mine ? "You can only delete other people's messages for yourself." : ""}
          </p>
        )}
      </>
    );
    dialogActions = [
      ...(canEveryone ? [{ label: "Delete for everyone", tone: "danger" as const, onClick: () => deleteFor(message, "everyone") }] : []),
      { label: "Delete for me", tone: "danger" as const, onClick: () => deleteFor(message, "me") },
    ];
  }

  return (
    <section className={styles.thread} aria-label={title}>
      <div className={styles.head}>
        {/* The other person's picture, beside their name. */}
        <span className={styles.headAvatar}>
          {headIcon ?? <Avatar name={title} size={44} src={peerAvatar} />}
        </span>
        <div className={styles.headText}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.who}>{subtitle}</p>}
        </div>
        {/* The colour button, and the three dots, next to the name. */}
        <div className={styles.tools}>
          {onBodyColorChange && <ChatColorPicker value={bodyColor ?? null} onChange={onBodyColorChange} />}
          {renderActions?.(reset)}
        </div>
      </div>
      <ul className={styles.list} aria-live="polite" style={bodyColor ? { background: bodyColor } : undefined}>
        {loaded && messages.length === 0 && !problem && <li className={styles.empty}>{emptyText}</li>}
        {problem && <li className={styles.problem}>{problem}</li>}
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            message={m}
            mine={m.senderId === meId}
            status={statusOf(m)}
            avatarSrc={m.senderId === meId ? null : m.senderAvatarVersion ? userAvatarUrl(m.senderId, m.senderAvatarVersion) : peerAvatar}
            onReply={() => setReplyingTo(m)}
            onDelete={() => askAboutMessage(m)}
            onJump={jumpTo}
          />
        ))}
        <li ref={listEnd} aria-hidden="true" />
      </ul>
      <ChatComposer onSend={send} replyTo={replyingTo} onCancelReply={() => setReplyingTo(null)} />

      <ConfirmDialog open={deleting !== null} title="Delete message?" actions={dialogActions} onClose={closeDialog} busy={busy} error={dialogError}>
        {dialogBody}
      </ConfirmDialog>
    </section>
  );
}
