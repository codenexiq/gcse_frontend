"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Search, Users, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { addGroupMembers, getChatGroup, removeGroupMember, searchStudents, updateChatGroup } from "@/services/chatService";
import { userAvatarUrl } from "@/services/profileService";
import type { ChatConversation, ChatGroupDetail, ChatGroupMember, ChatGroupSummary } from "@/types";
import styles from "./ChatGroupCard.module.css";

interface Props {
  group: ChatGroupSummary;
  /** Admins can rename the group and add or remove students. */
  canManage: boolean;
  /** Called after something changed, so the list can refresh. */
  onChanged: () => void;
}

/** The card on the right of a group chat: the group, and who is in it. Admins manage the students here. */
export default function ChatGroupCard({ group, canManage, onChanged }: Props) {
  const toast = useToast();
  const [detail, setDetail] = useState<ChatGroupDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<ChatConversation[]>([]);
  const [removing, setRemoving] = useState<ChatGroupMember | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setDetail(await getChatGroup(group.id));
    } catch {
      // The name we already have is still shown.
    }
  }, [group.id]);

  useEffect(() => {
    setDetail(null);
    setEditing(false);
    setQuery("");
    reload();
  }, [group.id, group.memberCount, reload]);

  // Looks for students to add, a moment after the typing stops (at least 2 letters).
  useEffect(() => {
    const text = query.trim();
    if (!canManage || text.length < 2) {
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
  }, [query, canManage]);

  const loaded = detail && detail.id === group.id ? detail : null;
  const members = loaded?.members ?? [];
  const title = loaded?.name ?? group.name;
  const about = loaded ? loaded.description : group.description;
  const addable = found.filter((p) => !members.some((m) => m.id === p.peerId));

  async function act(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const add = (person: ChatConversation) =>
    act(async () => {
      setDetail(await addGroupMembers(group.id, [person.peerId]));
      setQuery("");
      toast.success(`${person.fullName || person.email} was added to the group.`, { title: "Added" });
      onChanged();
    });

  const remove = (member: ChatGroupMember) =>
    act(async () => {
      setDetail(await removeGroupMember(group.id, member.id));
      setRemoving(null);
      toast.success(`${member.fullName} was removed from the group.`, { title: "Removed" });
      onChanged();
    });

  const save = () =>
    act(async () => {
      if (!name.trim()) throw new ApiError("Please give the group a name.", 400);
      setDetail(await updateChatGroup(group.id, { name, description }));
      setEditing(false);
      toast.success("The group was updated.", { title: "Saved" });
      onChanged();
    });

  return (
    <aside className={styles.card} aria-label={`About the group ${title}`}>
      <div className={styles.cover} />
      <div className={styles.icon}><Users size={40} aria-hidden="true" /></div>

      {editing ? (
        <div className={styles.edit}>
          <label className={styles.field}>
            Group name
            <input className={styles.input} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className={styles.field}>
            Description
            <input className={styles.input} value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className={styles.buttons}>
            <button type="button" className={styles.primary} onClick={save} disabled={busy}>Save</button>
            <button type="button" className={styles.plain} onClick={() => { setEditing(false); setError(""); }} disabled={busy}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className={styles.who}>
          <h3 className={styles.name}>{title}</h3>
          <span className={styles.tag}>Group &middot; {members.length || group.memberCount} {(members.length || group.memberCount) === 1 ? "student" : "students"}</span>
          {about && <p className={styles.about}>{about}</p>}
          {canManage && (
            <button type="button" className={styles.editButton} onClick={() => { setName(title); setDescription(about); setEditing(true); }}>
              <Pencil size={13} aria-hidden="true" /> Edit group
            </button>
          )}
        </div>
      )}

      {error && <p className={styles.error} role="alert">{error}</p>}

      {canManage && (
        <div className={styles.addBox}>
          <span className={styles.search}>
            <Search size={15} aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a student to add" maxLength={100} aria-label="Search a student to add" autoComplete="off" />
          </span>
          {query.trim().length >= 2 && (
            addable.length === 0 ? (
              <p className={styles.note}>No more students found.</p>
            ) : (
              <ul className={styles.results}>
                {addable.map((p) => (
                  <li key={p.peerId}>
                    <button type="button" className={styles.result} onClick={() => add(p)} disabled={busy}>
                      <Avatar name={p.fullName || p.email} size={28} src={p.avatarVersion ? userAvatarUrl(p.peerId, p.avatarVersion) : null} />
                      <span className={styles.resultName}>{p.fullName || p.email}</span>
                      <span className={styles.add}>Add</span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      )}

      <p className={styles.heading}>Students in this group</p>
      {members.length === 0 ? (
        <p className={styles.note}>{loaded ? "No students yet." : "Loading..."}</p>
      ) : (
        <ul className={styles.members}>
          {members.map((m) => (
            <li key={m.id} className={styles.member}>
              <Avatar name={m.fullName} size={32} src={m.avatarVersion ? userAvatarUrl(m.id, m.avatarVersion) : null} />
              <span className={styles.memberName}>{m.fullName}</span>
              {canManage && (
                <button type="button" className={styles.remove} onClick={() => setRemoving(m)} aria-label={`Remove ${m.fullName} from the group`} title="Remove from the group">
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={removing !== null}
        title="Remove this student?"
        actions={[{ label: "Remove", tone: "danger", onClick: () => removing && remove(removing) }]}
        onClose={() => { setRemoving(null); setError(""); }}
        busy={busy}
        error={error}
      >
        <p><strong>{removing?.fullName}</strong> will no longer see this group or its messages. Their earlier messages stay in the group.</p>
      </ConfirmDialog>
    </aside>
  );
}
