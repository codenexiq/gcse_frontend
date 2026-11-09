"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CornerUpLeft, Paperclip, Send, X } from "lucide-react";
import { quoteText } from "@/lib/chatQuote";
import type { ChatMessageItem } from "@/types";
import styles from "./ChatComposer.module.css";

const MAX_FILES = 10;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";

interface Props {
  /** Sends the message (and uploads the file first). Resolves when it is sent; throws a readable Error if not. */
  onSend: (text: string, files: File[]) => Promise<void>;
  /** The message being answered, if any. It is shown above the box until you send or cancel. */
  replyTo?: ChatMessageItem | null;
  onCancelReply?: () => void;
}

/** The box at the bottom of a chat: a message, an optional file, and Send. */
export default function ChatComposer({ onSend, replyTo = null, onCancelReply }: Props) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  // Opening a chat puts the cursor straight in the box, so you can start typing.
  useEffect(() => {
    box.current?.focus({ preventScroll: true });
  }, []);

  // Choosing "Reply" puts the cursor straight in the box.
  useEffect(() => {
    if (replyTo) box.current?.focus();
  }, [replyTo]);

  function pick(picked: FileList | null) {
    setError("");
    if (fileInput.current) fileInput.current.value = "";
    if (!picked || picked.length === 0) return;
    const chosen = [...picked];
    if (chosen.some((f) => f.size > MAX_BYTES)) return setError("A file is too big. The limit is 5 MB each.");
    if (files.length + chosen.length > MAX_FILES) return setError(`You can share up to ${MAX_FILES} files at a time.`);
    setFiles((old) => [...old, ...chosen]);
  }

  function removeFile(index: number) {
    setFiles((old) => old.filter((_, i) => i !== index));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || (!text.trim() && files.length === 0)) return;
    setBusy(true);
    setError("");
    try {
      await onSend(text.trim(), files);
      setText("");
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      {replyTo && (
        <div className={styles.reply}>
          <CornerUpLeft size={14} aria-hidden="true" className={styles.replyIcon} />
          <span className={styles.replyText}>
            <strong className={styles.replyName}>Replying to {replyTo.senderName}</strong>
            <span className={styles.replySnippet}>{quoteText(replyTo.body, replyTo.attachment?.name ?? null, replyTo.deleted)}</span>
          </span>
          <button type="button" className={styles.remove} onClick={onCancelReply} aria-label="Cancel the reply"><X size={14} aria-hidden="true" /></button>
        </div>
      )}
      {files.map((f, i) => (
        <p key={`${f.name}-${i}`} className={styles.chosen}>
          <Paperclip size={14} aria-hidden="true" /> <span className={styles.chosenName}>{f.name}</span>
          <button type="button" className={styles.remove} onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}><X size={14} aria-hidden="true" /></button>
        </p>
      ))}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.row}>
        <input ref={fileInput} type="file" multiple accept={ACCEPT} className={styles.hidden} onChange={(e) => pick(e.target.files)} aria-label="Choose files to share" />
        <button type="button" className={styles.attach} onClick={() => fileInput.current?.click()} aria-label="Attach files" title="Attach files (5 MB each, up to 10)">
          <Paperclip size={18} aria-hidden="true" />
        </button>
        <textarea
          ref={box}
          className={styles.input}
          rows={1}
          maxLength={2000}
          value={text}
          placeholder="Write a message"
          aria-label="Message"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter makes a new line.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button type="submit" className={styles.send} disabled={busy || (!text.trim() && files.length === 0)}>
          <Send size={16} aria-hidden="true" /> {busy ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
