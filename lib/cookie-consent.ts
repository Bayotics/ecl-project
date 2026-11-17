// The visitor's answer to the cookie notice, kept in this browser so the notice shows only once.

export type CookieChoice = "accepted" | "declined";

const KEY = "ecl-cookie-choice";
const CHANGED = "ecl:cookie-choice";

/** Fallback for this visit when the browser blocks storage. */
let memory: CookieChoice | null = null;

export function readCookieChoice(): CookieChoice | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return memory;
  }
}

/** Saves a choice, or clears it (null) so the notice asks again. */
export function saveCookieChoice(choice: CookieChoice | null) {
  memory = choice;
  try {
    if (choice) window.localStorage.setItem(KEY, choice);
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage blocked (private mode): the choice holds for this visit only.
  }
  window.dispatchEvent(new CustomEvent<CookieChoice | null>(CHANGED, { detail: choice }));
}

export function onCookieChoice(handler: (choice: CookieChoice | null) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<CookieChoice | null>).detail);
  window.addEventListener(CHANGED, listener);
  return () => window.removeEventListener(CHANGED, listener);
}
