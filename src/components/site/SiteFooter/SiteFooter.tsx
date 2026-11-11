import Link from "next/link";
import { CONTACT } from "@/lib/siteContent";

/** The dark footer of the public website. */
export default function SiteFooter() {
  return (
    <footer>
      <div className="in">
        <div className="stack" style={{ gap: 12 }}>
          <Link className="logo" href="/" style={{ color: "var(--on-band)" }}>
            <img src="/site/logo.png" alt="" />Educate Cloud
          </Link>
          <p>Small-group Maths and Science tuition for Key Stage 3, GCSE and A-level. Live online, from Surrey, to students in the UK and abroad.</p>
        </div>
        <div>
          <h5>Learn</h5>
          <Link href="/courses">Courses</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/how-it-works">Plans</Link>
          <Link href="/login">Log in</Link>
        </div>
        <div>
          <h5>Educate Cloud</h5>
          <Link href="/about">About us</Link>
          <Link href="/about">Our tutors</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/shop">Resources shop</Link>
          <Link href="/#contact">Contact</Link>
        </div>
        <div>
          <h5>Get in touch</h5>
          <span style={{ userSelect: "all" }}>{CONTACT.email}</span>
          <br />
          <span style={{ userSelect: "all" }}>{CONTACT.phone}</span>
          <br />
          <span>WhatsApp available</span>
        </div>
        <div className="foot-base">
          <span>© {new Date().getFullYear()} Educate Cloud</span>
          <span>Privacy · Terms · Safeguarding</span>
        </div>
      </div>
    </footer>
  );
}
