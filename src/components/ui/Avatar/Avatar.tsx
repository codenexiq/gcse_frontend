import styles from "./Avatar.module.css";

interface Props {
  name: string;
  size?: number;
  /** The person's profile picture. Without it (or if it cannot be shown) the first letter of the name is used. */
  src?: string | null;
}

/** A soft round bubble showing the profile picture, or the first letter of a name, e.g. "jane@x.com" -> "J". */
export default function Avatar({ name, size = 38, src }: Props) {
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={size} height={size} className={styles.image} />
      ) : (
        name.trim().charAt(0).toUpperCase() || "?"
      )}
    </span>
  );
}
