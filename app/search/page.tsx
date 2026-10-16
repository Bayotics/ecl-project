import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";

import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { ArrowRightIcon } from "@/components/ui/icons";
import { pages } from "@/content/pages";
import { search } from "@/content/search";

import styles from "./search.module.css";

export const metadata: Metadata = {
  title: pages.search.label,
  description: pages.search.description,
  robots: { index: false },
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (raw ?? "").trim().slice(0, 100);
  const results = query ? search(query) : [];

  return (
    <>
      <PageIntro label={pages.search.label} title={pages.search.title} />
      <PageSection id="results" title={query ? "Results" : "Search"}>
        <Form action="/search" className={styles.form} role="search">
          <label htmlFor="search-q" className={styles.label}>
            Search causes, news, events, gallery and pages
          </label>
          <div className={styles.field}>
            <input
              id="search-q"
              name="q"
              type="search"
              defaultValue={query}
              autoComplete="off"
              maxLength={100}
              className={styles.input}
            />
            <button type="submit" className={styles.submit} aria-label="Search">
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </Form>

        {query ? (
          <>
            <p className={styles.count} role="status">
              {results.length === 1 ? "1 result" : `${results.length} results`} for “{query}”
            </p>
            {results.length ? (
              <ul role="list" className={styles.results}>
                {results.map((entry) => (
                  <li key={entry.href}>
                    <Link href={entry.href} className={styles.result}>
                      <span className={styles.type}>{entry.meta ?? entry.type}</span>
                      <span className={styles.title}>{entry.title}</span>
                      <span className={styles.summary}>{entry.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Try a different word, such as “education”, “culture” or “gallery”.</p>
            )}
          </>
        ) : null}
      </PageSection>
    </>
  );
}
