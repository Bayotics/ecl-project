"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import crest from "@/assets/media/ecl-crest.png";
import { supabaseBrowser } from "@/lib/supabase/client";

import styles from "./AuthPage.module.css";

type Mode = "login" | "signup" | "forgot" | "reset";
const copy: Record<Mode, { eyebrow: string; title: string; intro: string; submit: string }> = {
  login: { eyebrow: "Member access", title: "Welcome back.", intro: "Sign in to manage your profile and event responses.", submit: "Sign in" },
  signup: { eyebrow: "Join the club", title: "Create an account.", intro: "A member account keeps your details and event responses in one place.", submit: "Create account" },
  forgot: { eyebrow: "Account recovery", title: "Reset your password.", intro: "Enter your email and we will send you a secure reset link.", submit: "Send reset link" },
  reset: { eyebrow: "Account recovery", title: "Choose a new password.", intro: "Use at least six characters for your new password.", submit: "Update password" },
};

function safeNext(value: string | null) { return value?.startsWith("/") && !value.startsWith("//") && !/[\\\u0000-\u001f]/.test(value) ? value : "/member"; }

export function AuthPage({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const text = copy[mode];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null); setNotice(null);
    try {
      const supabase = supabaseBrowser();
      if ((mode === "signup" || mode === "reset") && password.length < 6) throw new Error("Password must contain at least 6 characters.");
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin");
        if (roleError) throw new Error("Unable to check your account role. Please try signing in again.");
        const next = safeNext(new URLSearchParams(window.location.search).get("next"));
        router.replace(isAdmin ? "/admin" : /^\/admin(?:[/?#]|$)/.test(next) ? "/member" : next);
        router.refresh();
      } else if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/login` } });
        if (authError) throw authError;
        if (data.session) { router.replace("/member"); router.refresh(); } else setNotice("Check your email to confirm your account, then sign in.");
      } else if (mode === "forgot") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (authError) throw authError;
        setNotice("If an account exists for that email, a reset link is on its way.");
      } else {
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        setNotice("Your password has been updated. You can now continue to your account.");
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  return <section className={styles.shell}><div className={styles.card}>
    <Link className={styles.brand} href="/"><Image className={styles.crest} src={crest} alt="" priority /><span>Eko Club Louisiana</span></Link>
    <p className={styles.eyebrow}>{text.eyebrow}</p><h1 className={styles.title}>{text.title}</h1><p className={styles.intro}>{text.intro}</p>
    <form className={styles.form} onSubmit={submit}>
      {mode === "signup" ? <label className={styles.field}>Full name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></label> : null}
      {mode !== "reset" ? <label className={styles.field}>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label> : null}
      {mode !== "forgot" ? <label className={styles.field}>Password<input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" || mode === "reset" ? "new-password" : "current-password"} required /></label> : null}
      {error ? <p className={`${styles.message} ${styles.error}`}>{error}</p> : null}{notice ? <p className={styles.message}>{notice}</p> : null}
      <button className={styles.submit} disabled={busy} type="submit">{busy ? "Please wait…" : text.submit}</button>
    </form>
    <nav className={styles.links} aria-label="Account links">
      {mode === "login" ? <><Link href="/forgot-password">Forgot password?</Link><Link href="/signup">Create an account</Link></> : null}
      {mode === "signup" ? <Link href="/login">Already have an account? Sign in</Link> : null}
      {mode === "forgot" || mode === "reset" ? <Link href="/login">Return to sign in</Link> : null}
    </nav>
  </div></section>;
}
