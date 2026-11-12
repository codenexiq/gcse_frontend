"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteIcon from "@/components/site/SiteIcon";
import PasswordInput from "@/components/ui/PasswordInput";
import { adminLogin, login, tutorLogin } from "@/services/authService";
import { homePathFor } from "@/lib/roles";

export type LoginRole = "admin" | "teacher" | "student";

const WHO: { role: LoginRole; label: string; line: string; submit: typeof login }[] = [
  { role: "student", label: "Student", line: "Your learning map, diagnostic, tasks and live classes.", submit: login },
  { role: "teacher", label: "Teacher", line: "Your classes, students and content.", submit: tutorLogin },
  { role: "admin", label: "Admin", line: "Students, teachers, plans and the website.", submit: adminLogin },
];

/**
 * The sign-in panel of the public site: logo, heading, the Student / Teacher / Admin switch and the form.
 * Each tab signs in only that kind of person (a wrong tab is the same as a wrong password).
 */
export default function LoginPanel({ initial = "student" }: { initial?: LoginRole }) {
  const router = useRouter();
  const [role, setRole] = useState<LoginRole>(initial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const who = WHO.find((w) => w.role === role) ?? WHO[0];

  function pick(next: LoginRole) {
    setRole(next);
    setPassword(""); // a typed password never moves between tabs
    setError("");
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter your email address.");
    if (!password) return setError("Enter your password.");
    setError("");
    setBusy(true);
    try {
      const result = await who.submit({ email, password });
      setPassword("");
      router.push(homePathFor(result.user.role)); // students -> /student, teachers -> /tutor, admins -> /admin
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="login stack" style={{ gap: 22 }}>
      <div className="stack" style={{ gap: 10, textAlign: "center", alignItems: "center" }}>
        <img src="/site/logo.png" alt="" style={{ width: 64, height: 64, borderRadius: 18, background: "#fff" }} />
        <h1 style={{ fontSize: "clamp(26px,4vw,34px)" }}>Log in</h1>
        <p className="muted">{who.line}</p>
      </div>

      <div className="who-tabs" role="group" aria-label="I am a">
        {WHO.map((w) => (
          <button key={w.role} type="button" aria-pressed={w.role === role} onClick={() => pick(w.role)}>
            {w.label}
          </button>
        ))}
      </div>

      <form className="card" noValidate onSubmit={submit}>
        <label className="f" htmlFor="l-email">
          Email
          <input id="l-email" type="email" autoComplete="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="f" htmlFor="l-pw">
          Password
          <PasswordInput id="l-pw" autoComplete="current-password" maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <div className="login-go">
          <button type="submit" className="btn solid" disabled={busy}>
            {busy ? "Please wait…" : <>Log in as {who.label.toLowerCase()} <SiteIcon name="arrow" /></>}
          </button>
        </div>
        {role === "student" && (
          <div className="row" style={{ justifyContent: "space-between" }}>
            <Link className="small" href="/#contact">Forgot password?</Link>
            <Link className="small" href="/register">New here? Create an account</Link>
          </div>
        )}
        {error && <p className="err" role="alert">{error}</p>}
      </form>
    </div>
  );
}
