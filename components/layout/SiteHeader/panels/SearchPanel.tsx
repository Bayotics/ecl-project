"use client";

import Form from "next/form";
import Link from "next/link";
import { useState, type KeyboardEvent, type Ref } from "react";

import type { HeaderData, LinkItem } from "@/content/types";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { matchEntries } from "@/lib/search-match";

import styles from "./panels.module.css";

interface SearchPanelProps {
  id: string;
  data: HeaderData["search"];
  open: boolean;
  ref?: Ref<HTMLDivElement>;
  onNavigate: () => void;
  onClose: () => void;
}

const LIMIT = 6;

function Suggestions({ links, onNavigate }: { links: LinkItem[]; onNavigate: () => void }) {
  return (
    <ul role="list">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={styles.compactLink} onClick={onNavigate} data-result>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Search overlay (docs/ui-spec.md I7): one large field over a thin rule, live results drawn from the
 * public index (pages, causes, news, events, galleries, reports; never applications or submissions),
 * suggested destinations while empty, and an honest no-result state. Enter opens the full /search page.
 */
export function SearchPanel({ id, data, open, ref, onNavigate, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState("");

  // A closed panel starts fresh next time (state adjustment during render).
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setQuery("");
  }

  const trimmed = query.trim();
  const results = trimmed ? matchEntries(data.index, trimmed) : [];
  const shown = results.slice(0, LIMIT);
  const resultsId = `${id}-results`;

  /** Arrow keys move between the field and the result links. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const panel = event.currentTarget;
    const items = Array.from(panel.querySelectorAll<HTMLElement>("[data-result]"));
    if (!items.length) return;
    const input = panel.querySelector<HTMLInputElement>("input[type=search]");
    const at = items.indexOf(document.activeElement as HTMLElement);
    event.preventDefault();
    if (event.key === "ArrowDown") (items[at + 1] ?? items[at] ?? items[0]).focus();
    else if (at <= 0) input?.focus();
    else items[at - 1].focus();
  };

  const status = !trimmed
    ? ""
    : results.length
      ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${trimmed}”`
      : `No results for “${trimmed}”`;

  return (
    <div
      id={id}
      ref={ref}
      className={cx(styles.panel, styles.search)}
      inert={!open}
      data-lenis-prevent
      onKeyDown={onKeyDown}
    >
      <div className={styles.searchIntro}>
        <p className={styles.label} data-panel-item>
          {data.label}
        </p>
      </div>
      <div className={styles.searchMain}>
        <div className={styles.searchRow} data-panel-item>
          <Form action="/search" role="search" className={styles.searchForm} onSubmit={onNavigate}>
            <label htmlFor="overlay-search-q" className="visually-hidden">
              Search Eko Club Louisiana
            </label>
            <input
              id="overlay-search-q"
              name="q"
              type="search"
              placeholder="Search the site"
              autoComplete="off"
              maxLength={100}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-controls={resultsId}
              className={styles.searchInput}
              data-autofocus
            />
            <button type="submit" className={styles.searchSubmit} aria-label="Show all results">
              <ArrowRightIcon size={16} />
            </button>
          </Form>
          <button type="button" className={styles.searchClose} aria-label="Close search" onClick={onClose}>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>

        <p className={styles.searchStatus} role="status" aria-live="polite">
          {status}
        </p>

        <div id={resultsId} data-panel-item>
          {!trimmed ? (
            <div className={styles.suggestions}>
              <span className={styles.label}>Suggested</span>
              <Suggestions links={data.suggestions} onNavigate={onNavigate} />
            </div>
          ) : shown.length ? (
            <>
              <ul role="list" className={styles.results}>
                {shown.map((entry) => (
                  <li key={entry.href}>
                    <Link href={entry.href} className={styles.result} onClick={onNavigate} data-result>
                      <span className={styles.label}>{entry.meta ?? entry.type}</span>
                      <span className={styles.resultTitle}>{entry.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {results.length > shown.length ? (
                <Link
                  href={`/search?q=${encodeURIComponent(trimmed)}`}
                  className={styles.compactLink}
                  onClick={onNavigate}
                  data-result
                >
                  See all {results.length} results
                </Link>
              ) : null}
            </>
          ) : (
            <div className={styles.searchEmpty}>
              <p>Nothing on the site matches that yet. Try a cause, a program or an event name.</p>
              <Suggestions links={data.suggestions} onNavigate={onNavigate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
