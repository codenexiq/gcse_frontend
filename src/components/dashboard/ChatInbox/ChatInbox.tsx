"use client";

import { useCallback, useEffect, useState } from "react";
import ChatConversationList from "@/components/dashboard/ChatConversationList";
import ChatThread from "@/components/dashboard/ChatThread";
import { getConversations } from "@/services/chatService";
import type { ChatConversation } from "@/types";
import styles from "./ChatInbox.module.css";

const REFRESH_MS = 15000;

interface Props {
  initial: ChatConversation[];
  /** The signed-in person. */
  meId: number;
  /** What the people in the list are: "student" (the tutor's page) or "tutor" (the student's page). */
  noun: "student" | "tutor";
}

/** A chat page: the people to talk to on the left, the chosen person's chat on the right. Every chat is separate. */
export default function ChatInbox({ initial, meId, noun }: Props) {
  const [conversations, setConversations] = useState(initial);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      setConversations(await getConversations());
    } catch {
      // Keep showing the list we have; the next check tries again.
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const selected = conversations.find((c) => c.peerId === selectedId) ?? null;

  return (
    <div className={`${styles.layout} ${selected ? styles.threadOpen : ""}`}>
      <div className={styles.list}>
        <ChatConversationList conversations={conversations} selectedId={selectedId} onSelect={setSelectedId} noun={noun} />
      </div>
      <div className={styles.thread}>
        {selected ? (
          <>
            <button type="button" className={styles.back} onClick={() => setSelectedId(null)}>&larr; All {noun}s</button>
            <ChatThread
              key={selected.peerId}
              peerId={selected.peerId}
              meId={meId}
              title={selected.fullName || selected.email}
              subtitle={selected.peerRole === "admin" ? "Administrator" : selected.peerRole === "tutor" ? "Tutor" : "Student"}
              emptyText="No messages yet. Say hello, or share a file."
              onRead={refresh}
              onChanged={refresh}
            />
          </>
        ) : (
          <p className={styles.pick}>Choose a {noun} on the left to read and answer their messages.</p>
        )}
      </div>
    </div>
  );
}
