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
  onSelect: (studentId: number) => void;
}

/** The tutor's list of students to chat with: newest conversation first, with unread counts. */
export default function ChatConversationList({ conversations, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? conversations.filter((c) => `${c.fullName} ${c.email}`.toLowerCase().includes(q)) : conversations;
  }, [conversations, query]);

  return (
    <nav className={styles.panel} aria-label="Students">
      <label className={styles.search}>
        <Search size={16} aria-hidden="true" />
        <span className={styles.srOnly}>Search students by name or email</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students" maxLength={100} />
      </label>
      {shown.length === 0 ? (
        <p className={styles.empty}>{conversations.length === 0 ? "No students have registered yet." : "No students match your search."}</p>
      ) : (
        <ul className={styles.list}>
          {shown.map((c) => (
            <li key={c.studentId}>
              <button type="button" className={`${styles.item} ${c.studentId === selectedId ? styles.active : ""}`} onClick={() => onSelect(c.studentId)} aria-current={c.studentId === selectedId ? "true" : undefined}>
                <Avatar name={c.fullName || c.email} size={36} />
                <span className={styles.text}>
                  <span className={styles.top}>
                    <strong className={styles.name}>{c.fullName || c.email}</strong>
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
