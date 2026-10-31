import styles from "./Avatar.module.css";

/** A soft round bubble showing the first letter of a name, e.g. "jane@x.com" -> "J". */
export default function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
