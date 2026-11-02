"use client";

import { useEffect, useMemo, useState } from "react";
import { Paperclip, Plus, Search, UserPlus, Users } from "lucide-react";
import ChatActionsMenu from "@/components/dashboard/ChatActionsMenu";
import Avatar from "@/components/ui/Avatar";
import { userAvatarUrl } from "@/services/profileService";
import type { ChatConversation, ChatGroupSummary } from "@/types";
import styles from "./ChatConversationList.module.css";

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const MIN_LETTERS = 2;

interface Props {
  conversations: ChatConversation[];
  selectedId: number | null;
  onSelect: (person: ChatConversation) => void;
  /** What the people in the list are called: "student" or "tutor". */
  noun: "student" | "tutor";
  /**
   * When given, the list only holds the chats that already exist, and a new chat starts by SEARCHING for the person
   * (at least 2 letters). Without it, the list is complete and the search box just filters it.
   */
  findNew?: (query: string) => Promise<ChatConversation[]>;
  /** Called after a chat was cleared or deleted from the three dots on its row. */
  onChanged?: (person: ChatConversation) => void;
  /** The group chats this person can open. */
  groups?: ChatGroupSummary[];
  selectedGroupId?: number | null;
  onSelectGroup?: (group: ChatGroupSummary) => void;
  /** Given only to admins: shows the "New group" button. */
  onNewGroup?: () => void;
}

/** The list of people to chat with: newest chat first, with unread counts. */
export default function ChatConversationList({ conversations, selectedId, onSelect, noun, findNew, onChanged, groups = [], selectedGroupId = null, onSelectGroup, onNewGroup }: Props) {
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<ChatConversation[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const text = query.trim();
  const canSearch = findNew !== undefined && text.length >= MIN_LETTERS;

  // Looks for people to start a chat with, a moment after the typing stops.
  useEffect(() => {
    if (!findNew || text.length < MIN_LETTERS) {
      setFound([]);
      setSearching(false);
      setSearchError("");
      return;
    }
    let current = true;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const people = await findNew(text);
        if (current) {
          setFound(people);
          setSearchError("");
        }
      } catch (err) {
        if (current) setSearchError(err instanceof Error ? err.message : "The search did not work. Please try again.");
      } finally {
        if (current) setSearching(false);
      }
    }, 300);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [findNew, text]);

  const shown = useMemo(() => {
    const q = text.toLowerCase();
    return q ? conversations.filter((c) => `${c.fullName} ${c.email}`.toLowerCase().includes(q)) : conversations;
  }, [conversations, text]);

  const shownGroups = useMemo(() => {
    const q = text.toLowerCase();
    return q ? groups.filter((g) => g.name.toLowerCase().includes(q)) : groups;
  }, [groups, text]);

  // People you already have a chat with are not offered again as "new".
  const fresh = useMemo(() => found.filter((p) => !conversations.some((c) => c.peerId === p.peerId)), [found, conversations]);

  // The three dots (Clear chat / Delete chat) are for rows that really have a chat.
  const hasMenu = (c: ChatConversation, isNew: boolean) => !isNew && onChanged !== undefined && (c.lastAt !== null || c.lastBody !== null || c.lastHasFile);

  const row = (c: ChatConversation, isNew: boolean) => (
    <li key={c.peerId} className={styles.rowWrap}>
      <button type="button" className={`${styles.item} ${hasMenu(c, isNew) ? styles.withMenu : ""} ${c.peerId === selectedId ? styles.active : ""}`} onClick={() => onSelect(c)} aria-current={c.peerId === selectedId ? "true" : undefined}>
        <Avatar name={c.fullName || c.email} size={36} src={c.avatarVersion ? userAvatarUrl(c.peerId, c.avatarVersion) : null} />
        <span className={styles.text}>
          <span className={styles.top}>
            <strong className={styles.name}>{c.fullName || c.email}</strong>
            {c.peerRole !== "student" && <span className={styles.role}>{c.peerRole === "admin" ? "Admin" : "Tutor"}</span>}
            {c.lastAt && <span className={styles.when}>{day(c.lastAt)}</span>}
          </span>
          <span className={styles.preview}>
            {isNew ? c.email : (
              <>
                {c.lastHasFile && <Paperclip size={12} aria-hidden="true" />}
                {c.lastBody ?? (c.lastHasFile ? "File" : "No messages yet")}
              </>
            )}
          </span>
        </span>
        {c.unread > 0 && <span className={styles.unread} aria-label={`${c.unread} unread`}>{c.unread}</span>}
      </button>
      {hasMenu(c, isNew) && (
        <span className={styles.rowMenu}>
          <ChatActionsMenu peerId={c.peerId} name={c.fullName || c.email} onDone={() => onChanged?.(c)} />
        </span>
      )}
    </li>
  );

  const nothingYet = conversations.length === 0 && groups.length === 0 && !onNewGroup && !canSearch;

  return (
    <nav className={styles.panel} aria-label={`${noun[0].toUpperCase()}${noun.slice(1)}s`}>
      <label className={styles.search}>
        <Search size={16} aria-hidden="true" />
        <span className={styles.srOnly}>{findNew ? `Search for a ${noun} to start a chat` : `Search ${noun}s by name or email`}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={findNew ? `Search a ${noun} to start a chat` : `Search ${noun}s`}
          maxLength={100}
        />
      </label>

      {/* Group chats: an admin makes them and adds students; every student in a group (and every admin) can talk in it. */}
      {(shownGroups.length > 0 || onNewGroup) && (
        <>
          <p className={styles.headingRow}>
            <span className={styles.headingText}><Users size={13} aria-hidden="true" /> Groups</span>
            {onNewGroup && (
              <button type="button" className={styles.newGroup} onClick={onNewGroup}><Plus size={13} aria-hidden="true" /> New group</button>
            )}
          </p>
          {shownGroups.length === 0 ? (
            <p className={styles.hint}>{groups.length === 0 ? "No groups yet." : "No groups match your search."}</p>
          ) : (
            <ul className={styles.list}>
              {shownGroups.map((g) => (
                <li key={g.id}>
                  <button type="button" className={`${styles.item} ${g.id === selectedGroupId ? styles.active : ""}`} onClick={() => onSelectGroup?.(g)} aria-current={g.id === selectedGroupId ? "true" : undefined}>
                    <span className={styles.groupIcon}><Users size={18} aria-hidden="true" /></span>
                    <span className={styles.text}>
                      <span className={styles.top}>
                        <strong className={styles.name}>{g.name}</strong>
                        {g.lastAt && <span className={styles.when}>{day(g.lastAt)}</span>}
                      </span>
                      <span className={styles.preview}>
                        {g.lastHasFile && <Paperclip size={12} aria-hidden="true" />}
                        {g.lastBody ?? (g.lastHasFile ? "File" : `${g.memberCount} ${g.memberCount === 1 ? "student" : "students"}`)}
                      </span>
                    </span>
                    {g.unread > 0 && <span className={styles.unread} aria-label={`${g.unread} unread`}>{g.unread}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {shown.length > 0 && (
        <>
          {findNew && <p className={styles.heading}>{text ? "Your chats" : "Chats"}</p>}
          <ul className={styles.list}>{shown.map((c) => row(c, false))}</ul>
        </>
      )}

      {findNew && canSearch && (
        <>
          <p className={styles.heading}><UserPlus size={13} aria-hidden="true" /> Start a new chat</p>
          {searchError ? (
            <p className={styles.empty} role="alert">{searchError}</p>
          ) : searching && fresh.length === 0 ? (
            <p className={styles.empty}>Searching...</p>
          ) : fresh.length === 0 ? (
            <p className={styles.empty}>No {noun} found with that name or email.</p>
          ) : (
            <ul className={styles.list}>{fresh.map((p) => row(p, true))}</ul>
          )}
        </>
      )}

      {findNew && !canSearch && text.length > 0 && <p className={styles.hint}>Type at least {MIN_LETTERS} letters to search for a {noun}.</p>}

      {nothingYet && (
        <p className={styles.empty}>
          {findNew ? `No chats yet. Search for a ${noun} above to start one.` : `No ${noun}s yet.`}
        </p>
      )}
      {!findNew && conversations.length > 0 && shown.length === 0 && <p className={styles.empty}>No {noun}s match your search.</p>}
    </nav>
  );
}
