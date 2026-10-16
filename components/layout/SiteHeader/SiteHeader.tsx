"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import logo from "@/assets/media/ecl-crest.png";
import type { DropdownId, HeaderData } from "@/content/types";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { ChevronDownIcon, SearchIcon } from "@/components/ui/icons";
import { gsap, useGSAP } from "@/lib/gsap";
import { media, prefersReducedMotion } from "@/lib/motion";
import { announceLayer, onOtherLayer } from "@/lib/overlay-bus";
import { useMediaQuery } from "@/lib/use-media-query";

import { overlayTimeline } from "./overlayMotion";
import { EventsPanel } from "./panels/EventsPanel";
import { MenuPanel } from "./panels/MenuPanel";
import { MobilePanel } from "./panels/MobilePanel";
import { ProgramsPanel } from "./panels/ProgramsPanel";
import { SearchPanel } from "./panels/SearchPanel";
import styles from "./SiteHeader.module.css";

/** One overlay at a time (docs/ui-spec.md D3). */
type Overlay = "none" | DropdownId | "menu" | "search";
type PanelKey = DropdownId | "menu" | "search" | "mobile";
type Control = Exclude<Overlay, "none">;

const PANEL_KEYS: PanelKey[] = ["programs", "events", "menu", "search", "mobile"];
const panelId = (key: PanelKey) => `overlay-${key}`;

/** Routes whose first section is a full-bleed hero marked `data-header-overlay`. */
const OVERLAY_ROUTES = new Set(["/"]);
const HOVER_INTENT_MS = 60;
const EXIT_GRACE_MS = 150;
/** While a panel is still unclipping, clicks pass through to the backdrop; ignore those. */
const BACKDROP_GRACE_MS = 350;
const COLLAPSE_AFTER = 24;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusables(root: HTMLElement | null | undefined): HTMLElement[] {
  return root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.closest("[inert]")) : [];
}

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ data }: { data: HeaderData }) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery(media.desktop);
  const { lock, unlock } = useSmoothScroll();

  const headerRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const programsRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Partial<Record<DropdownId, HTMLButtonElement | null>>>({});
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const openedBy = useRef<"hover" | "click">("click");
  const openedAt = useRef(0);
  const origin = useRef<HTMLElement | null>(null);
  const focusOnOpen = useRef(false);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const shownKey = useRef<PanelKey | null>(null);

  const [overlay, setOverlay] = useState<Overlay>("none");
  const [overHero, setOverHero] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // A route change closes any overlay (state adjustment during render, not in an effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOverlay("none");
  }

  // Dropdowns exist only at desktop width; the Menu control maps to the mobile panel below it.
  const active: Overlay = !isDesktop && (overlay === "programs" || overlay === "events") ? "none" : overlay;
  const open = active !== "none";
  const activeKey: PanelKey | null = active === "none" ? null : active === "menu" && !isDesktop ? "mobile" : active;
  const theme = OVERLAY_ROUTES.has(pathname) && overHero && !open ? "overlay" : "solid";

  // Lookups used only inside effects and event handlers.
  const panelEl = (key: PanelKey): HTMLDivElement | null =>
    ({ programs: programsRef, events: eventsRef, menu: menuRef, search: searchRef, mobile: mobileRef })[key].current;
  const controlEl = (key: Control): HTMLButtonElement | null =>
    key === "search" ? searchButtonRef.current : key === "menu" ? menuButtonRef.current : (triggerRefs.current[key] ?? null);

  /* ── Header theme and utility-strip collapse ─────────────────────── */

  useEffect(() => {
    if (!OVERLAY_ROUTES.has(pathname)) return;
    const target = document.querySelector<HTMLElement>("[data-header-overlay]");
    if (!target) return;
    const barHeight = headerRef.current?.querySelector<HTMLElement>("[data-nav-bar]")?.offsetHeight ?? 74;
    const observer = new IntersectionObserver(([entry]) => setOverHero(entry.isIntersecting), {
      rootMargin: `-${barHeight}px 0px 0px 0px`,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > COLLAPSE_AFTER);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* ── Motion: one timeline, replaced on every change ───────────────── */

  useGSAP(
    () => {
      if (activeKey === shownKey.current) return;
      timeline.current?.kill();
      if (activeKey) openedAt.current = performance.now();
      const panels = PANEL_KEYS.map(panelEl).filter((el): el is HTMLDivElement => !!el);
      timeline.current = overlayTimeline({
        panels,
        target: activeKey ? panelEl(activeKey) : null,
        backdrop: backdropRef.current,
        reduced: prefersReducedMotion(),
      });
      shownKey.current = activeKey;
    },
    { dependencies: [activeKey], scope: headerRef },
  );

  /* ── While open: lock scroll, make covered content inert, move focus ── */

  useEffect(() => {
    if (!open) return;
    lock();
    const covered = [document.getElementById("main"), document.getElementById("site-footer")];
    covered.forEach((el) => el?.setAttribute("inert", ""));
    return () => {
      unlock();
      covered.forEach((el) => el?.removeAttribute("inert"));
    };
  }, [open, lock, unlock]);

  useEffect(() => {
    if (!activeKey || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    const panel = panelEl(activeKey);
    const preferred = panel?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables(panel)[0];
    preferred?.focus({ preventScroll: true });
  }, [activeKey]);

  /* ── Open / close ─────────────────────────────────────────────────── */

  const clearTimer = () => window.clearTimeout(timer.current);

  const openOverlay = (next: Control, by: "hover" | "click", from?: HTMLElement | null, moveFocus = false) => {
    clearTimer();
    openedBy.current = by;
    origin.current = from ?? controlEl(next);
    focusOnOpen.current = moveFocus;
    setOverlay(next);
  };

  const close = useCallback((restoreFocus: boolean) => {
    window.clearTimeout(timer.current);
    // Focus inside a closing panel would be stranded (the panel turns inert), so always bring it back.
    const focusInside = shellRef.current?.contains(document.activeElement) ?? false;
    if (restoreFocus || focusInside) origin.current?.focus({ preventScroll: true });
    setOverlay("none");
  }, []);

  const scheduleClose = () => {
    clearTimer();
    timer.current = window.setTimeout(() => close(false), EXIT_GRACE_MS);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* ── One layer at a time: yield to a form dialog; an opening header overlay closes any dialog ── */

  useEffect(() => {
    if (open) announceLayer("header");
  }, [open]);

  useEffect(() => onOtherLayer("header", () => close(false)), [close]);

  /* ── Pointer: hover opens dropdowns; leaving header and panel closes them after a grace period ── */

  const onDropdownPointerEnter = (event: PointerEvent<HTMLButtonElement>, id: DropdownId) => {
    if (event.pointerType !== "mouse") return;
    if (active === "menu" || active === "search") return; // never hijack a clicked-open overlay
    clearTimer();
    const button = event.currentTarget;
    timer.current = window.setTimeout(() => openOverlay(id, "hover", button), open ? 0 : HOVER_INTENT_MS);
  };

  const onPlainItemPointerEnter = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && open && openedBy.current === "hover") scheduleClose();
  };

  const onHeaderPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    clearTimer();
    if (open && openedBy.current === "hover") scheduleClose();
  };

  const onBackdropClick = () => {
    if (performance.now() - openedAt.current > BACKDROP_GRACE_MS) close(false);
  };

  /* ── Clicks and keys on the controls ──────────────────────────────── */

  const toggle = (id: Control, button: HTMLButtonElement, moveFocus: boolean) => {
    if (active === id) {
      // A click on a hover-opened dropdown pins it instead of closing it.
      if (openedBy.current === "hover") openedBy.current = "click";
      else close(true);
      return;
    }
    openOverlay(id, "click", button, moveFocus);
  };

  const onDropdownKeyDown = (event: KeyboardEvent<HTMLButtonElement>, id: DropdownId) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (active === id) focusables(panelEl(id))[0]?.focus();
      else openOverlay(id, "click", event.currentTarget, true);
    } else if (event.key === "Tab" && !event.shiftKey && active === id) {
      // Bridge into the panel, which sits after the bar in the DOM.
      const first = focusables(panelEl(id))[0];
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  /** Keep Tab order sensible between the bar and the open panel. */
  const onShellKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !activeKey) return;
    const items = focusables(panelEl(activeKey));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      origin.current?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      if (active === "programs" || active === "events") {
        // Leave the dropdown forwards: continue to the control after its trigger, and close.
        const bar = focusables(headerRef.current?.querySelector<HTMLElement>("[data-nav-bar]"));
        const next = origin.current ? bar[bar.indexOf(origin.current) + 1] : undefined;
        close(false);
        next?.focus();
      } else {
        origin.current?.focus();
      }
    }
  };

  const navigateAway = () => setOverlay("none");

  return (
    <>
      <header
        ref={headerRef}
        className={styles.header}
        data-intro-header
        data-theme={theme}
        data-collapsed={scrolled}
        data-open={open}
        onPointerEnter={clearTimer}
        onPointerLeave={onHeaderPointerLeave}
      >
        <div className={styles.utility}>
          <p className={styles.utilityText}>{data.utility.text}</p>
          <ul className={styles.utilityLinks} role="list">
            {data.utility.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.bar} data-nav-bar>
          <Link href="/" className={styles.brand} aria-label={`${data.siteName}, home`}>
            <Image src={logo} alt="" width={36} height={36} className={styles.logo} />
            <span className={styles.wordmark} aria-hidden="true">
              <span>Eko Club</span>
              <span>Louisiana</span>
            </span>
          </Link>

          <div className={styles.controls}>
            <nav aria-label="Primary" className={styles.nav}>
              <ul className={styles.navList} role="list">
                {data.nav.map(({ id, label, href, panel }) => (
                  <li key={id}>
                    {panel ? (
                      <button
                        type="button"
                        ref={(node) => {
                          triggerRefs.current[panel] = node;
                        }}
                        className={styles.navItem}
                        aria-expanded={active === panel}
                        aria-controls={panelId(panel)}
                        data-current={isCurrent(pathname, href) || undefined}
                        onClick={(event) => toggle(panel, event.currentTarget, false)}
                        onPointerEnter={(event) => onDropdownPointerEnter(event, panel)}
                        onKeyDown={(event) => onDropdownKeyDown(event, panel)}
                      >
                        {label}
                        <ChevronDownIcon size={12} className={styles.chevron} />
                      </button>
                    ) : (
                      <Link
                        href={href}
                        className={styles.navItem}
                        aria-current={isCurrent(pathname, href) ? "page" : undefined}
                        onPointerEnter={onPlainItemPointerEnter}
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <Link href={data.donate.href} className={styles.donate} onPointerEnter={onPlainItemPointerEnter}>
              {data.donate.label}
            </Link>

            <button
              type="button"
              ref={searchButtonRef}
              className={styles.iconButton}
              aria-label="Search"
              aria-expanded={active === "search"}
              aria-controls={panelId("search")}
              onClick={(event) => toggle("search", event.currentTarget, true)}
            >
              <SearchIcon size={18} />
            </button>

            <button
              type="button"
              ref={menuButtonRef}
              className={styles.menuButton}
              aria-expanded={active === "menu"}
              aria-controls={panelId(isDesktop ? "menu" : "mobile")}
              onClick={(event) => toggle("menu", event.currentTarget, true)}
            >
              <span className={styles.menuLabel}>Menu</span>
              <span className={styles.burger} data-open={active === "menu"} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>

        <div ref={shellRef} className={styles.shell} onKeyDown={onShellKeyDown}>
          <ProgramsPanel
            id={panelId("programs")}
            data={data.programs}
            open={activeKey === "programs"}
            ref={programsRef}
            onNavigate={navigateAway}
          />
          <EventsPanel
            id={panelId("events")}
            data={data.events}
            open={activeKey === "events"}
            ref={eventsRef}
            onNavigate={navigateAway}
          />
          <MenuPanel
            id={panelId("menu")}
            data={data.menu}
            open={activeKey === "menu"}
            ref={menuRef}
            onNavigate={navigateAway}
          />
          <SearchPanel
            id={panelId("search")}
            data={data.search}
            open={activeKey === "search"}
            ref={searchRef}
            onNavigate={navigateAway}
            onClose={() => close(true)}
          />
          <MobilePanel
            id={panelId("mobile")}
            data={data}
            open={activeKey === "mobile"}
            ref={mobileRef}
            onNavigate={navigateAway}
          />
        </div>
      </header>

      <div ref={backdropRef} className={styles.backdrop} aria-hidden="true" onClick={onBackdropClick} />
    </>
  );
}
