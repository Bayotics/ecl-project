import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { AmbientVideo } from "@/components/sections/CultureFeature/AmbientVideo";
import { ContactBand } from "@/components/sections/ContactBand/ContactBand";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";
import { about } from "@/content/about";
import { resolveMedia } from "@/content/media";
import { pages } from "@/content/pages";
import { contactBand, settings } from "@/content/site";
import { cx } from "@/lib/cx";
import { pageMetadata } from "@/lib/seo";
import { managedMedia } from "@/lib/supabase/adapters";
import { publicPageMedia } from "@/lib/supabase/content";
import layout from "@/styles/layout.module.css";

import styles from "./about.module.css";

export const metadata: Metadata = pageMetadata({ title: pages.about.label, description: pages.about.description, path: pages.about.href });

/** Square-marked, underlined text action used throughout the About page. */
function MarkLink({ href, children, tone = "dark" }: { href: string; children: string; tone?: "dark" | "light" }) {
  return (
    <Link href={href} className={cx(styles.markLink, tone === "light" && styles.markLinkLight)}>
      <span className={styles.square} aria-hidden="true" />
      {children}
    </Link>
  );
}

/**
 * About (docs/ui-spec.md Part L): oversized title, full-bleed film, two-thirds statement, image with a
 * story column, facts grid, three-column feature bands, an accent list of the six areas, the two homes,
 * then the shared contact band. Each block enters with a different scroll motion.
 */
// Images can be replaced from the admin area (Supabase page media), so render per request.
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const { breadcrumb, title, film, statement, facts, bands, focus, places } = about;
  // An "about-hero" image set in the admin area replaces the story photograph; otherwise the bundled one.
  const managed = (await publicPageMedia("about")).find((item) => item.placement === "about-hero");
  const story = managed ? { ...about.story, media: resolveMedia(managedMedia(managed.image_url, managed.image_alt)) } : about.story;

  return (
    <>
      {/* Title */}
      <header className={styles.intro}>
        <Reveal>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb} data-reveal="fade">
            <ol role="list">
              {breadcrumb.map((crumb) => (
                <li key={crumb.href}>
                  <Link href={crumb.href}>{crumb.label}</Link>
                  <ArrowRightIcon size={10} />
                </li>
              ))}
              <li aria-current="page">{pages.about.label}</li>
            </ol>
          </nav>
          <h1 className={styles.title}>
            {title.map((line) => (
              <span key={line} className={styles.titleLine} data-reveal="up" data-reveal-y="48">
                {line}
              </span>
            ))}
          </h1>
        </Reveal>
      </header>

      {/* Full-bleed film */}
      <Reveal className={styles.film}>
        <div className={styles.filmFrame} data-reveal="mask">
          <AmbientVideo sources={film.sources} poster={film.poster} label={film.label} sizes="100vw" />
        </div>
      </Reveal>

      {/* Statement: two thirds, rule at ⅔ */}
      <section className={cx(styles.statement, layout.rules, layout.rulesSecond)} aria-labelledby="about-statement">
        <Reveal className={layout.cells}>
          <div className={cx(layout.cell, layout.span2, styles.statementBody)}>
            <h2 id="about-statement" className={cx(layout.label, styles.label)} data-reveal="fade">
              {statement.label}
            </h2>
            {statement.paragraphs.map((paragraph) => (
              <p key={paragraph} className={styles.statementText} data-reveal="left">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Image (two thirds) with a story column bottom-aligned in the last third */}
      <section className={cx(styles.story, layout.rules, layout.rulesSecond)} aria-label="Our story">
        <Reveal className={layout.cells}>
          <figure className={cx(layout.cell, layout.span2, styles.storyFigure)}>
            <div className={styles.storyMedia} data-reveal="mask-left">
              <MediaImage media={story.media} sizes="(min-width: 1024px) 62vw, 92vw" />
            </div>
            <figcaption className={styles.caption} data-reveal="fade">
              {story.caption}
            </figcaption>
          </figure>
          <div className={cx(layout.cell, styles.storyText)}>
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph} data-reveal="right">
                {paragraph}
              </p>
            ))}
            <div data-reveal="fade">
              <MarkLink href={story.link.href}>{story.link.label}</MarkLink>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Facts */}
      <section className={cx(styles.facts, layout.rules)} aria-labelledby="about-facts">
        <Reveal className={layout.cells} stagger={0.1}>
          <div className={layout.cell}>
            <p className={cx(layout.label, styles.label)} data-reveal="fade">
              {facts.label}
            </p>
            <h2 id="about-facts" className={styles.heading} data-reveal="left">
              {facts.heading}
            </h2>
          </div>
          {[facts.items.slice(0, 2), facts.items.slice(2)].map((column, index) => (
            <dl key={index} className={cx(layout.cell, styles.factColumn)}>
              {column.map((fact) => (
                <div key={fact.label} className={styles.fact} data-reveal data-reveal-y="40">
                  <dt className={styles.factLabel}>
                    <span className={styles.square} aria-hidden="true" />
                    {fact.label}
                  </dt>
                  <dd className={styles.factValue}>{fact.value}</dd>
                </div>
              ))}
              {index === 1 ? (
                <div data-reveal="fade">
                  <Link href={facts.action.href} className={styles.solidAction}>
                    {facts.action.label}
                  </Link>
                </div>
              ) : null}
            </dl>
          ))}
        </Reveal>
      </section>

      {/* Feature bands */}
      {bands.map((band, index) => (
        <section key={band.id} className={styles.bandWrap} aria-labelledby={`band-${band.id}`}>
          <Reveal className={styles.band} stagger={0.1}>
            <div className={styles.bandCell} data-reveal={index % 2 ? "right" : "left"}>
              <p className={cx(layout.label, styles.label)}>{band.label}</p>
              <h2 id={`band-${band.id}`} className={styles.heading}>
                {band.heading}
              </h2>
            </div>
            <div className={cx(styles.bandCell, styles.bandBody)} data-reveal>
              <p>{band.body}</p>
              <MarkLink href={band.link.href}>{band.link.label}</MarkLink>
            </div>
            <div className={styles.bandMedia} data-reveal={index % 2 ? "mask-left" : "mask"}>
              <MediaImage media={band.media} sizes="(min-width: 1024px) 32vw, 92vw" />
            </div>
          </Reveal>
        </section>
      ))}

      {/* Accent band: the six areas */}
      <section className={styles.bandWrap} aria-labelledby="about-focus">
        <Reveal className={cx(styles.band, styles.accent)} stagger={0.07}>
          <div className={styles.bandCell} data-reveal="left">
            <p className={cx(layout.label, styles.label)}>{focus.label}</p>
            <h2 id="about-focus" className={styles.heading}>
              {focus.heading}
            </h2>
          </div>
          <div className={cx(styles.bandCell, styles.bandBody)} data-reveal>
            <p>{focus.body}</p>
            <MarkLink href={focus.link.href}>{focus.link.label}</MarkLink>
          </div>
          <ol role="list" className={cx(styles.bandCell, styles.focusList)}>
            {focus.items.map((item, index) => (
              <li key={item.href} data-reveal="right" data-reveal-x="32">
                <span className={styles.focusNumber}>
                  <span className={styles.square} aria-hidden="true" />
                  {index + 1}
                </span>
                <Link href={item.href} className={styles.focusLink}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Two homes */}
      <section className={styles.places} aria-labelledby="about-places">
        <Reveal className={styles.placesHead}>
          <p className={cx(layout.label, styles.label)} data-reveal="fade">
            {places.label}
          </p>
          <h2 id="about-places" className={styles.placesTitle} data-reveal="up" data-reveal-y="40">
            {places.heading}
          </h2>
        </Reveal>
        <Reveal className={cx(layout.cells, layout.rules, styles.placesGrid)} stagger={0.12}>
          <div className={cx(layout.cell, styles.placesIntro)} data-reveal="left">
            <p>{places.body}</p>
            <MarkLink href={places.link.href}>{places.link.label}</MarkLink>
          </div>
          {places.items.map((place) => (
            <article key={place.title} className={cx(layout.cell, styles.place)} data-reveal data-reveal-y="48">
              <div className={styles.placeMedia}>
                <MediaImage media={place.media} sizes="(min-width: 1024px) 30vw, 92vw" />
              </div>
              <h3 className={styles.placeTitle}>{place.title}</h3>
              <p className={styles.placeText}>{place.text}</p>
              <Link href={place.action.href} className={styles.outlineAction}>
                {place.action.label}
              </Link>
            </article>
          ))}
        </Reveal>
      </section>

      <ContactBand
        invitation={contactBand.invitation}
        contact={contactBand.contact}
        newsletter={contactBand.newsletter}
        details={settings.contact}
      />
    </>
  );
}
