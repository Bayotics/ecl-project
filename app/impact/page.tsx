import type { Metadata } from "next";

import { ActionRow } from "@/components/page/ActionRow";
import { CardGrid } from "@/components/page/CardGrid";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { Pending } from "@/components/page/Pending";
import styles from "@/components/page/page.module.css";
import { storyCards } from "@/content/cards";
import { metrics, testimonials } from "@/content/impact";
import { published } from "@/content/meta";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { impactPanel } from "@/content/site";

export const metadata: Metadata = pageMetadata({ title: pages.impact.label, description: pages.impact.description, path: pages.impact.href });

const asOf = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

export default function ImpactPage() {
  const stories = storyCards((story) => !story.volunteerHighlight);
  const highlights = storyCards((story) => story.volunteerHighlight);
  const figures = published(metrics);
  const quotes = published(testimonials).filter((item) => item.consent);
  const nothingYet = !stories.length && !highlights.length && !figures.length && !quotes.length;

  return (
    <>
      <PageIntro label={pages.impact.label} title={pages.impact.title} lead={impactPanel.body} media={impactPanel.media} />

      {/* Figures appear only when confirmed, each with the date it was true for and its source. */}
      {figures.length ? (
        <PageSection id="figures" title="In figures">
          <ul role="list" className={styles.metrics}>
            {figures.map((figure) => (
              <li key={figure.slug} className={styles.metric}>
                <span className={styles.metricValue}>{figure.value}</span>
                <span className={styles.metricLabel}>{figure.label}</span>
                <span className={styles.metricSource}>
                  As of {asOf(figure.asOf)} · Source:{" "}
                  {figure.source.url ? <a href={figure.source.url}>{figure.source.label}</a> : figure.source.label}
                </span>
              </li>
            ))}
          </ul>
        </PageSection>
      ) : null}

      {stories.length ? (
        <PageSection id="stories" title="Stories" tone="mist">
          <CardGrid items={stories} />
        </PageSection>
      ) : null}

      {highlights.length ? (
        <PageSection id="volunteers" title="Volunteer highlights">
          <CardGrid items={highlights} />
        </PageSection>
      ) : null}

      {quotes.length ? (
        <PageSection id="voices" title="In their words" tone="mist">
          <ul role="list" className={styles.quotes}>
            {quotes.map((quote) => (
              <li key={quote.slug}>
                <figure className={styles.quote}>
                  <blockquote>&ldquo;{quote.quote}&rdquo;</blockquote>
                  <figcaption>
                    {quote.name}
                    {quote.context ? `, ${quote.context}` : ""}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </PageSection>
      ) : null}

      {nothingYet ? (
        <PageSection id="stories" title="Stories">
          <p>
            We publish stories, volunteer highlights and figures only when they are confirmed by the club and the people
            involved, so nothing here is estimated or invented.
          </p>
          <Pending topic="the club's stories and impact" />
        </PageSection>
      ) : null}

      <PageSection id="take-part" title="Be part of it" tone={nothingYet ? "mist" : "paper"}>
        <p>Share a story from the club, give your time, or support the work.</p>
        <ActionRow
          actions={[
            { label: "Volunteer", href: "/volunteer", primary: true },
            { label: "Share a story", href: "/contact?topic=Media#message" },
            { label: "Reports", href: "/reports" },
            { label: "Donate", href: "/donate" },
          ]}
        />
      </PageSection>
    </>
  );
}
