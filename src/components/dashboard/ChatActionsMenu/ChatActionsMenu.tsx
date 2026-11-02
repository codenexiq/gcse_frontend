"use client";

import { useState } from "react";
import { Eraser, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DotsMenu from "@/components/ui/DotsMenu";
import { clearChat, deleteChat } from "@/services/chatService";

interface Props {
  /** The OTHER person in the chat these actions are for. */
  peerId: number;
  /** Their name, for screen readers ("Chat options for Sara"). */
  name: string;
  /** Called after the chat was cleared or deleted, so the screen can update. */
  onDone: (what: "clear" | "delete") => void;
  variant?: "default" | "light";
}

/**
 * The three dots next to a person's name: "Clear chat" and "Delete chat", each asking first in our own pop-up.
 * Used on the chat list and on the title bar of an open chat.
 */
export default function ChatActionsMenu({ peerId, name, onDone, variant = "default" }: Props) {
  const [asking, setAsking] = useState<"clear" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function close() {
    setAsking(null);
    setError("");
  }

  async function confirm() {
    if (!asking) return;
    setBusy(true);
    setError("");
    try {
      await (asking === "clear" ? clearChat(peerId) : deleteChat(peerId));
      const done = asking;
      close();
      onDone(done);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DotsMenu
        label={`Chat options for ${name}`}
        variant={variant}
        items={[
          { label: "Clear chat", icon: <Eraser size={14} aria-hidden="true" />, onClick: () => setAsking("clear") },
          { label: "Delete chat", icon: <Trash2 size={14} aria-hidden="true" />, tone: "danger", onClick: () => setAsking("delete") },
        ]}
      />
      <ConfirmDialog
        open={asking !== null}
        title={asking === "clear" ? "Clear this chat?" : "Delete this chat?"}
        actions={[{ label: asking === "clear" ? "Clear chat" : "Delete chat", tone: "danger", onClick: confirm }]}
        onClose={close}
        busy={busy}
        error={error}
      >
        {asking === "clear" ? (
          <p>The messages in your chat with {name} disappear from your screen only. They keep them, and new messages still arrive.</p>
        ) : (
          <p>Every message and file in your chat with {name} is removed for both of you. This cannot be undone.</p>
        )}
      </ConfirmDialog>
    </>
  );
}
