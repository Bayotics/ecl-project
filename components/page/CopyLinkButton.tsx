"use client";

import { useState } from "react";

/** Copies the page URL; the result is announced to screen readers. */
export function CopyLinkButton({ url, className }: { url: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2500);
  };

  return (
    <>
      <button type="button" className={className} onClick={copy}>
        {state === "copied" ? "Link copied" : "Copy link"}
      </button>
      <span className="visually-hidden" role="status" aria-live="polite">
        {state === "copied" ? "Link copied to clipboard" : state === "failed" ? "Could not copy the link" : ""}
      </span>
    </>
  );
}
