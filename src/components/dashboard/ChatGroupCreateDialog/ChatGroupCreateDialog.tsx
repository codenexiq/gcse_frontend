"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ApiError } from "@/lib/api";
import { createChatGroup, searchStudents } from "@/services/chatService";
import { userAvatarUrl } from "@/services/profileService";
import type { ChatConversation, ChatGroupDetail } from "@/types";
import styles from "./ChatGroupCreateDialog.module.css";

interface Props {
  onClose: () => void;
  onCreated: (group: ChatGroupDetail) => void;
}

/** The "New group" pop-up (admins only): a name, and the students to put in the group. Students are found by searching. */
export default function ChatGroupCreateDialog({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [chosen, setChosen] = useState<ChatConversation[]>([]);
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<ChatConversation[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Looks for students a moment after the typing stops (at least 2 letters).
  useEffect(() => {
    const text = query.trim();
    if (text.length < 2) {
      setFound([]);
      return;
    }
    let current = true;
    const timer = setTimeout(async () => {
      try {
        const people = await searchStudents(text);
        if (current) setFound(people);
      } catch {
        if (current) setFound([]);
      }
    }, 300);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query]);

  const available = found.filter((p) => !chosen.some((c) => c.peerId === p.peerId));

  async function create() {
    if (busy) return;
    if (!name.trim()) {
      setError("Please give the group a name.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      onCreated(await createChatGroup({ name, description, studentIds: chosen.map((p) => p.peerId) }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    create();
  }

  return (
    <ConfirmDialog open title="New group" actions={[{ label: "Create group", onClick: create }]} onClose={onClose} busy={busy} error={error}>
      <form className={styles.form} onSubmit={submit}>
        <label className={styles.field}>
          Group name
          <input className={styles.input} value={name} maxLength={80} placeholder="e.g. Maths Year 11" onChange={(e) => setName(e.target.value)} autoComplete="off" />
        </label>
        <label className={styles.field}>
          Description (optional)
          <input className={styles.input} value={description} maxLength={300} placeholder="What is this group for?" onChange={(e) => setDescription(e.target.value)} autoComplete="off" />
        </label>

        <div className={styles.field}>
          Students in the group {chosen.length > 0 && <span className={styles.count}>({chosen.length})</span>}
          {chosen.length > 0 && (
            <ul className={styles.chips}>
              {chosen.map((p) => (
                <li key={p.peerId} className={styles.chip}>
                  <Avatar name={p.fullName || p.email} size={22} src={p.avatarVersion ? userAvatarUrl(p.peerId, p.avatarVersion) : null} />
                  <span className={styles.chipName}>{p.fullName || p.email}</span>
                  <button type="button" className={styles.chipRemove} onClick={() => setChosen((all) => all.filter((c) => c.peerId !== p.peerId))} aria-label={`Remove ${p.fullName || p.email}`}>
                    <X size={12} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <span className={styles.search}>
            <Search size={15} aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a student to add" maxLength={100} aria-label="Search a student to add" autoComplete="off" />
          </span>
          {query.trim().length >= 2 && (
            available.length === 0 ? (
              <span className={styles.note}>No more students found with that name or email.</span>
            ) : (
              <ul className={styles.results}>
                {available.map((p) => (
                  <li key={p.peerId}>
                    <button type="button" className={styles.result} onClick={() => { setChosen((all) => [...all, p]); setQuery(""); }}>
                      <Avatar name={p.fullName || p.email} size={30} src={p.avatarVersion ? userAvatarUrl(p.peerId, p.avatarVersion) : null} />
                      <span className={styles.resultText}>
                        <strong>{p.fullName || p.email}</strong>
                        <span>{p.email}</span>
                      </span>
                      <span className={styles.add}>Add</span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
        {/* Lets Enter send the form. */}
        <button type="submit" hidden />
      </form>
    </ConfirmDialog>
  );
}
