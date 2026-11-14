"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { api, type Me } from "@/lib/api-client";
import styles from "./AdminArea.module.css";

export function AdminGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "allowed" | "denied" | "error">("loading");
  useEffect(() => {
    let live = true;
    async function check() {
      try {
        const { user } = await api<Me>("/api/auth/me");
        if (live) setState(user?.role === "admin" ? "allowed" : "denied");
      } catch { if (live) setState("error"); }
    }
    void check();
    return () => { live = false; };
  }, []);
  if (state === "allowed") return children;
  return <section className={styles.notice} role="status"><h1>{state === "loading" ? "Checking access…" : state === "error" ? "Unable to verify access" : "Administrator access required"}</h1>
    {state !== "loading" && <><p>{state === "error" ? "Please reload and try again." : "Sign in with your club administrator account."}</p><Link href="/login?next=/admin">Sign in</Link> · <Link href="/">Return to website</Link></>}
  </section>;
}
