"use client";

import { useMemo, useState } from "react";
import { Paperclip, Search } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import type { ChatConversation } from "@/types";
import styles from "./ChatConversationList.module.css";

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

interface Props {
  conversations: ChatConversation[];
  selectedId: number | null;
  onSelect: (peerId: number) => void;
  /** What the people in the list are called: "student" or "tutor". */
  noun: "student" | "tutor";
}

/** The list of people to chat with (students for a tutor, tutors and admins for a student): newest chat first, with unread counts. */
export default function ChatConversationList({ conversations, selectedId, onSelect, noun }: Props) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? conversations.filter((c) => `${c.fullName} ${c.email}`.toLowerCase().includes(q)) : conversations;
  }, [conversations, query]);

  return (
    <nav className={styles.panel} aria-label={`${noun[0].toUpperCase()}${noun.slice(1)}s`}>
      <label className={styles.search}>
        <Search size={16} aria-hidden="true" />
        <span className={styles.srOnly}>Search {noun}s by name or email</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${noun}s`} maxLength={100} />
      </label>
      {shown.length === 0 ? (
        <p className={styles.empty}>{conversations.length === 0 ? `No ${noun}s yet.` : `No ${noun}s match your search.`}</p>
      ) : (
        <ul className={styles.list}>
          {shown.map((c) => (
            <li key={c.peerId}>
              <button type="button" className={`${styles.item} ${c.peerId === selectedId ? styles.active : ""}`} onClick={() => onSelect(c.peerId)} aria-current={c.peerId === selectedId ? "true" : undefined}>
                <Avatar name={c.fullName || c.email} size={36} />
                <span className={styles.text}>
                  <span className={styles.top}>
                    <strong className={styles.name}>{c.fullName || c.email}</strong>
                    {c.peerRole !== "student" && <span className={styles.role}>{c.peerRole === "admin" ? "Admin" : "Tutor"}</span>}
                    {c.lastAt && <span className={styles.when}>{day(c.lastAt)}</span>}
                  </span>
                  <span className={styles.preview}>
                    {c.lastHasFile && <Paperclip size={12} aria-hidden="true" />}
                    {c.lastBody ?? (c.lastHasFile ? "File" : "No messages yet")}
                  </span>
                </span>
                {c.unread > 0 && <span className={styles.unread} aria-label={`${c.unread} unread`}>{c.unread}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
