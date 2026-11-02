"use client";

import { useRef } from "react";
import { Camera, Info, MapPin, Phone, Quote, Tag, Trash2, User } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import styles from "./StudentProfileCard.module.css";

interface Props {
  /** The picture addresses to show (a new, not yet saved picture, or the saved one). Null = none. */
  avatarSrc: string | null;
  coverSrc: string | null;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  studentCode: string | null;
  headline: string;
  location: string;
  gender: string;
  phone: string;
  bio: string;
  /** Called with the file the person chose. */
  onPickAvatar: (file: File) => void;
  onPickCover: (file: File) => void;
  onRemoveAvatar: () => void;
  onRemoveCover: () => void;
  disabled?: boolean;
  /** The tag under the name (default "Student"). */
  roleLabel?: string;
  /** Show the ID row (tutors and admins have no ID). Default true. */
  showId?: boolean;
}

const ACCEPT = "image/png,image/jpeg,image/webp";

/** The live preview on the left: cover photo, profile picture, name, and the details as they are typed. */
export default function StudentProfileCard(p: Props) {
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const name = `${p.firstName} ${p.lastName}`.trim();

  // One line of the details list: an icon tile and the value (or a grey hint while it is empty).
  const detail = (icon: React.ReactNode, value: string, hint: string) => (
    <li className={styles.detail}>
      <span className={styles.tile}>{icon}</span>
      <span className={value ? styles.value : styles.hint}>{value || hint}</span>
    </li>
  );

  return (
    <aside className={styles.card} aria-label="Profile preview">
      <div className={styles.cover}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.coverSrc && <img src={p.coverSrc} alt="" className={styles.coverImage} />}
        <input ref={coverInput} type="file" accept={ACCEPT} className={styles.hidden} aria-label="Choose a cover photo" onChange={(e) => { const f = e.target.files?.[0]; if (f) p.onPickCover(f); e.target.value = ""; }} />
        <div className={styles.coverButtons}>
          {p.coverSrc && (
            <button type="button" className={styles.round} onClick={p.onRemoveCover} disabled={p.disabled} aria-label="Remove the cover photo" title="Remove the cover photo">
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
          <button type="button" className={styles.round} onClick={() => coverInput.current?.click()} disabled={p.disabled} aria-label="Change the cover photo" title="Change the cover photo">
            <Camera size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.avatarWrap}>
        <div className={styles.avatar}>
          <Avatar name={name || p.email || "?"} size={112} src={p.avatarSrc} />
        </div>
        <input ref={avatarInput} type="file" accept={ACCEPT} className={styles.hidden} aria-label="Choose a profile picture" onChange={(e) => { const f = e.target.files?.[0]; if (f) p.onPickAvatar(f); e.target.value = ""; }} />
        <button type="button" className={`${styles.round} ${styles.avatarCamera}`} onClick={() => avatarInput.current?.click()} disabled={p.disabled} aria-label="Change the profile picture" title="Change the profile picture">
          <Camera size={16} aria-hidden="true" />
        </button>
        {p.avatarSrc && (
          <button type="button" className={styles.removePicture} onClick={p.onRemoveAvatar} disabled={p.disabled}>Remove picture</button>
        )}
      </div>

      <div className={styles.who}>
        <h2 className={name ? styles.name : styles.nameHint}>{name || "Student name"}</h2>
        {p.username && <p className={styles.username}>@{p.username}</p>}
        <span className={styles.role}>{p.roleLabel ?? "Student"}</span>
        <p className={styles.email}>{p.email || "email@example.com"}</p>
      </div>

      <ul className={styles.details}>
        {p.showId !== false && detail(<Tag size={16} aria-hidden="true" />, p.studentCode ?? "", "ID is made when the account is created")}
        {detail(<Quote size={16} aria-hidden="true" />, p.headline, "Headline")}
        {detail(<MapPin size={16} aria-hidden="true" />, p.location, "Location")}
        {detail(<User size={16} aria-hidden="true" />, p.gender, "Gender")}
        {detail(<Phone size={16} aria-hidden="true" />, p.phone, "Mobile number")}
        {detail(<Info size={16} aria-hidden="true" />, p.bio, "About information")}
      </ul>
    </aside>
  );
}
