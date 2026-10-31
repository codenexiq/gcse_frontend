"use client";

import { useId, useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./TextField.module.css";

interface TextFieldProps {
  /** Read by screen readers (it is not drawn on screen - the placeholder is). */
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  placeholder?: string;
  /** A Lucide element shown inside the field on the left, e.g. <Mail /> */
  icon?: ReactNode;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

/** A grey rounded input with an icon. Password fields get a show/hide button. */
export default function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon,
  autoComplete,
  required,
  minLength,
  maxLength,
}: TextFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      {icon && <span className={styles.icon}>{icon}</span>}
      <input
        id={id}
        className={`${styles.input} ${icon ? styles.withIcon : ""} ${isPassword ? styles.withToggle : ""}`}
        type={isPassword && visible ? "text" : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
      />
      {isPassword && (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
