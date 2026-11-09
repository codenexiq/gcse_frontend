"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DotsMenu from "@/components/ui/DotsMenu";
import { ApiError } from "@/lib/api";
import { deleteChatGroup } from "@/services/chatService";

interface Props {
  groupId: number;
  name: string;
  /** Called after the group was deleted, so the screen can leave it. */
  onDeleted: () => void;
}

/** The three dots in a group chat's title bar (admins only): "Delete group", after asking first. */
export default function ChatGroupActionsMenu({ groupId, name, onDeleted }: Props) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await deleteChatGroup(groupId);
      setAsking(false);
      onDeleted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DotsMenu
        label={`Group options for ${name}`}
        items={[{ label: "Delete group", icon: <Trash2 size={14} aria-hidden="true" />, tone: "danger", onClick: () => setAsking(true) }]}
      />
      <ConfirmDialog
        open={asking}
        title="Delete this group?"
        actions={[{ label: "Delete group", tone: "danger", onClick: confirm }]}
        onClose={() => {
          setAsking(false);
          setError("");
        }}
        busy={busy}
        error={error}
      >
        <p>The group <strong>{name}</strong> is removed with every message and file in it, for everyone. This cannot be undone.</p>
      </ConfirmDialog>
    </>
  );
}
