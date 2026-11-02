"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CornerUpLeft, Paperclip, Send, X } from "lucide-react";
import { quoteText } from "@/lib/chatQuote";
import type { ChatMessageItem } from "@/types";
import styles from "./ChatComposer.module.css";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";

interface Props {
  /** Sends the message (and uploads the file first). Resolves when it is sent; throws a readable Error if not. */
  onSend: (text: string, file: File | null) => Promise<void>;
  /** The message being answered, if any. It is shown above the box until you send or cancel. */
  replyTo?: ChatMessageItem | null;
  onCancelReply?: () => void;
}

/** The box at the bottom of a chat: a message, an optional file, and Send. */
export default function ChatComposer({ onSend, replyTo = null, onCancelReply }: Props) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  // Choosing "Reply" puts the cursor straight in the box.
  useEffect(() => {
    if (replyTo) box.current?.focus();
  }, [replyTo]);

  function pick(picked: File | undefined) {
    setError("");
    if (!picked) return;
    if (picked.size > MAX_BYTES) {
      setError("That file is too big. The limit is 5 MB.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setFile(picked);
  }

  function clearFile() {
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || (!text.trim() && !file)) return;
    setBusy(true);
    setError("");
    try {
      await onSend(text.trim(), file);
      setText("");
      clearFile();
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
      {file && (
        <p className={styles.chosen}>
          <Paperclip size={14} aria-hidden="true" /> <span className={styles.chosenName}>{file.name}</span>
          <button type="button" className={styles.remove} onClick={clearFile} aria-label="Remove the file"><X size={14} aria-hidden="true" /></button>
        </p>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.row}>
        <input ref={fileInput} type="file" accept={ACCEPT} className={styles.hidden} onChange={(e) => pick(e.target.files?.[0])} aria-label="Choose a file to share" />
        <button type="button" className={styles.attach} onClick={() => fileInput.current?.click()} aria-label="Attach a file" title="Attach a file (5 MB at most)">
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
        <button type="submit" className={styles.send} disabled={busy || (!text.trim() && !file)}>
          <Send size={16} aria-hidden="true" /> {busy ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
