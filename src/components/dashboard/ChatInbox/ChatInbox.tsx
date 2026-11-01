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
  /** The signed-in tutor or admin. */
  meId: number;
}

/** The tutor's chat page: the students on the left, the chosen student's conversation on the right. */
export default function ChatInbox({ initial, meId }: Props) {
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

  const selected = conversations.find((c) => c.studentId === selectedId) ?? null;

  return (
    <div className={`${styles.layout} ${selected ? styles.threadOpen : ""}`}>
      <div className={styles.list}>
        <ChatConversationList conversations={conversations} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <div className={styles.thread}>
        {selected ? (
          <>
            <button type="button" className={styles.back} onClick={() => setSelectedId(null)}>&larr; All students</button>
            <ChatThread
              key={selected.studentId}
              studentId={selected.studentId}
              meId={meId}
              title={selected.fullName || selected.email}
              emptyText="No messages yet. Say hello, or share a file."
              onRead={refresh}
              onChanged={refresh}
            />
          </>
        ) : (
          <p className={styles.pick}>Choose a student on the left to read and answer their messages.</p>
        )}
      </div>
    </div>
  );
}
