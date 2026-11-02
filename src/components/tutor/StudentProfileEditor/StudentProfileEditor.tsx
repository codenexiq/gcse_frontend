"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentProfileCard from "@/components/tutor/StudentProfileCard";
import StudentProfileFields, { type StudentFormState, type UsernameState } from "@/components/tutor/StudentProfileFields";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { passwordProblem } from "@/lib/passwordRules";
import { resizeImage } from "@/lib/resizeImage";
import { studentAvatarUrl, studentCoverUrl } from "@/services/profileService";
import { createStudent, removeStudentImage, updateStudent, uploadStudentImage, usernameAvailable } from "@/services/studentAdminService";
import type { StudentProfileData } from "@/types";
import styles from "./StudentProfileEditor.module.css";

/** A picture the person chose (not saved yet), or a removal. */
interface PictureChange {
  blob?: Blob;
  preview?: string;
  remove?: boolean;
}

const SIZES = { avatar: { width: 512, height: 512 }, cover: { width: 1600, height: 500 } } as const;

/**
 * The screen for adding a student (student = null) or managing one: a live profile card on the left,
 * the details on the right. Admins and tutors can both use it.
 */
export default function StudentProfileEditor({ student }: { student: StudentProfileData | null }) {
  const router = useRouter();
  const toast = useToast();
  const creating = student === null;
  const [values, setValues] = useState<StudentFormState>({
    username: student?.username ?? "",
    firstName: student?.firstName ?? "",
    lastName: student?.lastName ?? "",
    email: student?.email ?? "",
    phone: student?.phone ?? "",
    gender: student?.gender ?? "",
    headline: student?.headline ?? "",
    location: student?.location ?? "",
    bio: student?.bio ?? "",
    isActive: student?.isActive ?? true,
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

  // What the card shows: the new picture, nothing if it is being removed, or the saved one.
  const shown = (change: PictureChange, saved: string | null) => (change.preview ? change.preview : change.remove ? null : saved);
  const savedAvatar = student?.avatarVersion ? studentAvatarUrl(student.id, student.avatarVersion) : null;
  const savedCover = student?.coverVersion ? studentCoverUrl(student.id, student.coverVersion) : null;

  /** The first thing wrong with the form, as a sentence (empty = fine to send). */
  function problem(): string {
    if (!values.firstName.trim()) return "Please enter the first name.";
    if (!values.email.trim()) return "Please enter the email.";
    if (creating && !values.username.trim()) return "Please choose a username.";
    if (usernameState === "taken") return "That username is already taken. Please choose another.";
    if (usernameState === "invalid") return "The username needs 3-30 letters, numbers, dots or underscores.";
    if (usernameState === "checking") return "One moment: still checking the username.";
    if (creating || values.password) {
      const weak = passwordProblem(values.password);
      if (weak) return weak;
      if (values.password !== values.confirm) return "The two passwords are not the same.";
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
    const { password, confirm, current, ...fields } = values;
    void confirm;
    void current;
    let saved: StudentProfileData;
    try {
      saved = creating ? await createStudent({ ...fields, password }) : await updateStudent(student.id, { ...fields, newPassword: password || undefined });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
      return;
    }

    // The pictures are saved after the profile, because they need the student to exist.
    try {
      if (avatar.blob) await uploadStudentImage(saved.id, "avatar", avatar.blob);
      else if (avatar.remove) await removeStudentImage(saved.id, "avatar");
      if (cover.blob) await uploadStudentImage(saved.id, "cover", cover.blob);
      else if (cover.remove) await removeStudentImage(saved.id, "cover");
    } catch (err) {
      toast.error(`The profile was saved, but a picture could not be: ${err instanceof Error ? err.message : "please try again"}`);
      router.replace(`/tutor/dashboard/students/${saved.id}`);
      router.refresh();
      return;
    }

    toast.success(creating ? `${saved.fullName} can now sign in with ID ${saved.studentCode}.` : "The profile was saved.", { title: creating ? "Student created" : "Saved" });
    router.push("/tutor/dashboard/students");
    router.refresh();
  }

  return (
    <form className={styles.layout} onSubmit={save} noValidate>
      <StudentProfileCard
        avatarSrc={shown(avatar, savedAvatar)}
        coverSrc={shown(cover, savedCover)}
        firstName={values.firstName}
        lastName={values.lastName}
        username={values.username}
        email={values.email}
        studentCode={student?.studentCode ?? null}
        headline={values.headline}
        location={values.location}
        gender={values.gender}
        phone={values.phone}
        bio={values.bio}
        onPickAvatar={(f) => pick("avatar", f)}
        onPickCover={(f) => pick("cover", f)}
        onRemoveAvatar={() => setAvatar({ remove: true })}
        onRemoveCover={() => setCover({ remove: true })}
        disabled={busy}
      />

      <section className={styles.panel} aria-label={creating ? "Create a new user" : "Edit the student"}>
        <header className={styles.head}>
          <h2 className={styles.title}>{creating ? "Create New User" : "Edit Student Profile"}</h2>
          <p className={styles.subtitle}>{creating ? "Fill in the information below to create a new student account" : "Change the information below, then save"}</p>
        </header>
        <div className={styles.body}>
          <StudentProfileFields
            values={values}
            onChange={set}
            mode={creating ? "create" : "edit"}
            checkUsername={async (name) => (await usernameAvailable(name, student?.id)).available}
            savedUsername={student?.username ?? ""}
            onUsernameState={setUsernameState}
          />
          {error && <p className={styles.error} role="alert">{error}</p>}
        </div>
        <footer className={styles.footer}>
          <Link href="/tutor/dashboard/students" className={styles.cancel}>Cancel</Link>
          <button type="submit" className={styles.submit} disabled={busy}>{busy ? "Saving..." : creating ? "Create User" : "Save changes"}</button>
        </footer>
      </section>
    </form>
  );
}
