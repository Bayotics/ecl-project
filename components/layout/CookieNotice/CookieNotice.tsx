"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { onCookieChoice, readCookieChoice, saveCookieChoice, type CookieChoice } from "@/lib/cookie-consent";

import styles from "./CookieNotice.module.css";

/** Wait after the page settles before showing the notice; on the homepage, until the intro has lifted. */
const SHOW_AFTER_MS = 1200;
const CLOSE_MS = 450;

/**
 * First-visit cookie notice, fixed bottom right. It doesn't cover or blur the page or take focus: the
 * site stays usable while it shows. The answer is remembered in this browser (lib/cookie-consent.ts),
 * and the cookie policy page can clear it to ask again.
 */
export function CookieNotice() {
  const [state, setState] = useState<"hidden" | "open" | "closing">("hidden");

  useEffect(() => {
    let timer = 0;
    const showWhenReady = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(function check() {
        // The homepage intro curtains are still up: look again shortly.
        if (document.querySelector("[data-loader]")) timer = window.setTimeout(check, 400);
        else setState("open");
      }, SHOW_AFTER_MS);
    };
    if (!readCookieChoice()) showWhenReady();
    const off = onCookieChoice((choice) => {
      if (choice) return;
      setState("hidden");
      showWhenReady();
    });
    return () => {
      window.clearTimeout(timer);
      off();
    };
  }, []);

  useEffect(() => {
    if (state !== "closing") return;
    const timer = window.setTimeout(() => setState("hidden"), CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  if (state === "hidden") return null;

  const choose = (choice: CookieChoice) => {
    saveCookieChoice(choice);
    setState("closing");
  };

  return (
    <section className={styles.notice} data-state={state} aria-labelledby="cookie-notice-title">
      <h2 id="cookie-notice-title" className={styles.title}>
        Cookies
      </h2>
      <p className={styles.copy}>
        This website uses only the cookies it needs to work, such as keeping members signed in. No advertising or
        tracking cookies.{" "}
        <Link href="/cookies" className={styles.policy}>
          Cookie policy
        </Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.accept} onClick={() => choose("accepted")}>
          Accept cookies
        </button>
        <button type="button" className={styles.decline} onClick={() => choose("declined")}>
          Decline
        </button>
      </div>
    </section>
  );
}

/** Cookie policy page: clears the saved answer so the notice shows again. */
export function ChangeCookieChoice({ className }: { className?: string }) {
  return (
    <button type="button" className={className ?? styles.change} onClick={() => saveCookieChoice(null)}>
      Change your cookie choice
    </button>
  );
}
