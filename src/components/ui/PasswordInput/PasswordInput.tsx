"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./PasswordInput.module.css";

/** A password box with an eye button that shows or hides what was typed. It looks like the other boxes of the page it is in. */
export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [shown, setShown] = useState(false);
  return (
    <span className={styles.wrap}>
      <input {...props} type={shown ? "text" : "password"} className={`${props.className ?? ""} ${styles.input}`.trim()} />
      <button type="button" className={styles.eye} onClick={() => setShown(!shown)} aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown}>
        {shown ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </span>
  );
}
