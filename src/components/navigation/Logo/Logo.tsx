import Image from "next/image";
import Link from "next/link";
import styles from "./Logo.module.css";

/** The brand logo (it already contains the "Educate Cloud" name). Links to the home page. */
export default function Logo({ href }: { href: string }) {
  return (
    <Link href={href} className={styles.logo} aria-label="Educate Cloud - home">
      <Image
        src="/images/logo.png"
        alt="Educate Cloud"
        width={864}
        height={819}
        sizes="64px"
        priority
        className={styles.image}
      />
    </Link>
  );
}
