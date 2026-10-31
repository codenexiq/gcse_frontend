"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Lock, Mail, ShieldCheck, User, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import TextField from "@/components/ui/TextField";
import AuthDivider from "../AuthDivider";
import { login, register, tutorLogin } from "@/services/authService";
import { homePathFor } from "@/lib/roles";
import { useAsync } from "@/hooks/useAsync";
import { useToast } from "@/hooks/useToast";
import styles from "./AuthForm.module.css";

type Mode = "login" | "register" | "tutor";

const submitFor = { login: login, register: register, tutor: tutorLogin } as const;

/**
 * The fields and buttons inside the auth card.
 *  - "login"    student sign-in
 *  - "register" student sign-up (the only way to make an account on the website)
 *  - "tutor"    tutor / admin sign-in (tutor accounts are created by an administrator).
 *               Nothing on the site links to the tutor page - tutors and admins use a direct link.
 */
export default function AuthForm({ mode }: { mode: Mode }) {
  const isRegister = mode === "register";
  const isTutor = mode === "tutor";
  const router = useRouter();
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { run, loading, error } = useAsync(submitFor[mode]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await run(isRegister ? { fullName, email, password } : { email, password });
    if (result) {
      setPassword(""); // do not keep the password in memory longer than needed
      toast.success(isRegister ? "Your account is ready - welcome aboard!" : "Good to see you again.", {
        title: isRegister ? "Account created" : "Logged in",
      });
      router.push(homePathFor(result.user.role)); // students -> /dashboard, tutor -> /tutor/dashboard
      router.refresh(); // reload server data now that we have a session
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {isRegister && (
        <TextField
          label="Full name"
          type="text"
          value={fullName}
          onChange={setFullName}
          icon={<User />}
          autoComplete="name"
          maxLength={100}
          required
        />
      )}
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        icon={<Mail />}
        autoComplete="email"
        maxLength={254}
        required
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        icon={<Lock />}
        autoComplete={isRegister ? "new-password" : "current-password"}
        minLength={isRegister ? 10 : undefined}
        maxLength={72}
        required
      />
      {isRegister && (
        <p className={styles.hint}>
          At least 10 characters, with a lowercase letter, an uppercase letter and a number.
        </p>
      )}

      <Alert>{error}</Alert>

      <Button
        type="submit"
        variant="dark"
        fullWidth
        disabled={loading}
        icon={loading ? undefined : isRegister ? <UserPlus /> : isTutor ? <ShieldCheck /> : <LogIn />}
      >
        {loading ? <Spinner size={18} label="Please wait…" /> : isRegister ? "Create account" : "Sign in"}
      </Button>

      {/* The tutor form is deliberately bare: no links to or from the student pages. */}
      {!isTutor && (
        <>
          <AuthDivider text={isRegister ? "Already registered?" : "New to GCSE Cloud?"} />
          <Button href={isRegister ? "/login" : "/register"} variant="secondary" fullWidth>
            {isRegister ? "Sign in to your account" : "Create an account"}
          </Button>
        </>
      )}
    </form>
  );
}
