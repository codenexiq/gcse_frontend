import { Fragment } from "react";
import styles from "./LinkedText.module.css";

// http(s):// links and www. links. Anything else stays plain text, so nothing like javascript: can ever become a link.
const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;
// Punctuation that usually ends a sentence, not the link.
const TRAILING = /[.,;:!?)\]}]+$/;

/** Message text where web links can be clicked: they open in a new tab, for the sender and the receiver alike. */
export default function LinkedText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    const raw = match[0];
    const shown = raw.replace(TRAILING, "");
    if (start > last) parts.push(text.slice(last, start));
    const href = /^https?:\/\//i.test(shown) ? shown : `https://${shown}`;
    parts.push(
      <a key={start} href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
        {shown}
      </a>
    );
    last = start + shown.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  );
}
