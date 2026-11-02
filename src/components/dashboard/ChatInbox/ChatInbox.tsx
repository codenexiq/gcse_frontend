"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import ChatActionsMenu from "@/components/dashboard/ChatActionsMenu";
import ChatContactCard from "@/components/dashboard/ChatContactCard";
import ChatConversationList from "@/components/dashboard/ChatConversationList";
import ChatGroupActionsMenu from "@/components/dashboard/ChatGroupActionsMenu";
import ChatGroupCard from "@/components/dashboard/ChatGroupCard";
import ChatGroupCreateDialog from "@/components/dashboard/ChatGroupCreateDialog";
import ChatThread from "@/components/dashboard/ChatThread";
import { getChatGroups, getConversations, groupApi, personApi, searchStudents } from "@/services/chatService";
import { userAvatarUrl } from "@/services/profileService";
import type { ChatConversation, ChatGroupDetail, ChatGroupSummary } from "@/types";
import styles from "./ChatInbox.module.css";

const REFRESH_MS = 15000;

interface Props {
  initial: ChatConversation[];
  /** The group chats this person can open. */
  initialGroups: ChatGroupSummary[];
  /** The signed-in person. */
  meId: number;
  /** What the people in the list are: "student" (the tutor's page) or "tutor" (the student's page). */
  noun: "student" | "tutor";
  /** Admins make groups, add students to them and can remove any message in them. */
  canManageGroups: boolean;
}

/** What a group looks like in the list when it was just made (before the list is loaded again). */
const asSummary = (g: ChatGroupDetail): ChatGroupSummary => ({ id: g.id, name: g.name, description: g.description, memberCount: g.members.length, lastBody: null, lastHasFile: false, lastAt: null, unread: 0 });

/** A chat page: the people and groups on the left, the open chat in the middle, and a card about them on the right. */
export default function ChatInbox({ initial, initialGroups, meId, noun, canManageGroups }: Props) {
  const [conversations, setConversations] = useState(initial);
  const [groups, setGroups] = useState(initialGroups);
  // The person whose chat is open. For a student found by search there is no chat in the list yet, so we keep the person itself.
  const [picked, setPicked] = useState<ChatConversation | null>(null);
  // The group whose chat is open (only one of the two is open at a time).
  const [pickedGroup, setPickedGroup] = useState<ChatGroupSummary | null>(null);
  // Bumped when the open chat was cleared or deleted from the list, so its screen starts fresh.
  const [version, setVersion] = useState(0);
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [people, theGroups] = await Promise.all([getConversations(), getChatGroups()]);
      setConversations(people);
      setGroups(theGroups);
    } catch {
      // Keep showing the lists we have; the next check tries again.
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const selected = (picked && conversations.find((c) => c.peerId === picked.peerId)) ?? picked;
  const selectedGroup = (pickedGroup && groups.find((g) => g.id === pickedGroup.id)) ?? pickedGroup;
  const open = selected !== null || selectedGroup !== null;

  // The connection to the server for the open chat: the same object for as long as the chat stays open.
  const personConnection = useMemo(() => (selected ? personApi(selected.peerId) : null), [selected?.peerId]); // eslint-disable-line react-hooks/exhaustive-deps
  const groupConnection = useMemo(() => (selectedGroup ? groupApi(selectedGroup.id) : null), [selectedGroup?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const choosePerson = (person: ChatConversation) => {
    setPickedGroup(null);
    setPicked(person);
  };
  const chooseGroup = (group: ChatGroupSummary) => {
    setPicked(null);
    setPickedGroup(group);
  };
  const close = () => {
    setPicked(null);
    setPickedGroup(null);
  };

  return (
    <div className={`${styles.layout} ${open ? styles.threadOpen : ""}`}>
      <div className={styles.list}>
        <ChatConversationList
          conversations={conversations}
          selectedId={picked?.peerId ?? null}
          onSelect={choosePerson}
          noun={noun}
          // Tutors and admins start a new chat by searching for the student; students simply see the tutors.
          findNew={noun === "student" ? searchStudents : undefined}
          onChanged={(person) => {
            refresh();
            if (person.peerId === picked?.peerId) setVersion((v) => v + 1);
          }}
          groups={groups}
          selectedGroupId={pickedGroup?.id ?? null}
          onSelectGroup={chooseGroup}
          onNewGroup={canManageGroups ? () => setCreating(true) : undefined}
        />
      </div>

      <div className={styles.thread}>
        {selected && personConnection ? (
          <>
            <button type="button" className={styles.back} onClick={close}>&larr; All chats</button>
            <ChatThread
              key={`${selected.peerId}-${version}`}
              api={personConnection}
              meId={meId}
              title={selected.fullName || selected.email}
              peerAvatar={selected.avatarVersion ? userAvatarUrl(selected.peerId, selected.avatarVersion) : null}
              subtitle={selected.peerRole === "admin" ? "Administrator" : selected.peerRole === "tutor" ? "Tutor" : "Student"}
              emptyText="No messages yet. Say hello, or share a file."
              onRead={refresh}
              renderActions={(reset) => (
                <ChatActionsMenu
                  peerId={selected.peerId}
                  name={selected.fullName || selected.email}
                  variant="light"
                  onDone={() => {
                    reset();
                    refresh();
                  }}
                />
              )}
            />
          </>
        ) : selectedGroup && groupConnection ? (
          <>
            <button type="button" className={styles.back} onClick={close}>&larr; All chats</button>
            <ChatThread
              key={`group-${selectedGroup.id}`}
              api={groupConnection}
              meId={meId}
              title={selectedGroup.name}
              subtitle={`Group · ${selectedGroup.memberCount} ${selectedGroup.memberCount === 1 ? "student" : "students"}`}
              headIcon={<span className={styles.groupBadge}><Users size={22} aria-hidden="true" /></span>}
              canModerate={canManageGroups}
              emptyText="No messages yet. Say hello to the group, or share a file."
              onRead={refresh}
              renderActions={
                canManageGroups
                  ? () => (
                      <ChatGroupActionsMenu
                        groupId={selectedGroup.id}
                        name={selectedGroup.name}
                        onDeleted={() => {
                          close();
                          refresh();
                        }}
                      />
                    )
                  : undefined
              }
            />
          </>
        ) : (
          <p className={styles.pick}>
            {noun === "student" ? "Choose one of your chats on the left, or search for a student to start a new one." : `Choose a ${noun} or a group on the left to read and answer messages.`}
          </p>
        )}
      </div>

      {/* The card about the other person or the group, on the right of the chat (for students and for tutors and admins alike). */}
      {selected && (
        <div className={styles.card}>
          <ChatContactCard person={selected} />
        </div>
      )}
      {selectedGroup && !selected && (
        <div className={styles.card}>
          <ChatGroupCard group={selectedGroup} canManage={canManageGroups} onChanged={refresh} />
        </div>
      )}

      {creating && (
        <ChatGroupCreateDialog
          onClose={() => setCreating(false)}
          onCreated={(group) => {
            setCreating(false);
            chooseGroup(asSummary(group));
            refresh();
          }}
        />
      )}
    </div>
  );
}
