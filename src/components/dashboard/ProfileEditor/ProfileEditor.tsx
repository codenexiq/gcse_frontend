"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import StudentProfileCard from "@/components/tutor/StudentProfileCard";
import StudentProfileFields, { type StudentFormState, type UsernameState } from "@/components/tutor/StudentProfileFields";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { passwordProblem } from "@/lib/passwordRules";
import { resizeImage } from "@/lib/resizeImage";
import { changePassword, profileImageUrl, removeProfileImage, saveProfileDetails, uploadProfileImage, usernameAvailableForMe } from "@/services/profileService";
import type { ProfileData } from "@/types";
import styles from "./ProfileEditor.module.css";

const ROLE_LABEL = { student: "Student", tutor: "Tutor", admin: "Administrator" } as const;
const SIZES = { avatar: { width: 512, height: 512 }, cover: { width: 1600, height: 500 } } as const;

/** A picture the person chose (not saved yet), or a removal. */
interface PictureChange {
  blob?: Blob;
  preview?: string;
  remove?: boolean;
}

/**
 * "My profile" for students, tutors and admins: the same screen as the one used to manage a student,
 * but for your own account (a live card on the left, your details on the right).
 */
export default function ProfileEditor({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<StudentFormState>({
    username: profile.username,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    gender: profile.gender,
    headline: profile.headline,
    location: profile.location,
    bio: profile.bio,
    isActive: true,
    current: "",
    password: "",
    confirm: "",
  });
  const [avatar, setAvatar] = useState<PictureChange>({});
  const [cover, setCover] = useState<PictureChange>({});
  const [usernameState, setUsernameState] = useState<UsernameState>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) => setValues((old) => ({ ...old, [key]: value }));

  // Previews are temporary addresses for pictures not saved yet: give them back when no longer needed.
  const previews = useRef<string[]>([]);
  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  async function pick(kind: "avatar" | "cover", file: File) {
    setError("");
    try {
      const { width, height } = SIZES[kind];
      const blob = await resizeImage(file, width, height);
      const preview = URL.createObjectURL(blob);
      previews.current.push(preview);
      (kind === "avatar" ? setAvatar : setCover)({ blob, preview });
    } catch (err) {
      setError(err instanceof Error ? err.message : "That picture could not be used.");
    }
  }

  const shown = (change: PictureChange, saved: string | null) => (change.preview ? change.preview : change.remove ? null : saved);
  const savedAvatar = profile.avatarVersion ? profileImageUrl("avatar", profile.avatarVersion) : null;
  const savedCover = profile.coverVersion ? profileImageUrl("cover", profile.coverVersion) : null;

  const changingPassword = Boolean(values.current || values.password || values.confirm);

  /** The first thing wrong with the form, as a sentence (empty = fine to send). */
  function problem(): string {
    if (!values.firstName.trim()) return "Please enter your first name.";
    if (usernameState === "taken") return "That username is already taken. Please choose another.";
    if (usernameState === "invalid") return "The username needs 3-30 letters, numbers, dots or underscores.";
    if (usernameState === "checking") return "One moment: still checking the username.";
    if (changingPassword) {
      if (!values.current) return "To change your password, enter your current password.";
      const weak = passwordProblem(values.password);
      if (weak) return weak.replace("The password", "The new password");
      if (values.password !== values.confirm) return "The two new passwords are not the same.";
    }
    return "";
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const wrong = problem();
    if (wrong) {
      setError(wrong);
      return;
    }
    setBusy(true);
    setError("");
    try {
      // The password goes first: if the current one is wrong, nothing else is changed.
      if (changingPassword) await changePassword(values.current, values.password);
      await saveProfileDetails({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        phone: values.phone,
        gender: values.gender,
        headline: values.headline,
        location: values.location,
        bio: values.bio,
      });
      if (avatar.blob) await uploadProfileImage("avatar", avatar.blob);
      else if (avatar.remove) await removeProfileImage("avatar");
      if (cover.blob) await uploadProfileImage("cover", cover.blob);
      else if (cover.remove) await removeProfileImage("cover");
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
      return;
    }
    toast.success(changingPassword ? "Your profile was saved and your password was changed. Other devices were signed out." : "Your profile was saved.", { title: "Saved" });
    setValues((old) => ({ ...old, current: "", password: "", confirm: "" })); // never leave passwords sitting in the boxes
    setBusy(false);
    router.refresh(); // the name and picture in the header change too
  }

  return (
    // Keyed by what is saved, so after saving the form shows what the server holds.
    <form key={`${profile.fullName}|${profile.username}|${profile.avatarVersion}|${profile.coverVersion}|${profile.bio}`} className={styles.layout} onSubmit={save} noValidate>
      <StudentProfileCard
        avatarSrc={shown(avatar, savedAvatar)}
        coverSrc={shown(cover, savedCover)}
        firstName={values.firstName}
        lastName={values.lastName}
        username={values.username}
        email={values.email}
        studentCode={profile.userCode}
        headline={values.headline}
        location={values.location}
        gender={values.gender}
        phone={values.phone}
        bio={values.bio}
        roleLabel={ROLE_LABEL[profile.role]}
        onPickAvatar={(f) => pick("avatar", f)}
        onPickCover={(f) => pick("cover", f)}
        onRemoveAvatar={() => setAvatar({ remove: true })}
        onRemoveCover={() => setCover({ remove: true })}
        disabled={busy}
      />

      <section className={styles.panel} aria-label="My profile">
        <header className={styles.head}>
          <h2 className={styles.title}>My Profile</h2>
          <p className={styles.subtitle}>Update your details, your pictures and your password</p>
        </header>
        <div className={styles.body}>
          <StudentProfileFields
            values={values}
            onChange={set}
            mode="self"
            studentCode={profile.userCode}
            checkUsername={async (name) => (await usernameAvailableForMe(name)).available}
            savedUsername={profile.username}
            onUsernameState={setUsernameState}
          />
          {error && <p className={styles.error} role="alert">{error}</p>}
        </div>
        <footer className={styles.footer}>
          <button type="submit" className={styles.submit} disabled={busy}>{busy ? "Saving..." : "Save changes"}</button>
        </footer>
      </section>
    </form>
  );
}
