"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AttachmentView } from "@/components/adm/messages/ChatBubbles";
import Icon from "@/components/adm/ui/Icon";
import { useToast } from "@/components/adm/ui/Toast";
import type { Attachment } from "@/types/admin";

export interface Draft {
  text: string;
  attachment: Attachment | null;
}

const MAX_FILE = 3 * 1048576;



/** Write a message and optionally attach one file (up to 3 MB; small pictures are shown in the chat). Enter sends, Shift+Enter starts a new line. */
export default function ChatComposer({ onSend, busy, note }: { onSend: (draft: Draft) => Promise<boolean>; busy: boolean; note: string }) {
  const toast = useToast();
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  function pick(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_FILE) return toast("That file is over 3 MB. Share a smaller file.");
    const base = { name: file.name, size: file.size, type: file.type || "", data: null as string | null };
    // Every file is read in full so it can be saved on the server and downloaded by the other person.
    const reader = new FileReader();
    reader.onload = () => setAttachment({ ...base, data: String(reader.result) });
    reader.onerror = () => toast("That file could not be read.");
    reader.readAsDataURL(file);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() && !attachment) return;
    if (await onSend({ text, attachment })) {
      setText("");
      setAttachment(null);
      areaRef.current?.focus();
    }
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} className="stack composer" onSubmit={submit} noValidate>
      <label className="field" htmlFor="msg-text">
        <span className="sr">Message</span>
        <textarea id="msg-text" ref={areaRef} rows={2} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} placeholder="Write a message. Put maths in $…$" />
      </label>
      {attachment && (
        <div className="row">
          <AttachmentView a={attachment} />
          <button type="button" className="btn ghost sm" aria-label="Remove attachment" onClick={() => setAttachment(null)}>✕</button>
        </div>
      )}
      <div className="row between">
        <label className="btn ghost sm" htmlFor="msg-att">
          <Icon name="upload" />
          Attach
          <input id="msg-att" className="sr-file" type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        <span className="small muted">{note}</span>
        <button type="submit" className="btn primary sm" disabled={busy}>Send</button>
      </div>
    </form>
  );
}
