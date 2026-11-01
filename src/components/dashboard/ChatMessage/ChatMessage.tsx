import { Ban, Check, CheckCheck, Paperclip, Trash2 } from "lucide-react";
import { attachmentUrl } from "@/services/chatService";
import type { ChatMessageItem, ChatStatus } from "@/types";
import styles from "./ChatMessage.module.css";

const kb = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const time = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

// Each person who writes gets their own name colour, like in a group chat.
const NAME_COLOURS = ["#b4235a", "#1f7a52", "#9a5b00", "#2f5fb3", "#7b3fb0", "#b3481f"];
const ROLE_LABEL = { tutor: "Tutor", admin: "Admin", student: "Student" } as const;
const TICK_LABEL: Record<ChatStatus, string> = { sent: "Sent", delivered: "Delivered", read: "Read" };

interface Props {
  message: ChatMessageItem;
  mine: boolean;
  /** Ticks, shown on your own messages only. */
  status?: ChatStatus;
  /** Delete this message for everyone. Only passed for your own messages. */
  onDelete?: () => void;
}

/** One chat bubble. Your own messages are on the right, in green, with ticks. */
export default function ChatMessage({ message, mine, status, onDelete }: Props) {
  const isTutor = message.senderRole !== "student";
  const colour = NAME_COLOURS[message.senderId % NAME_COLOURS.length];
  return (
    <li className={`${styles.row} ${mine ? styles.mine : ""}`}>
      {/* Who wrote it: a round badge with their initial, in their own colour. */}
      {!mine && (
        <span className={styles.initial} style={{ background: colour }} aria-hidden="true">
          {message.senderName.trim().charAt(0).toUpperCase() || "?"}
        </span>
      )}
      <div className={`${styles.bubble} ${isTutor && !mine ? styles.fromTutor : ""} ${message.deleted ? styles.deleted : ""}`}>
        {!mine && (
          <p className={styles.sender} style={{ color: colour }}>
            {message.senderName}
            {isTutor && <span className={styles.badge}>{ROLE_LABEL[message.senderRole]}</span>}
          </p>
        )}
        {message.deleted && <p className={styles.removed}><Ban size={14} aria-hidden="true" /> This message was deleted</p>}
        {message.body && <p className={styles.text}>{message.body}</p>}
        {message.attachment && (
          <a className={styles.file} href={attachmentUrl(message.attachment.id)} download={message.attachment.name}>
            <span className={styles.fileIcon}><Paperclip size={16} aria-hidden="true" /></span>
            <span className={styles.fileName}>{message.attachment.name}</span>
            <span className={styles.fileSize}>{kb(message.attachment.size)}</span>
          </a>
        )}
        <p className={styles.meta}>
          {mine && !message.deleted && onDelete && (
            <button type="button" className={styles.trash} onClick={onDelete} aria-label="Delete this message" title="Delete message">
              <Trash2 size={14} aria-hidden="true" />
            </button>
          )}
          <span className={styles.time}>{time(message.createdAt)}</span>
          {mine && status && !message.deleted && (
            <span className={`${styles.ticks} ${status === "read" ? styles.read : ""}`} role="img" aria-label={TICK_LABEL[status]} title={TICK_LABEL[status]}>
              {status === "sent" ? <Check size={15} aria-hidden="true" /> : <CheckCheck size={15} aria-hidden="true" />}
            </span>
          )}
        </p>
      </div>
    </li>
  );
}
