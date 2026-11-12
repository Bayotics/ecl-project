"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import styles from "./AdminArea.module.css";

export function AdminGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "allowed" | "denied" | "error">("loading");
  useEffect(() => {
    let live = true;
    async function check() {
      try {
        const db = supabaseBrowser();
        const { data: { user }, error } = await db.auth.getUser();
        if (error || !user) { if (live) setState("denied"); return; }
        const result = await db.rpc("is_admin");
        if (result.error) throw result.error;
        if (live) setState(result.data ? "allowed" : "denied");
      } catch { if (live) setState("error"); }
    }
    void check();
    const { data: { subscription } } = supabaseBrowser().auth.onAuthStateChange(() => { setTimeout(() => void check(), 0); });
    return () => { live = false; subscription.unsubscribe(); };
  }, []);
  if (state === "allowed") return children;
  return <section className={styles.notice} role="status"><h1>{state === "loading" ? "Checking access…" : state === "error" ? "Unable to verify access" : "Administrator access required"}</h1>
    {state !== "loading" && <><p>{state === "error" ? "Please reload and try again." : "Sign in with your club administrator account."}</p><Link href="/login?next=/admin">Sign in</Link> · <Link href="/">Return to website</Link></>}
  </section>;
}
