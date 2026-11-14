"use client";

import { useEffect, useState } from "react";

/**
 * True once the page has finished loading what is on screen (the window `load` event) plus a short
 * pause. Used to hold back things the visitor can't see yet (hidden slides, background video) so
 * they never compete with visible content on a slow connection.
 */
export function useAfterLoad(delayMs = 800) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let timer = 0;
    const go = () => {
      timer = window.setTimeout(() => setReady(true), delayMs);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      window.clearTimeout(timer);
    };
  }, [delayMs]);
  return ready;
}
