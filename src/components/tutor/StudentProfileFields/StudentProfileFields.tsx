"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Eye, EyeOff, Info, Lock, Mail, MapPin, Phone, Quote, ShieldCheck, Tag, User, X } from "lucide-react";
import { generatePassword } from "@/lib/passwordRules";
import styles from "./StudentProfileFields.module.css";

/** Everything typed into the form. */
export interface StudentFormState {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  headline: string;
  location: string;
  bio: string;
  isActive: boolean;
  /** Only used in "self" mode: the password you have now. */
  current: string;
  password: string;
  confirm: string;
}

interface Props {
  values: StudentFormState;
  onChange: <K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) => void;
  /**
   * "create": an admin or tutor adds a student. "edit": an admin or tutor changes a student.
   * "self": a person edits their own profile (no Status, the email is fixed, and a new password needs the current one).
   */
  mode: "create" | "edit" | "self";
  /** The student ID to show (self mode; tutors and admins have none). */
  studentCode?: string | null;
  /** Says whether a username is free. */
  checkUsername: (username: string) => Promise<boolean>;
  /** The username the student has now (no need to check it again until it changes). */
  savedUsername?: string;
  /** Tells the form whether the username is usable, so it can refuse to send a taken one. */
  onUsernameState: (state: UsernameState) => void;
}

export type UsernameState = "idle" | "checking" | "available" | "taken" | "invalid";

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

/** One labelled input with an icon inside, like the design. */
function Field({ label, required, icon, children, note, wide }: { label: string; required?: boolean; icon: ReactNode; children: ReactNode; note?: ReactNode; wide?: boolean }) {
  return (
    <label className={`${styles.field} ${wide ? styles.wide : ""}`}>
      <span className={styles.label}>{label}{required && <span className={styles.star}> *</span>}</span>
      <span className={styles.box}>
        <span className={styles.icon}>{icon}</span>
        {children}
      </span>
      {note}
    </label>
  );
}

/** The form on the right: the student's details, the username check, and the password. */
export default function StudentProfileFields({ values: v, onChange, mode, studentCode, checkUsername, savedUsername = "", onUsernameState }: Props) {
  const creating = mode === "create";
  const self = mode === "self";
  const [username, setUsername] = useState<UsernameState>("idle");
  const [showPassword, setShowPassword] = useState(false);

  // Asks whether the @username is free, a moment after the typing stops.
  useEffect(() => {
    const name = v.username.trim().toLowerCase();
    let state: UsernameState | null = null;
    if (!name || name === savedUsername) state = "idle";
    else if (!/^[a-z0-9_.]{3,30}$/.test(name)) state = "invalid";
    if (state) {
      setUsername(state);
      onUsernameState(state);
      return;
    }
    setUsername("checking");
    onUsernameState("checking");
    let current = true;
    const timer = setTimeout(async () => {
      try {
        const available = await checkUsername(name);
        if (current) {
          const next = available ? "available" : "taken";
          setUsername(next);
          onUsernameState(next);
        }
      } catch {
        if (current) {
          setUsername("idle");
          onUsernameState("idle"); // the server checks again when you save
        }
      }
    }, 400);
    return () => {
      current = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.username, savedUsername]);

  const text = (key: keyof StudentFormState, extra: { type?: string; placeholder: string; maxLength: number; autoComplete?: string; required?: boolean }) => (
    <input
      className={styles.input}
      type={extra.type ?? "text"}
      value={String(v[key])}
      placeholder={extra.placeholder}
      maxLength={extra.maxLength}
      autoComplete={extra.autoComplete ?? "off"}
      required={extra.required}
      onChange={(e) => onChange(key, e.target.value as never)}
    />
  );

  const usernameNote =
    username === "available" ? <span className={`${styles.note} ${styles.good}`}>Username is available</span>
    : username === "taken" ? <span className={`${styles.note} ${styles.bad}`}>That username is already taken</span>
    : username === "invalid" ? <span className={`${styles.note} ${styles.bad}`}>3-30 letters, numbers, dots or underscores</span>
    : username === "checking" ? <span className={styles.note}>Checking...</span>
    : null;

  const eye = (
    <button type="button" className={styles.eye} onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide the passwords" : "Show the passwords"}>
      {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
    </button>
  );

  return (
    <div className={styles.grid}>
      {(!self || studentCode) && (
        <Field label={self ? "User ID" : "Student ID"} icon={<Tag size={16} aria-hidden="true" />} wide note={<span className={styles.note}>{self ? "Your ID is fixed and cannot be changed." : "The ID is made automatically when the account is created (for example STU-00042)."}</span>}>
          <input className={`${styles.input} ${styles.readonly}`} value={self ? (studentCode ?? "") : creating ? "Made automatically" : "Shown on the left"} readOnly disabled />
        </Field>
      )}

      <label className={styles.field}>
        <span className={styles.label}>Username{creating && <span className={styles.star}> *</span>}</span>
        <span className={`${styles.box} ${username === "available" ? styles.okBox : username === "taken" || username === "invalid" ? styles.badBox : ""}`}>
          <span className={styles.icon}><User size={16} aria-hidden="true" /></span>
          <input className={styles.input} value={v.username} placeholder="Choose a username" maxLength={30} autoComplete="off" required={creating} onChange={(e) => onChange("username", e.target.value.toLowerCase())} />
          {username === "available" && <Check size={16} className={styles.tick} aria-hidden="true" />}
          {(username === "taken" || username === "invalid") && <X size={16} className={styles.cross} aria-hidden="true" />}
        </span>
        {usernameNote}
      </label>

      {!self && (
      <label className={styles.field}>
        <span className={styles.label}>Status</span>
        <span className={styles.box}>
          <span className={styles.icon}><ShieldCheck size={16} aria-hidden="true" /></span>
          <select className={styles.input} value={v.isActive ? "active" : "inactive"} onChange={(e) => onChange("isActive", e.target.value === "active")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive (cannot sign in)</option>
          </select>
        </span>
      </label>
      )}

      <Field label="First Name" required icon={<User size={16} aria-hidden="true" />}>
        {text("firstName", { placeholder: "First name", maxLength: 50, autoComplete: "off", required: true })}
      </Field>
      <Field label="Last Name" icon={<User size={16} aria-hidden="true" />}>
        {text("lastName", { placeholder: "Last name", maxLength: 49 })}
      </Field>

      <Field label="Mobile Number" icon={<Phone size={16} aria-hidden="true" />}>
        {text("phone", { type: "tel", placeholder: "+44 300 400 5050", maxLength: 25 })}
      </Field>
      <Field label="Email" required icon={<Mail size={16} aria-hidden="true" />} note={self ? <span className={styles.note}>Your email is used to sign in, so it cannot be changed here.</span> : undefined}>
        {self ? <input className={`${styles.input} ${styles.readonly}`} value={v.email} readOnly disabled /> : text("email", { type: "email", placeholder: "name@example.com", maxLength: 254, required: true })}
      </Field>

      <Field label="Headline" icon={<Quote size={16} aria-hidden="true" />}>
        {text("headline", { placeholder: "e.g. Year 11, GCSE Maths", maxLength: 100 })}
      </Field>
      <Field label="Location" icon={<MapPin size={16} aria-hidden="true" />}>
        {text("location", { placeholder: "e.g. Lahore", maxLength: 100 })}
      </Field>

      <Field label="Gender" icon={<User size={16} aria-hidden="true" />}>
        <select className={styles.input} value={v.gender} onChange={(e) => onChange("gender", e.target.value)}>
          <option value="">Select gender</option>
          {GENDERS.map((g) => <option key={g}>{g}</option>)}
        </select>
      </Field>
      <Field label="About" icon={<Info size={16} aria-hidden="true" />} note={<span className={styles.count}>{v.bio.length} / 1000</span>}>
        {text("bio", { placeholder: "A few lines about the student", maxLength: 1000 })}
      </Field>

      {self && (
        <label className={`${styles.field} ${styles.wide}`}>
          <span className={styles.label}>Current password</span>
          <span className={styles.box}>
            <span className={styles.icon}><Lock size={16} aria-hidden="true" /></span>
            <input className={styles.input} type={showPassword ? "text" : "password"} value={v.current} placeholder="Only needed to change your password" maxLength={72} autoComplete="current-password" onChange={(e) => onChange("current", e.target.value)} />
            {eye}
          </span>
        </label>
      )}
      <label className={styles.field}>
        <span className={styles.labelRow}>
          <span className={styles.label}>{creating ? "Password" : "New password"}{creating && <span className={styles.star}> *</span>}</span>
          <button type="button" className={styles.generate} onClick={() => { const p = generatePassword(); onChange("password", p); onChange("confirm", p); setShowPassword(true); }}>Generate a strong one</button>
        </span>
        <span className={styles.box}>
          <span className={styles.icon}><Lock size={16} aria-hidden="true" /></span>
          <input className={styles.input} type={showPassword ? "text" : "password"} value={v.password} placeholder={creating ? "Enter password" : "Leave empty to keep the current one"} maxLength={72} autoComplete="new-password" required={creating} onChange={(e) => onChange("password", e.target.value)} />
          {!self && eye}
        </span>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Confirm Password{creating && <span className={styles.star}> *</span>}</span>
        <span className={styles.box}>
          <span className={styles.icon}><Lock size={16} aria-hidden="true" /></span>
          <input className={styles.input} type={showPassword ? "text" : "password"} value={v.confirm} placeholder="Confirm password" maxLength={72} autoComplete="new-password" required={creating} onChange={(e) => onChange("confirm", e.target.value)} />
          {!self && eye}
        </span>
      </label>
      <p className={`${styles.note} ${styles.wide}`}>
        {creating
          ? "At least 10 characters, with a lowercase letter, an uppercase letter and a number. Give the password to the student in a safe way; they can change it in My profile."
          : self
            ? "To change your password, fill in all three password boxes (at least 10 characters, with a lowercase letter, an uppercase letter and a number). Your other devices will be signed out."
            : "A new password signs the student out everywhere."}
      </p>
    </div>
  );
}
