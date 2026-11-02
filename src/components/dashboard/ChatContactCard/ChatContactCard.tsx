"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Info, Mail, MapPin, Phone, Quote, Tag, User } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { getChatPeer } from "@/services/chatService";
import { userAvatarUrl, userCoverUrl } from "@/services/profileService";
import type { ChatConversation, ChatPeer } from "@/types";
import styles from "./ChatContactCard.module.css";

const ROLE_LABEL = { student: "Student", tutor: "Tutor", admin: "Administrator" } as const;

/**
 * The card on the right of an open chat: the other person's picture, name and what they wrote about themselves.
 * Students see it for their tutor or admin, and tutors and admins see it for the student.
 */
export default function ChatContactCard({ person }: { person: ChatConversation }) {
  const [info, setInfo] = useState<ChatPeer | null>(null);

  // Loads the details when the chat changes, and again when the picture in the list changes.
  useEffect(() => {
    let current = true;
    getChatPeer(person.peerId)
      .then((peer) => current && setInfo(peer))
      .catch(() => current && setInfo(null)); // the name and picture we already have are still shown
    return () => {
      current = false;
    };
  }, [person.peerId, person.avatarVersion]);

  // Details of someone else's chat must not linger while the new person's load.
  const loaded = info && info.id === person.peerId ? info : null;
  const name = loaded?.fullName || person.fullName || person.email;
  const avatarVersion = loaded ? loaded.avatarVersion : person.avatarVersion;
  const avatarSrc = avatarVersion ? userAvatarUrl(person.peerId, avatarVersion) : null;
  const coverSrc = loaded?.coverVersion ? userCoverUrl(person.peerId, loaded.coverVersion) : null;

  const detail = (icon: React.ReactNode, label: string, value: string | undefined) =>
    value ? (
      <li className={styles.detail}>
        <span className={styles.tile}>{icon}</span>
        <span className={styles.text}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
        </span>
      </li>
    ) : null;

  const hasDetails = Boolean(loaded && (loaded.headline || loaded.location || loaded.bio || loaded.userCode));

  return (
    <aside className={styles.card} aria-label={`About ${name}`}>
      <div className={styles.cover}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {coverSrc && <img src={coverSrc} alt="" className={styles.coverImage} />}
      </div>
      <div className={styles.avatar}>
        <Avatar name={name} size={104} src={avatarSrc} />
      </div>
      <div className={styles.who}>
        <h3 className={styles.name}>{name}</h3>
        {loaded?.username && <p className={styles.username}>@{loaded.username}</p>}
        <span className={styles.role}>{ROLE_LABEL[person.peerRole]}</span>
      </div>
      {loaded?.isActive === false && <p className={styles.inactive}>Inactive account</p>}
      <ul className={styles.details}>
        {/* Tutors and admins get every detail of a student; a student only gets what a tutor or admin shows on their profile. */}
        {detail(<Tag size={15} aria-hidden="true" />, "Student ID", loaded?.userCode ?? undefined)}
        {detail(<Mail size={15} aria-hidden="true" />, "Email", loaded?.email)}
        {detail(<Phone size={15} aria-hidden="true" />, "Mobile", loaded?.phone)}
        {detail(<User size={15} aria-hidden="true" />, "Gender", loaded?.gender)}
        {detail(<Quote size={15} aria-hidden="true" />, "Headline", loaded?.headline)}
        {detail(<MapPin size={15} aria-hidden="true" />, "Location", loaded?.location)}
        {detail(<CalendarDays size={15} aria-hidden="true" />, "Joined", loaded?.createdAt ? new Date(loaded.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : undefined)}
        {detail(<Info size={15} aria-hidden="true" />, "About", loaded?.bio)}
      </ul>
      {loaded && !hasDetails && <p className={styles.empty}>{name.split(" ")[0]} has not added any information yet.</p>}
    </aside>
  );
}
