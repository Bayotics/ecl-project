# Eko Club Louisiana — UI Specification

Status: **Prompts 1–10 of 10** (QA results: [qa-report.md](qa-report.md)). Prompt 1: interface contract, shell, layout, sections, route skeletons. Prompt 2: exact visual tokens, ECL copy, typed records, authentic media. Prompt 3: header and three distinct dropdowns. Prompt 4: three-curtain loader, cinematic hero, scroll physics.
This document is the source of truth for layout, states and motion. Later prompts extend it. Where this file and the code disagree, fix the code or update this file in the same change.

- Part A is the Prompt 1 contract, recorded as given.
- Part B records the implementation decisions made to satisfy it (behaviors, routes, file map).
- Part C is the Prompt 2 contract and its implementation. **Where B and C differ, C wins** (tokens, typography, content, media).
- Part D is the Prompt 3 header. **D supersedes the header and menu parts of B and C.**
- Part E is the Prompt 4 loader, hero and scrolling. **E supersedes the hero parts of B.**
- Part F is the Prompt 5 mission and panel row. **F supersedes those rows of B4.**
- Part G is the Prompt 6 causes track. **G supersedes the carousel row of B4.**
- Part H is the Prompt 7 culture feature, editorial row and entrance motion. **H supersedes those rows of B4.**
- Part I is the Prompt 8 news, contact/newsletter band, form dialogs, search panel and footer. **I supersedes those rows of B4, the footer in C and the search contents in D.**
- Part J is the Prompt 9 content pages and the donate, join, volunteer, RSVP and contact flows. **J supersedes the inner-page skeletons and routes in B.**
- Part K is the Prompt 10 repair and calibration pass: touch targets, phone type, safe areas, loader first paint, hydration and bundle splitting, SEO and structured data, analytics events.

---

## Part A — Supplied contract

### A1. Organization context

- ECL (Eko Club Louisiana) is a Louisiana-based nonprofit and sociocultural community associated with Lagos heritage.
- Public mission: cultural preservation, education, youth leadership, community development, fellowship, and humanitarian assistance involving Louisiana and Lagos.
- Existing website: https://ekoclublouisiana.org/ (retrieval not required).
- Content must use the facts and review flags supplied in **Prompt 2**. *Prompt 2 has not been received yet; see B8.*

### A2. Design character

A sophisticated editorial website with:

- a full-viewport cinematic hero
- very light geometric typography
- warm pale backgrounds
- charcoal feature panels
- thin grid lines
- large authentic photographs
- broad dropdown panels
- reversible hover reveals
- a manually operated horizontal carousel
- restrained smooth scrolling

Desktop appearance remains spacious, rectangular and precisely aligned.

### A3. Technical contract

- Next.js App Router + TypeScript.
- Compatible stable dependencies, the existing package manager, and a lockfile. Retain useful existing code/assets.
- CSS Modules (or the established styling system) with explicit design tokens.
- GSAP with scoped React integration for coordinated animation.
- Lenis for desktop scroll smoothing.
- A headless carousel (Embla) for the causes track.
- Keep static content server-rendered where practical; isolate client-side interactions.
- Semantic markup and the exact section order below.
- Scripts for development, production build, lint and type checking.

### A4. Homepage sequence (exact order)

1. **Hero.** A slim utility strip and navigation overlay a cinematic hero filling approximately the first viewport. The hero's very large heading sits near the lower left, with supporting text and a small CTA below. A fine-lined control strip sits across its bottom. Three numbered text tabs and two small square arrow buttons control three slides.
2. **Mission.** A spacious light mission block. A small uppercase label and two large, light-weight paragraphs fill about the left two thirds; the final third stays deliberately empty.
3. **Intro / Impact / Causes row.** Three columns: pale-gray editorial introduction, charcoal interactive impact panel, and almost-white interactive causes panel. The two panels exchange images for text/links and move their titles downward when activated.
4. **Causes carousel.** A light section with six large image-led cause items in a single horizontal track. About three full items and part of the next are visible at once. The heading is left; two small square controls are upper right. Captions and small outlined actions sit beneath the images.
5. **Culture feature.** Full-width charcoal. Heading/link in the left third; an inset, continuously playing landscape video in the right two thirds.
6. **Editorial row.** Light, three columns: heading left, explanation/link middle, large almost-square image right.
7. **News & Events.** Light. Heading/action in the left third; three landscape-image stories across the remaining two thirds.
8. **Contact / newsletter band.** Slightly darker light gray, three columns: invitation, contact copy/action, newsletter copy/signup entry.
9. **Logo strip and footer.** A generous logo strip with a small back-to-top square at the far right. Below it, six compact footer columns and a very small bottom legal row.

### A5. Navigation

- Remains visible during scrolling.
- Begins translucent with light text over the hero, then becomes a light bar with dark text.
- Remains light over the later charcoal feature.
- Menus open as wide light panels below the navigation, blur/dim the page behind, and preserve the visible header.

---

## Part B — Implementation decisions

### B1. Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16.3 (App Router, Turbopack), React 19.2 |
| Language | TypeScript 5.9 (strict) |
| Styling | CSS Modules + global tokens in `styles/tokens.css` (no utility framework) |
| Animation | GSAP 3.15 + `@gsap/react` (`useGSAP` scoped to component refs), ScrollTrigger |
| Smooth scroll | Lenis 1.3, desktop + fine pointer + no reduced-motion only, driven by the GSAP ticker |
| Carousel | Embla 8.6 (`embla-carousel-react`) |
| Font | Jost (variable, geometric) via `next/font/google` |
| Package manager | npm, `package-lock.json` |
| Lint | ESLint 9 flat config + `eslint-config-next` (ESLint 10 is blocked by `eslint-plugin-react` peer range) |

Scripts: `dev`, `build`, `start`, `lint`, `typecheck` (`next typegen && tsc --noEmit`), `check` (lint + typecheck).

### B2. Grid system ("cells")

The page is divided into **viewport thirds**. Every section uses the same three tracks, and each cell has the same inline padding (`--cell-x`). Content in column *n* therefore starts at exactly `(n − 1) × 100vw / 3 + --cell-x` in every section, which produces the precise vertical alignment the contract asks for. Hairlines (`--hairline`, `--color-line`) mark section tops and column divisions where the design calls for grid lines.

- ≥ 1024px: three tracks.
- 768–1023px: rows collapse to two tracks or stack, depending on the section.
- < 768px: single column.

### B3. Tokens

Superseded by **C2** (Prompt 2 gave exact values). The motion tokens below still apply.

**Motion**: `--ease-out-expo` cubic-bezier(0.16, 1, 0.3, 1) (GSAP `expo.out`); `--ease-in-out` cubic-bezier(0.65, 0, 0.35, 1) (GSAP `power3.inOut`); durations 240 / 450 / 800 / 1400 ms. Under `prefers-reduced-motion: reduce`, durations collapse and GSAP timelines are skipped or set instantly.

### B4. Section behaviors

| # | Section | Server / client | Behavior |
| --- | --- | --- | --- |
| 1 | `Hero` | client (`Hero`) | `100svh` (min 40rem). Slides stacked; **manual only** (no autoplay, so no pause control is required). Tabs follow the APG tabbed-carousel pattern: `role="tablist"`, roving tabindex, ← → Home End. Arrow buttons wrap around. Transition: incoming image wipes in from the travel direction (clip-path, 1.3s `expo.inOut`) while it settles from scale 1.14; outgoing copy fades up; incoming heading lines rise from masks (stagger 0.08s). The active tab's top hairline grows left → right. First paint uses a CSS-only intro, so there is no hydration flash. Visually hidden `h1`; slide headings are `h2`. |
| — | Header | client (`SiteHeader`) | Fixed. `data-theme="overlay"` while an element marked `data-header-overlay` (the hero) is under the bar: translucent dark glass with light text. Otherwise `solid`: paper bar with dark text. The utility strip slides away after 24px of scroll; the nav bar stays. Over the charcoal culture feature the bar stays solid. |
| — | Menus | client | Disclosure buttons (`aria-expanded`, `aria-controls`), not ARIA menus. Open on hover intent (90ms) or click; Esc closes and returns focus; outside click / backdrop click / focus leaving the header closes. Panel: full-width paper sheet below the bar, revealed by clip-path; columns stagger in. Backdrop below the header: dim + 10px blur. While a menu is open the header is forced solid and page scroll is locked. Backdrop clicks are ignored for 400ms after opening, because clicks on the still-unclipping sheet pass through to the backdrop. Mobile (< 1024px): full-height sheet with accordion groups; the backdrop never closes it (the sheet covers the page, and the toggle or Esc closes it). |
| 2 | `Mission` | server + `Reveal` | Label + two lead paragraphs span columns 1–2; column 3 empty. Paragraphs rise in on scroll (once). |
| 3 | `IntroPanels` | server + `RevealPanel` ×2 | Row min-height clamp(36rem → 48rem). Panels: title at top, inset photo below. **Activated** (hover, focus-within, or explicit click/tap) → photo collapses upward (clip-path) while drifting, title travels down to sit above the copy, copy/links stagger in. Fully reversible (the same timeline reverses). Below 768px both states show together, statically. |
| 4 | `CausesCarousel` | client (Embla) | `align: start`, `containScroll: trimSnaps`, drag enabled, no loop, no autoplay. Slide basis 26.5% (≥ 1024), 42% (768–1023), 82% (< 768), so three full items plus about half of the fourth are visible at 1440px. The track bleeds to the right viewport edge. Prev/next squares are disabled at the ends. Focusing a slide scrolls it into view. Image hover: slow 1.04 zoom. |
| 5 | `CultureFeature` | server + `AmbientVideo` | Charcoal. Copy in column 1; 16:9 inset media in columns 2–3. The video is muted, looped and inline, plays only while in view, and has a visible pause/play square (WCAG 2.2.2). With reduced motion it does not autoplay. If there is no video source, the poster image is shown (current state, pending asset). |
| 6 | `EditorialRow` | server + `RevealImage` | Heading (col 1), copy + link (col 2), almost-square image (col 3, aspect 25:27) that unmasks upward on scroll. |
| 7 | `NewsEvents` | server | Heading + outlined action (col 1); three stories (cols 2–3), 4:3 images, category/date meta, stretched-link cards. |
| 8 | `ContactBand` | server + `NewsletterForm` | Stone band. Invitation `h2` / contact copy + action / newsletter copy + email field with a square submit. Errors are announced politely; the field is labelled. |
| 9 | `SiteFooter` | server + `BackToTop` | Logo strip (mark + wordmark, generous padding, back-to-top square far right; it scrolls to the top and moves focus to `#top`). Six columns, then a micro legal row. |

### B5. Accessibility contract

- Skip link to `#main`; one `h1` per page; sections are labelled by their headings.
- All interactive targets are at least 44×44px (square controls) or inline text links.
- Focus: 2px accent outline, 3px offset; on dark surfaces it switches to `--color-on-dark`.
- Every motion path honors `prefers-reduced-motion`; Lenis is disabled under it.
- Non-current hero slides and closed menu panels are `inert`.
- Images have descriptive `alt` text; decorative media is `aria-hidden`.

### B6. Responsive summary

| Width | Header | Rows |
| --- | --- | --- |
| ≥ 1024 | Utility strip + full nav + mega panels | Three cells |
| 768–1023 | Utility strip + menu button + sheet | Two cells / stacked |
| < 768 | Menu button only | Single column; panels static |

### B7. Routes (skeletons)

`/`, `/about`, `/about/history`, `/about/leadership`, `/our-work`, `/causes`, `/causes/[slug]` (6, static), `/culture`, `/news-events`, `/news-events/[slug]` (published stories, news and events, static), `/gallery`, `/gallery/[slug]` (static), `/get-involved`, `/get-involved/membership`, `/get-involved/volunteer`, `/get-involved/partner`, `/donate`, `/contact`, `/search` (`?q=`, not indexed), `/privacy`, `/terms`, `/accessibility`, plus `not-found`, `sitemap.xml`, `robots.txt`, and `POST /api/newsletter`. Static params and the sitemap come from published records only.

### B8. Content and review flags

Superseded by **C4–C6**. Unchanged from Prompt 1: `POST /api/newsletter` validates input and forwards to `NEWSLETTER_WEBHOOK_URL` when that variable is set; otherwise it responds 503 and the form shows an honest "not available yet" message.

### B9. File map

```
app/
  layout.tsx            root shell: Geologica, skip link, header, smooth scroll, footer
  page.tsx              homepage: sections 1–8 in contract order (9 is the shared footer)
  globals.css           imports tokens + base
  (routes…)/page.tsx    skeletons, see B7 (gallery and search added in Prompt 2; events and reports in Prompt 3)
  api/newsletter/route.ts
components/
  layout/SiteHeader/    SiteHeader (client controller), overlayMotion (GSAP), panels/ (Programs,
                        Events, Menu, Search, Mobile)
  layout/SiteFooter/    SiteFooter (server), BackToTop (client)
  providers/            SmoothScrollProvider (Lenis ⇄ GSAP ticker, scroll lock, --scrollbar-w)
  sections/             Hero, Mission, IntroPanels, CausesCarousel, CultureFeature,
                        EditorialRow, NewsEvents, ContactBand
  motion/               Reveal (client, ScrollTrigger)
  ui/                   ActionLink, ArrowButton, MediaImage, icons
  page/                 PageIntro, PageSection, CardGrid, Pending (skeleton building blocks)
content/                typed records — see C4
assets/
  source/               original downloads from ekoclublouisiana.org (provenance; not imported)
  media/                optimized copies imported by content/media.ts
lib/                    gsap registration, motion constants, media-query hook, email check
styles/                 tokens.css, base.css, layout.module.css (cells + structural rules)
docs/                   ui-spec.md (this file), media-manifest.md
```

---

## Part C — Prompt 2: visual tokens, ECL copy and authentic media

### C1. Supplied contract (summary of Prompt 2)

- **Typography:** Geologica, variable, loaded once through `next/font`. Main and section headings weight 200, never bold. Navigation, descriptions and ordinary copy weight 300. Compact uppercase labels and small action text about 500–600. Keep the font's natural rounded geometric shapes.
- **Palette:** page `#EEEEEB`; charcoal panels `#1B1A14`; secondary gray `#E0E0DE`; very light panels `#FAFAF8`. Dark text uses the charcoal tone; on dark media/panels a warm near-white. Separators: charcoal at about 10–15% opacity on light, white at about 15–25% on dark. The page is warm gray and charcoal; the reference recording's blue cast is a camera artifact.
- **Calibration at 1363px:** outer gutters about 28.4px (2.083vw); hero heading about 113.6px (8.333vw, line-height 1, letter-spacing −0.01em); section headings about 28.4px (2.083vw, line-height 1.15); navigation about 17px (1.25vw). Sensible clamps and mobile overrides. Descriptions 16–18px on desktop; small labels and actions 11–12px. Comfortable body sizes on phones.
- **Structure:** a full-width grid with thin vertical rules at one third and two thirds of the viewport, with section columns aligned to it. The menu has its own 50/25/25 proportions; the footer has six subdivisions. Square or nearly square corners. No rounded image frames, drop shadows or large icon decorations. Controls are small outlined rectangles or squares.
- **Records:** centralized typed records for site settings, navigation, three hero slides, six causes, stories, events, news, leadership, reports, gallery albums and social links, with published/draft status, source, dates, media, alt text and required review fields. Menu previews, carousel cards, detail pages and search use the same records.
- **Copy:** the three hero slides, two mission paragraphs and six mission areas, as supplied (C5).
- **Media:** real ECL assets only, with local club assets taking priority; optimized copies with preserved focal points; a media manifest. Where footage is missing, use an authentic photograph at the correct geometry and record the outstanding asset. Never use the reference recording or fabricate club media.
- **Facts:** the review flags in C6.

### C2. Tokens (`styles/tokens.css`)

| Token | Value | Notes |
| --- | --- | --- |
| `--color-paper` | `#eeeeeb` | Main page |
| `--color-mist` | `#e0e0de` | Secondary gray: intro column, contact band, card media wells |
| `--color-paper-raised` | `#fafaf8` | Very light panels (causes panel, crest backgrounds) |
| `--color-charcoal` / `--color-ink` | `#1b1a14` | Panels and dark text |
| `--color-ink-muted` | `#5e5d57` | ≥ 4.5:1 on paper and mist |
| `--color-on-dark` | `#f4f2ec` | Warm near-white |
| `--color-line` | `rgb(27 26 20 / 0.13)` | Rules on light |
| `--color-line-on-dark` | `rgb(255 255 255 / 0.2)` | Rules on dark |
| `--font-sans` | Geologica (variable) | `next/font/google`, `--font-geologica` |
| `--fw-heading` / `--fw-body` / `--fw-label` | 200 / 300 / 500 | |
| `--page-x` = `--cell-x` = `--gutter` | `clamp(1.25rem, 2.083vw, 3rem)` | 28.4px at 1363 |
| `--fs-display` | `clamp(2.75rem, 8.333vw, 10.5rem)`, lh 1, −0.01em | Hero (113.6px at 1363) |
| `--fs-h2` | `clamp(1.5rem, 2.083vw, 2.75rem)`, lh 1.15 | Section headings, panel titles, mission paragraphs (`--fs-lead`) |
| `--fs-nav` | `clamp(0.9375rem, 1.25vw, 1.375rem)` | 17px at 1363 |
| `--fs-title` | `clamp(2.25rem, 4.167vw, 5.5rem)` | Inner-page h1, footer wordmark |
| `--fs-h3` | `clamp(1.125rem, 0.25rem + 1.25vw, 1.5rem)` | Card and caption titles |
| `--fs-body` | `clamp(1rem, 0.9rem + 0.25vw, 1.125rem)` | 16–18px; 16px on phones |
| `--fs-label` | `clamp(0.6875rem, 0.66rem + 0.08vw, 0.75rem)` | 11–12px, uppercase, 0.12em |

Measured in a 1363×860 window (15px scrollbar gutter, so vw resolves against 1348px): hero 112.3px at weight 200, section heading 28.1px, nav 16.9px at 300, gutter 28.1px. All are within 1.2% of the calibration.

Focus rings are 2px charcoal (warm white on dark surfaces). The terracotta accent from Prompt 1 is retired.

### C3. Structure

- `layout.rules` draws hairlines at `calc(100% / 3)` and `calc(200% / 3)` behind section content (pseudo-elements at `z-index: −1` in an isolated section). `rulesFirst` / `rulesSecond` keep one line where content spans the other: the mission keeps only the 2/3 line, News & Events and inner pages only the 1/3 line, and the culture feature uses `rulesDark`. Below 1024px the rules are hidden because columns stack.
- The header's nav area carries the 1/3 rule. Fixed layers stop at `--scrollbar-w`, which `SmoothScrollProvider` measures from the body width so that it also covers `scrollbar-gutter: stable`. This keeps the header's rule on the page grid (verified: both at 449.3px at 1363).
- Mega panel: `grid-template-columns: 2fr 1fr 1fr` (50/25/25), with full-height column rules at 50% and 75%. Columns: intro and overview action / link groups / record preview.
- Footer: six columns with a hairline before each; the rules stay continuous when the grid wraps to 3 or 2 columns.

### C4. Records (`content/`)

Every record extends `RecordMeta { status, provenance, review }`. Only `published` records render, enter menus, search, the sitemap or static params (`content/meta.ts → published()`).

| File | Record(s) | Current contents |
| --- | --- | --- |
| `site.ts` | `SiteSettings` + homepage copy | Name, published phone and email, "Baton Rouge, Louisiana"; street address `null` |
| `navigation.ts` | `NavItem[]`, footer columns | Menu previews resolved from records via `records.ts → previewFor()` |
| `hero.ts` | `HeroSlide[]` (3) | Prompt 2 copy |
| `causes.ts` | `Cause[]` (6 mission areas) | Prompt 2 titles and descriptions; no programs |
| `stories.ts` | `Story[]` | Empty: no real stories supplied |
| `news.ts` | `NewsItem[]` | "A new website for Eko Club Louisiana" (date set at launch) |
| `events.ts` | `EventRecord[]` | Inauguration and ECI quarterly meeting (Dec 2018, historical, from the photo's banner); the 2021 convention (historical) |
| `gallery.ts` | `GalleryAlbum[]` | One album: the 2018 group photograph |
| `leadership.ts`, `reports.ts`, `social.ts` | `Leader[]`, `Report[]`, `SocialLink[]` | Empty on purpose (do not invent) |
| `media.ts` | `MediaAsset` manifest, `resolveMedia()`, `outstandingMedia` | See `docs/media-manifest.md` |
| `feed.ts`, `records.ts`, `cards.ts`, `search.ts` | Shared views | Homepage feed, menu previews, listing cards and search all read the same records |
| `review.ts` | `factualFlags`, `getReviewFlags()` | Internal launch checklist |

`PartialDate { value, precision }` lets dates be recorded only as precisely as known ("2021", "December 2018"). `MediaRef { asset, focal, zoom, fit, alt }` lets each placement crop a shared asset at its own geometry while keeping its own description.

### C5. Copy in use

- **Hero 1:** "Eko Club Louisiana" / "A shared legacy" / "Advancing culture, education and humanitarian support in Louisiana and Lagos." / "Discover our mission" → `/about#mission`.
- **Hero 2:** "Our community" / "Community in action" / "Explore the people, gatherings and service that connect our community." / "Explore our community" → `/gallery`.
- **Hero 3:** "Get involved" / "Build with us" / "Join, volunteer or support the work of Eko Club Louisiana." / "Get involved" → `/get-involved`.
- **Mission:** the two paragraphs, verbatim.
- **Mission areas:** Education, Youth Leadership, Cultural Heritage, Humanitarian Support, Community Building, Health and Wellbeing, each with its supplied short description.
- Copy not supplied in Prompt 2 (intro, panels, culture, editorial, contact band, page intros) is marked `editorial-draft` in its provenance and carries a review note.

### C6. Factual review flags (internal; `content/review.ts → factualFlags`)

- Street address unresolved: 17669 Willow Trail Drive, Baton Rouge, LA 70817 (contact page) versus 7240 Renoir Ave, Baton Rouge, Louisiana 70806 (old footer). The site shows **Baton Rouge, Louisiana** only.
- Phone **(225) 932-9150** and email **info@ekoclublouisiana.com** are used as published. The .com is not changed to .org.
- Not used: "20 years", "over 1000 members", and the original Eko Club's 1974 founding / May 1975 launch as a Louisiana date.
- The 2021 convention is historical and is never presented as upcoming.
- Not invented: officers, financial reports, testimonials, social URLs, future events, tax recognition, impact totals. The corresponding records are empty, and their pages show a polite "on its way" note.

### C7. Media

Only two authentic ECL assets were available. Both were downloaded from ekoclublouisiana.org with permission (originals in `assets/source/`):

- `eclGroup2018`: the homepage group photograph, trimmed of its dark edge border and stored as a high-quality JPEG (979×606). It stands in for every image placement, cropped per placement by focal point and zoom. The carousel shows six different sections of it.
- `eclCrest`: the club crest (238×239 PNG). Used for the header, footer, app icons and the 2021 convention card.

The archive photographs from the Prompt 1 build (Eko Club International and Houston) were removed, since they are not ECL media. The culture video and further photography are recorded as outstanding in `content/media.ts → outstandingMedia` and `docs/media-manifest.md`.

---

## Part D — Prompt 3: header and three distinct dropdowns

Supersedes the header and menu rows of B4 and the mega panel in C3.

### D1. Header

| Element | Spec | Implementation |
| --- | --- | --- |
| Utility strip | ≈27px at 1363; identity text left; links far right with delicate rules | `--utility-h: clamp(1.5rem, 1.98vw, 2rem)` (measured 27.0px). "Eko Club Louisiana · Baton Rouge" left; **Join us │ Contact** right, separated by a 42%-height hairline. Scrolls out (translates up) after 24px. Hidden below 768px. |
| Main row | ≈73.5px | `--nav-h: clamp(3.75rem, 5.39vw, 5.25rem)` (measured 73.5px). Pinned to the viewport top. |
| Logo | Modest; real emblem + name | ECL crest (~36px) linking Home, with a two-line uppercase "Eko Club / Louisiana" wordmark. |
| Right-aligned sequence | 4 nav groups, compact action, search, Menu | **Programs ▾**, **About us**, **Get involved**, **Events ▾** · **Donate** (small outlined rectangle, replacing the language control) · search icon · "Menu" + three-line hamburger that folds into a thin X. |
| Themes | Translucent with light text and a thin light line on the hero; pale with charcoal text after | `data-theme="overlay"` while the hero is under the bar and no overlay is open; otherwise `solid`. Dark sections never switch it back. |

Below 1024px the four nav groups move into the mobile panel. Below 560px Donate leaves the bar and is the most prominent item in the mobile panel.

### D2. Panels

| | Shape at 1363 | Content |
| --- | --- | --- |
| **A. Programs** (`ProgramsPanel`) | Thirds; min-height `clamp(18rem, 25.5vw, 24rem)` (measured 348px) | Left ⅓: one authentic photograph (2018 group photo), flush to the panel's lower edge. Middle ⅓: "Programs & causes" label, the six categories at `--fs-h2` (28px / 32px line height). Right ⅓: open, with a quiet "All programs & causes". No per-category photography exists, so there is no crossfade. Hovering a link recedes its siblings, draws a hairline underline and slides in an arrow. |
| **B. Events** (`EventsPanel`) | ⅓ + ⅔; min-height `clamp(20rem, 28vw, 26rem)` (measured 382px) | Left: label, two-line invitation, "All events" lower down. Right: three equal cards (16:10 photo, title, date · location · status, "Learn more"). Cards come from event records: announced events first, then past events labelled "Past event". With nothing announced, the third slot is a status card ("Upcoming events / None announced yet / Get updates"). No future events are invented. |
| **C. Menu** (`MenuPanel`) | 50/25/25 with hairline separators; min-height `clamp(21rem, 28.5vw, 27rem)` (measured 388px) | Left half: "Welcome to ECL" with **Programs & causes** and **Our community**. Middle: About ECL (About us, History, Leadership, Our impact, News). Right: Take part (Join us, Volunteer, Reports, Donate, Contact). A shared **Follow us** row spans the right quarters under a hairline; it lists approved accounts only, and shows "Official accounts will be listed here" while there are none. |
| **Search** (`SearchPanel`) | ⅓ + ⅔ (measured 232px) | Large field (`--fs-h2`) with a square submit, plus suggested destinations. Submits to `/search`. |
| **Mobile** (`MobilePanel`) | Full width, full remaining height | Root: Programs ›, About us, Get involved, Events ›, then Donate (charcoal block), Join us and Contact. Programs and Events drill into nested levels, each with an explicit **Back** control. Levels slide (GSAP, 450ms); hidden levels are `inert`; focus moves to Back on entry and returns to the opener. Each level scrolls independently. |

New routes linked from these panels: `/events` (announced + past events) and `/reports` (reports records; currently empty).

### D3. State and interaction

- A single overlay state: `none | programs | events | menu | search`. Below 1024px, `menu` maps to the mobile panel and the dropdowns are unavailable.
- **Hover:** Programs and Events open after 60ms of hover intent (immediately when switching between them). Moving into the panel keeps it open; leaving the header and panel closes it after a **150ms** grace period. Hover never replaces an overlay opened by clicking Menu or Search. Clicking a hover-opened dropdown pins it.
- **Click/tap:** every control is a disclosure button with `aria-expanded` / `aria-controls`.
- **Keyboard:** Enter/Space toggle; ArrowDown opens and focuses the first item. Tab from an open dropdown's trigger enters its panel; Tab past the last item continues to the next bar control and closes the dropdown; Shift+Tab from the first item returns to the trigger. Menu and Search move focus into the panel (the search field) on open.
- **Dismissal:** Escape (focus returns to the control that opened it), backdrop click (ignored for 350ms after opening, while the panel unclips), and route change.
- **Covered content:** while open, `#main` and `#site-footer` are `inert` and page scroll is locked (Lenis stopped). If focus is inside a closing panel, it returns to the opener.
- **Overflow:** panels cap at the viewport height below the bar (`--panel-top`) and scroll internally.

### D4. Motion (`overlayMotion.ts`)

| Phase | Timing |
| --- | --- |
| Backdrop blur (9px) + dim | 300ms, power2.out |
| Panel reveal from the header edge | clip-path `inset(0 0 100% 0)` → `inset(0)`, 500ms, power3.out |
| Content | opacity 0 → 1, y 12px → 0, 300ms, starting 120ms after the panel, 35ms stagger |
| Close | content (180ms, reverse stagger) → panel (380ms) → backdrop (280ms) |
| Switch | outgoing content fades 120ms and hides; incoming panel reveals; backdrop stays |

Every tween animates *to* a state from wherever the element is, and each change kills the previous timeline, so rapid open/close/switch reverses or replaces smoothly. Under reduced motion, timelines jump to their end state. The hero keeps playing behind the blur.

### D5. Verification (1363×860, headless Chrome, from the hero and from a scrolled page)

Utility 27.0px · bar 73.5px · Programs 348px · Events 382px · Menu 388px. Hover open, grace close, switch, pin, Escape focus restore, Tab bridging, backdrop dismissal, rapid triple toggle, `inert` page and the solid bar over the dark culture section were all checked. Mobile (390×844): root, Programs level, Back (focus returns), Events level, Escape, and opening from a scrolled page; no horizontal overflow.

---

## Part E — Prompt 4: three-curtain loader, cinematic hero and scroll physics

Supersedes the hero row of B4.

### E1. Loader (`components/sections/Hero/IntroLoader.tsx`)

- A fixed `#1B1A14` overlay above everything, made of **three independent curtains**, each one third of the page grid. Their shared edges are the fine rules at 33.333% and 66.666%. A small centered ECL crest (44px) fades in.
- **Sequence:** mark fades in over 300ms, with a 350ms minimum hold. When Geologica (`document.fonts.load`) and the first hero image are ready, capped at **1.8s**, the mark fades out while the curtains lift to `yPercent: -100`: left first, middle +80ms, right +80ms, 750ms each, `power3.inOut`. This exposes the hero from the bottom up. The header (opacity), hero copy (24px rise, 60ms stagger) and control strip (12px rise) resolve beneath the retreating curtains.
- **Production timings** (1363×936, warm cache): mark fully in at 378ms; curtains start at 1094 / 1179 / 1245ms; loader removed at 2.26s.
- **Never stuck:** page scroll is locked and the header and hero are `inert` only while the loader covers them. Cleanup always releases both. A 4.5s JS failsafe completes the sequence, a CSS failsafe animation hides the loader after 3s if JS never takes over, and `<noscript>` hides it entirely. Under reduced motion it never shows.
- **Once per document load:** a module-level flag means client-side navigation back to the homepage (or back-to-top) never replays it. The loader is server-rendered, so it covers the first paint with no hero flash.

### E2. Hero at rest

- Full-bleed `100svh` (min 34rem), with the fixed header overlaid. No normal-flow header height precedes it. Media is `object-fit: cover`. `--hero-scrim` darkens toward the copy and controls only.
- **Bottom-anchored** copy at the 2.083vw gutter: control strip `--controls-h: clamp(3.25rem, 4.7vw, 4.75rem)` (64px) · clearance `clamp(1.25rem, 2.5vw, 2.5rem)` (34px) · content group of eyebrow, 20px gap, headline (113.6px Geologica 200, line-height 1), 26px gap, then the support sentence and a compact 24px outlined CTA sharing one row (25px apart).
- **Measured at 1363×936** (15px scrollbar gutter): eyebrow y=635, headline 670, support 809, controls 872. Targets were ≈640 / 675 / 815 / 872.
- **Phones:** support and CTA stack; tabs show numbers only (full labels remain their accessible names).

### E3. Slides and media

- **Slides:** the three Prompt 2 slides, with tab labels "1. Our mission", "2. Our community", "3. Get involved". One `active` index drives media, copy and tabs.
- **Transition (GSAP):** outgoing copy lifts 20px and fades (220ms, 40ms stagger; the title moves inside its own mask), media crossfades (650ms, power2.out), and incoming copy rises from 24px (450ms, power3.out, 50ms stagger, starting at 240ms). Every tween runs *to* its target from current values, so repeated input kills and replaces the timeline without jumps. Reduced motion jumps to the end state.
- **Input:** arrows wrap; tabs select directly (←/→/Home/End with roving focus). Touch swipes of ≥48px that are mostly horizontal select slides; `touch-action: pan-y` keeps vertical gestures native. Advancement is manual only. Inactive copy is `inert`.
- **Video (`HeroVideo.tsx`):** slide records accept `video: VideoSource[]` (muted, `playsInline`, looping, with the photograph as poster). Cuts inside one clip are not slides. Only the active clip plays, and only while the hero is on screen and the tab is visible. Footage resumes after returning from the footer. If autoplay is rejected, the poster stays in a paused state with a Play control. If every source fails, the poster photograph replaces the video. A small pause/play square appears only when the active slide has footage. Under reduced motion nothing autoplays, but the visitor can still choose Play.
- **Footage is outstanding:** no club footage exists, so slide 1 shows the authentic group photograph (`outstandingMedia`). Video behavior was verified with a synthetic test clip served only through request interception, never committed: play, pause/play, inactive pause, footer pause and resume, 404 fallback, autoplay rejection, and reduced-motion opt-in.

### E4. Control strip

Thin full-width top rule; transparent bar. Left: two 27px outlined arrow squares (6px gap), then a full-height divider, then the three numbered uppercase tabs (active `--color-on-dark`, inactive muted). Right gutter: optional media toggle, then an outlined **down-arrow** square that scrolls to `#mission` (lands 90px from the top, just below the 73px bar).

### E5. Scrolling

- Native document flow. On desktop, Lenis runs with `lerp: 0.1` and `wheelMultiplier: 1`, driven by the GSAP ticker (`autoRaf: false`, `lagSmoothing(0)`) as the single animation-frame owner, with `ScrollTrigger.update` on scroll. Touch and reduced-motion devices use native scrolling.
- Header offsets come from `scroll-padding-top` (bar + 1rem), which Lenis already honors for element targets. `anchors: true` and `scrollToTarget` therefore add no offset of their own; the fallback uses `scrollIntoView`.
- Verified: wheel, PageDown / End / Home, the down arrow, `/about#mission` (lands at 90px), history Back restoring y=2200, and no loader replay on client navigation. There is no snapping, pinning or artificial hero scroll. Overlays and the loader suspend Lenis through the shared lock counter.

---

## Part F — Prompt 5: mission copy and reversible impact/causes panels

Supersedes the mission and intro-panel rows of B4.

### F1. Mission

On `#EEEEEB`. Padding `clamp(4rem, 11vw, 10rem)` above and `clamp(2.5rem, 5.5vw, 5rem)` below the content (≈150 / 75px at 1363, smaller on phones). The "Our mission" label and the two supplied paragraphs sit at `--fs-h2` (28.4px measured), weight 200, line-height 1.2, spanning columns 1–2 from the standard gutter; the right third is empty with the hairline rule at ⅔. The paragraphs are separated by the grid gap, not cards.

### F2. Panel row (`IntroPanels`, `RevealPanel`)

- **Geometry:** the section is padded `clamp(3rem, 11vw, 10rem)` (measured 709px tall). Three flush panels sit on one baseline: gutter→⅓, ⅓→⅔, ⅔→gutter (measured 421 / 449 / 421px wide with a 15px scrollbar; ≈426 / 454 / 426 at a true 1363). Height is `--panel-h: clamp(21rem, 30vw, 32rem)` (409px). Padding is 28px, with titles 42px below the top (`--panel-top`). Backgrounds: `#E0E0DE` / `#1B1A14` / `#FAFAF8`. No gaps, radii or shadows.
- **Left (static):** "What we do" / "A legacy we share" / two short paragraphs (editorial draft, flagged for review).
- **Impact (middle):** default shows "Our impact" with a tiny outlined arrow top-left and a photograph covering 60% of the width (4:3) inset at the lower right. Active: the photo fades, the title travels to the bottom-left anchor (28px above the bottom), and the supplied paragraph appears top-left with "Explore our impact" → `/our-work`.
- **Causes (right):** same shape; active reveals the six category links (`clamp(1.375rem, 1.95vw, 1.75rem)`, weight 200, line-height 1.18) → `/causes/[slug]`.
- **Motion:** one paused GSAP timeline per panel: photo opacity → 0 (200ms), title `y` to the bottom anchor (480ms, `power2.inOut`, re-measured on resize), and content from 12px over 300ms after 100ms with a 30ms stagger. Activation plays it; deactivation reverses it from the current point, so fast movement between panels reverses mid-flight. Reduced motion jumps to the end state.
- **Interaction:** mouse hover and keyboard focus activate the panel. The title is a disclosure button (`aria-expanded` / `aria-controls`): taps and Enter/Space toggle it, and Escape closes it and refocuses the title. Concealed content is `inert` with `pointer-events: none`. On touch, a tap only expands the panel; the revealed links are separate actions.
- **Below 1024px:** introduction, impact and causes stack full-width within the gutters. Panels keep their states, at a minimum height of 21rem.
- **Verified at 1363×936:** default; middle active (title 29px from the bottom, photo 0, body interactive); fast move to the right panel mid-animation; right active; exit and re-entry; keyboard (focus opens, Tab reaches the action, Escape restores focus, Enter toggles); touch (tap expands without navigating, link tap navigates); reduced motion (immediate).

---

## Part G — Prompt 6: causes track with momentum dragging

Supersedes the carousel row of B4.

- **Section:** one light section on `#EEEEEB` with a fine top rule and no raised box. "Explore our causes" sits at the left gutter, with two small outlined square controls at the far right on the same baseline (≈30px on desktop, 44px on coarse pointers). Space beneath the captions is `clamp(4rem, 12.5vw, 11rem)` (measured 170px at 1363).
- **Track:** Embla with `align: start`, `containScroll: trimSnaps`, `loop: false`, `dragFree: true` (momentum, with a bounded settle), `dragThreshold: 7` and `duration: 30` (≈500ms settle; 12 under reduced motion). The viewport is inset by the gutters and clips overflow. Items are `26vw` with a `clamp(0.5rem, 0.8vw, 0.875rem)` gap, so three full items plus about 55% of the fourth show at 1363 (354px square images). Tablet uses `40vw` (two plus a partial); phones use `78vw` (one plus a visible next edge).
- **Items:** the six causes from `content/causes.ts`, in order. Each has a square photograph, the title directly beneath, a short description, then a small outlined uppercase "Explore cause" action further down. Photo, title and action share the cause route. The photo link is out of the tab order and hidden from assistive tech; the title and action links are focusable.
- **States:** finite track. Previous is disabled at the start and Next at the end; both follow arrows, drags and resizes (subscribed to `select`, `scroll`, `settle` and `reInit`). Focusing an offscreen item scrolls it into view. Cursor is grab at rest and grabbing while dragging. Images, links and slides are not natively draggable. Embla suppresses the click that ends a drag. `touch-action: pan-y` keeps vertical page scrolling native. No autoplay or marquee.
- **Media:** only one authentic photograph exists, so the six images are distinct sections of the 2018 group photo (focal x 8–96%, zoom 1.5). Neighbors overlap; per-cause photography is outstanding (`docs/media-manifest.md`).
- **Verified (1363×936 unless noted):** start (prev disabled; visible 1 / 1 / 1 / 0.55); one item per Next with settle by ≈650ms; rapid ×4 to the end (next disabled); ×6 back to the start; a fast drag of 540px moved ≈1.5 items, settled in bounds and did not navigate; a 3px press-release followed the link; Tab focus to item 6 revealed it; resizes to 900 and 1600px stayed synced and bounded; phone horizontal swipe moved the track, vertical swipe scrolled the page (2341 → 3193) without moving it; reduced motion settled within 200ms.

---

## Part H — Prompt 7: charcoal culture feature and three-column editorial row

Supersedes the culture and editorial rows of B4.

### H1. Culture feature (`CultureFeature`, `AmbientVideo`)

- **Layout:** `#1B1A14`, padding `clamp(2.5rem, 6.24vw, 6rem)` (85px at 1363; measured 644px total). A hairline sits at ⅓ only (`rulesFirst` + `rulesDark`). The left third holds "Our culture", the heading "Rooted in Lagos. Connected in Louisiana." (one sentence per line) and a small "About the club" text action (`/about`) with a fine underline and a short leading mark, near the top over open charcoal. The right two thirds hold a 16:9 media slot inset 28px from the ⅓ line and the right gutter (measured 842×474). Square corners, no frame, no central play button. The header stays solid above it.
- **Media:** muted, `playsInline`, looping footage with a poster. It plays only while ≥25% visible and pauses off screen. A small square pause/play control appears only when footage exists. Autoplay rejection leaves the poster with Play. If every source fails, or none exists, the poster photograph fills the slot. Reduced motion starts paused (Play remains available). No modal.
- **Footage is outstanding:** no authentic clip exists, so the 2018 group photograph is shown and the need is recorded in `content/media.ts → outstandingMedia` and the media manifest. Verified with a synthetic clip served only through request interception (since reverted): play, pause, play, pause off screen, resume, 404 → photograph with no control.

### H2. Editorial row (`EditorialRow`)

- **Layout:** `#EEEEEB`, 85px above (measured from the charcoal edge) and below. Three thirds with both rules. Left: "Get involved" / "A community built together" (two lines). Middle: the two supplied paragraphs and the "Find your way to get involved" text action (`/get-involved`). Right: a near-square photograph (1:1.05) filling the third (measured 393×412). Everything is top-aligned; the open lower area is intentional.
- **Copy and photo:** verbatim from Prompt 7. No fees, eligibility, schedules or assignments. A real participation photograph is outstanding (flagged on the record); the group photograph stands in.
- **Mobile:** label/heading, then explanation/action, then media, in reading order. The culture media keeps 16:9 with no horizontal overflow.

### H3. Entrance motion (`Reveal`)

The site-wide default is now opacity 0→1 with a 20px rise over 550ms, `power2.out`, once, via ScrollTrigger batches with a 60ms stagger. Images use `data-reveal-y="10"`, smaller than text. Elements already on screen at hydration are not hidden. No scale, rotation, parallax or pinning. The former clip-path `RevealImage` has been removed. Reduced motion skips the entrance.

---

## Part I — Prompt 8: news, contact, newsletter, search and footer

Supersedes the news, contact and footer rows of B4, the footer in C, and the search panel contents in D.

### I1. News & Events (`NewsEvents`)

- **Layout:** `#EEEEEB`, thin upper rule, ⅓ grid line. The left third holds "News & Events" and a small "View all updates" link with a leading mark (`/news`). The right two thirds hold three equal story columns with narrow gaps (measured 272px each at 1363, 3:2 images). Each column has an image, a small uppercase date/category line, a light 1–3 line title and a compact outlined "Learn more" label. There is no excerpt and no card surround. The title link covers the whole column, so each story is one tab stop. On hover the image scales to 1.02. Measured section height: 500px, with generous space below.
- **Truthful content:** only `published()` news and dated events from `content/feed.ts`. Today that means the 2021 convention ("Archive · 2021") and the December 2018 inauguration ("Archive · December 2018"), both explicitly archived. When fewer than three records exist, the open column says "No further updates yet / More news will appear here as the club publishes it" and offers "Get updates" (the newsletter dialog). No headline or date is invented. The "new website" note is a draft and does not appear.
- **Routes:** stories now live at `/news/[slug]`. `/news-events` and `/news-events/:slug` redirect permanently (next.config.ts).

### I2. Contact / newsletter band (`ContactBand`)

- **Layout:** full width, `#E0E0DE`, ≈50px top padding and ≈325px tall at 1363. It is split into thirds with fine rules. Left: "Have a" / "question?" on two explicit lines. Middle: a light "Contact us" heading, two small paragraphs (an editorial draft plus the club email and phone) and a charcoal "Send a message" rectangle. Right (`#newsletter`): "Newsletter", the supplied line "Get updates on community programs, volunteer opportunities and club news." and a small underlined "Sign up for updates" link with a leading mark. There is no social feed and no popup.
- **Actions:** both actions are real links (`/contact`, `/contact#newsletter`). A plain click opens the matching dialog instead (`DialogLink` → `requestDialog`). Modified clicks, new tabs and no-JS visits use the page.

### I3. Form dialogs (`DialogHost`, `FormDialog`, `ContactForm`, `NewsletterSignup`)

- **Shell:** native `<dialog>` with `showModal()`, mounted once in the layout. It uses thin rules, Geologica, near-square controls, visible labels and a close X. Focus moves into the dialog, and Tab wraps inside it. Escape, the close X and a backdrop click all close it. Focus returns to the opener, and the page scroll position is held while it is open and restored afterwards.
- **Contact:** name, email, topic (select), message and a compact submit. **Newsletter:** email, optional name and an explicit consent checkbox (required). Both include a hidden honeypot.
- **States:**
  - **Validation:** inline per-field errors (`aria-invalid` + `aria-describedby`). Focus moves to the first invalid field.
  - **Loading:** "Sending…", with the button disabled and `aria-busy`.
  - **Success:** shown only when the API answers `{ ok: true }` after the provider/webhook acknowledges.
  - **Error:** 400 marks the fields. 503 (no provider configured) gives the club email and phone. Any other failure offers a retry.
- **API:**
  - `/api/contact` forwards to `CONTACT_WEBHOOK_URL`.
  - `/api/newsletter` forwards `{ email, name, consent: true }` to `NEWSLETTER_WEBHOOK_URL`.
  - Both validate on the server with `lib/forms.ts`.
  - Until those variables are set, both answer 503, which is the honest state.
- **Fallback:** `/contact` keeps both forms inline (`#message`, `#newsletter`) plus the address block (city only, until the street address is confirmed).

### I4. One layer at a time (`lib/overlay-bus.ts`)

Header overlays (dropdowns, Menu, Search, mobile panel) and form dialogs announce themselves when they open. Any other open layer closes in response. Opening a dialog from inside a header panel closes the panel and moves focus to its trigger first, so the dialog later returns focus there. Verified with Search open, then a contact dialog request: the header closed, the dialog opened, and Escape returned focus to Search.

### I5. Footer (`SiteFooter`)

- **Logo strip:** 100–120px (measured 110). The crest (60px, larger than the header mark) and the "Eko Club Louisiana" wordmark sit at the left gutter. A small outlined up-arrow square sits at the right. A fine bottom rule closes it.
- **Six columns:** subtle vertical rules, ≈40px top padding, small uppercase labels, 12–14px links (measured 12.9px) and open space below.
  1. Identity: phone and email.
  2. Location: "Baton Rouge, Louisiana" plus a one-line description, with no street address.
  3. About: About us, History, Leadership, Our impact, News.
  4. Take part: Join us, Volunteer, Events, Donate, Reports.
  5. Programs & causes: the six causes.
  6. Contact: Contact us and Newsletter (dialogs, with page fallbacks), plus approved social accounts. None are approved yet, so none are listed.
- There is no affiliation badge and no QR code.
- **Legal row:** a thin divider. The left side shows `© {current year} Eko Club Louisiana.` with the legal line. The right side links to Privacy, Cookies, Preferences (`/cookies#preferences`) and Accessibility. `/cookies` is new and states that no optional cookies are set.
- **Mobile:** two columns with rules between them and between rows. There is no horizontal overflow.

### I6. Back to top

The footer up-arrow scrolls to 0 over 1.1s with a soft cubic ease in/out (Lenis on desktop, an rAF tween elsewhere; wheel or touch cancels it). Under reduced motion it jumps immediately. Focus then moves to `#top`. The transparent hero header returns through the normal hero observer. Media is untouched, and the loader never replays. Measured: 4671px in 1075ms, theme `overlay`, no loader.

### I7. Search panel

- **Panel:** full-width light panel with one large input over a thin bottom rule and a square close X. Enter (or the arrow button) opens `/search?q=`.
- **States:**
  - **Empty:** suggested destinations.
  - **Typing:** up to 6 live results (type/meta label plus title), with "See all N results" when more exist. A polite live region announces the count.
  - **No match:** "No results for …", an explanation and the suggestions.
- **Keyboard:** ArrowDown/ArrowUp move between the input and the results. Escape or the X closes the panel and returns focus to the Search button. The query clears on close.
- **Index:** `content/search.ts → searchIndex()` covers published pages, causes, news, events, stories, galleries and reports only. Form submissions and applications are never stored by the site, so they cannot be indexed. Verified: "application" and "submission" return no results.

---

## Part J — Prompt 9: content pages and the donate, join, volunteer and event flows

Inner pages reuse the shared system with no dashboard-style chrome: the persistent header (with Donate), `PageIntro` (label in the left third, a Geologica 200 title and lead across two thirds, and an optional wide authentic image), ruled `PageSection` rows on paper or mist, compact outlined or charcoal actions (`ActionRow`), and the shared footer. The homepage sequence is unchanged.

### J1. Routes

| Route | Content |
| --- | --- |
| `/about` | Mission, who the club serves, the six areas, links to history, leadership, impact, reports and gallery |
| `/about/history` | Two separate records (`content/history.ts`): the original Eko Club (1974 founding, May 1975 launch, explicitly not ECL's founding) and Eko Club Louisiana (a draft until the club supplies an approved account; the page says it is being written) |
| `/about/leadership` | Approved officers only: photograph, role, term, name, bio; otherwise a plain notice. Includes a transparency link to reports |
| `/programs`, `/programs/[slug]` | The six mission areas: real media crops, an explanation paragraph (draft, flagged), related published stories, and Take part actions (`/volunteer?interest=<slug>` preselects the interest) |
| `/impact`, `/impact/[slug]` | Figures (only with `asOf` and source, in restrained type), stories, volunteer highlights, testimonials (only with `consent`); one honest notice when nothing is published |
| `/events`, `/events/[slug]`, `/events/[slug]/calendar.ics` | J3 |
| `/get-involved`, `/join`, `/volunteer` | J4 |
| `/donate`, `/donate/thank-you` | J5 |
| `/news`, `/news/[slug]` | Dated club updates only (day precision), with share links; an honest empty state. Events live under `/events` and stories under `/impact`. The homepage News & Events cards link to each kind's own page |
| `/gallery`, `/gallery/[slug]` | J6 |
| `/reports` | Kind, reporting period and description; a download (format and size) only when the file exists under `/public` at build time, otherwise "available on request" |
| `/contact`, `/privacy`, `/cookies` | Consistent contact details. `?topic=Partnership` preselects the topic. Policy text is generated from the configured services (J8) |

### J2. Redirects (`next.config.ts`, permanent)

- **Previous WordPress site:**
  - `/history/` → `/about/history`
  - `/contact-2/` → `/contact`
  - `/2021-eci-biennial-convention-coming-up-in-louisiana/` → `/events/2021-eci-biennial-convention` (the preserved archive record)
- **Earlier routes of this site:**
  - `/causes(/…)` → `/programs(/…)`
  - `/our-work` → `/impact`
  - `/get-involved/membership` → `/join`
  - `/get-involved/volunteer` → `/volunteer`
  - `/get-involved/partner` → `/get-involved#partnerships`
  - `/news/<event>` and `/news-events/…` → the matching event or `/news`
- `/gallery/` resolves through Next's trailing-slash normalisation.

### J3. Events

- **Record:** `category`, `location`, and `schedule` (`start`/`end` as local "YYYY-MM-DDTHH:mm" plus `timeZone`, present only when confirmed). `rsvp` is `{ enabled, capacity, maxPartySize, closes }`. `historical: true` forces the archive.
- **Time handling:** `lib/time.ts` converts wall time to UTC with the platform's zone data. Louisiana shows CST/CDT with daylight saving; Lagos shows WAT. Verified: 7 Mar 2026 18:00 CST = 00:00Z, 14 Mar 2026 18:00 CDT = 23:00Z, 7 Nov 2026 back to CST, Lagos 18:00 = 17:00Z.
- **Listing:** server-rendered from the URL (`when`, `view`, `category`, `year`, `month`), so it is shareable and works without JavaScript.
  - Upcoming/Past tabs with counts. Upcoming sorts soonest first; Past sorts newest first.
  - Category and year filters use only values present in the tab. A visible count is shown.
  - List rows: 3:2 image, status badge, category, title, day, time and zone, location, excerpt.
  - Month calendar (a table) with previous/next month links. Events whose exact day is unconfirmed are listed under the grid.
  - Truthful empty states: no upcoming events (newsletter and past-events links), no filter matches (Clear filters).
- **Detail:** facts list (date, time and zone, location, status), description, image, and share links.
  - "Add to calendar (.ics)" appears only for a confirmed upcoming schedule. The `.ics` uses UTC stamps and returns 404 when there is no schedule.
  - RSVP appears only when `rsvp.enabled`, the event has a schedule, it is upcoming and RSVPs have not closed. Otherwise the page says "RSVPs have closed" or "This event has ended".
- **RSVP (`/api/rsvp`):**
  - Checks, in order: same-site, rate limit, size limit, honeypot, the event's RSVP state, then validation (`maxPartySize`).
  - With a data store it also enforces a duplicate guard (SHA-256 of the email, never the address) and capacity (atomic reserve, released if delivery fails).
  - Then delivery to the form service, then a confirmation with a reference code.
  - An event with a capacity but no store refuses RSVPs (503) rather than risk overbooking.
  - Verified: validation; party of 2 confirmed (signed webhook received); duplicate refused; over-capacity refused with the form kept; last place filled; closed/past refused; upstream failure shows a retry message with the data kept, and the retry succeeds.
- No recurring meetings are generated. The 2021 convention and the 2018 inauguration are archive records.

### J4. Join, volunteer, partnerships

- `/get-involved` gives three paths (membership, volunteering, partnership via `/contact?topic=Partnership`) plus giving.
- **`/join`:** name, email, optional phone, city and interests (the six programs), an optional message, and a required acknowledgement that this is a request, not membership. The confirmation says the club will follow up and that membership is not yet confirmed. No fees or criteria are stated.
- **`/volunteer`:** name, email, optional phone, interests (six programs plus club events), availability and message, and required consent.
- **Shared hook (`useSubmission`):**
  - Runs client validation (repeated on the server) and moves focus to the first invalid field.
  - Shows a loading state.
  - Reports success only after a 2xx from the configured service; the form clears only then.
  - Maps errors: 400 marks fields, 409 shows a specific conflict, 429 asks the visitor to wait, 503 offers the club email and phone, and any other failure offers a retry. On every recoverable error the visitor's data stays in the form.
- Submissions are never stored by the site, published, or indexed. Search for an email returns nothing.

### J5. Donations (`/donate`)

- **Header:** Donate is visible on every page and at every width. Below 560px it tightens and the "Menu" word becomes screen-reader-only.
- **Entry:**
  - A Frequency choice (One time / Monthly) appears only when `content/donations.ts` approves monthly giving and the provider supports it.
  - Preset amounts plus Other (whole dollars, min/max), and a designation (only published ones; a hidden field when there is just one).
  - The submit button shows the amount ("Continue to secure checkout · $40 / month").
  - There is no card field anywhere.
- **Server (`/api/donate/checkout`):**
  - Rejects cross-site requests, rate-limits, and validates amount (integer within bounds), currency, frequency and designation against `content/donations.ts`.
  - Requires a per-attempt id; the provider idempotency key is SHA-256(attempt, amount, currency, frequency, designation).
  - Creates a Stripe hosted Checkout Session (`payment` with `submit_type=donate`, or `subscription` monthly) with `success_url=/donate/thank-you?session_id={CHECKOUT_SESSION_ID}` and `cancel_url=/donate?checkout=canceled`.
  - Records the donation as `pending` in the data store and returns the hosted URL.
- **Webhook (`/api/donate/webhook`):**
  - Verifies `Stripe-Signature` over the raw body (HMAC-SHA256, constant-time compare, 300s tolerance).
  - Dedupes events by id.
  - Maps statuses: completed + paid → `paid`; completed + unpaid → `processing`; async succeeded → `paid`; async failed → `failed`; expired → `expired`. `paid` and `failed` are final, so late events cannot downgrade them.
- **Thank-you page:** polls `/api/donate/status` (store only) and shows Confirming, Thank you (amount), Processing, Payment did not go through, Checkout not completed, Still waiting (Check again), Can't check right now, or Couldn't find this donation. The return URL is never treated as proof.
- **Canceled return:** the page states that nothing was charged.
- **Safety:** keys stay server-side. Live keys are refused unless `DONATIONS_ALLOW_LIVE=true`. `STRIPE_API_BASE` (honoured only with test keys) exists solely to point the adapter at a local mock.
- **Unconfigured:** the page explains that online giving is being set up and offers email and phone. There is no inert button.
- **Verified against a local Stripe-shaped mock** (no real payment, no real Stripe call):
  - Idempotent retries return the same session; a changed amount creates a new one.
  - Tampered amount, currency and designation, and a missing attempt id, are all rejected.
  - Monthly creates a subscription.
  - Bad, stale and unsigned signatures are rejected; a replay is deduped.
  - Paid shows "$50.00 is confirmed", and a late "expired" does not override it.
  - The processing, failed, expired and unknown states all display.
  - The browser flow redirects to the hosted page with 4000 cents.

### J6. Gallery lightbox (`AlbumGallery`)

- **Thumbnails:** real links to the full-size image (no-JS fallback). A plain click opens a native modal dialog on charcoal.
- **Dialog contents:** "Photo n of N" (live region), the photo uncropped (`object-fit: contain`), caption and photographer credit, a close button, and previous/next buttons when N > 1.
- **Keyboard:** ←/→ (wrapping), Escape, backdrop click, Tab kept inside (`lib/focus-trap.ts`, shared with the form dialogs), and focus returned to the thumbnail.

### J7. Shared server pipeline (`lib/server/`)

- **`form-route.ts`:** same-site Origin check (403), rate limit (429 + `Retry-After`), byte-limited JSON (413), honeypot (silent 200), validation (400), delivery (503 when not configured, 502 on upstream failure), and generic error bodies.
- **`deliver.ts`:** per-form webhook, or `FORMS_WEBHOOK_URL`, with an optional HMAC signature.
- **`store.ts`:** Upstash REST or a JSON file under `DATA_DIR`.
- **`rate-limit.ts`:** fixed windows (store-backed when configured; fails open).
- **`stripe.ts`, `donations.ts`:** Stripe adapter and donation status.
- **`services.ts`:** what is switched on, for the policy pages.

### J8. Privacy, cookies, analytics

- **Generated text:** `content/policies.ts` builds the notices from `configuredServices()`, covering each form and whether it is connected, what the site itself keeps, Stripe (only when donations are enabled), analytics (only when set), and choices and contact. The pages show "Draft notice, pending review by the club" and the update date until the record is marked verified.
- **Cookies:** the site sets none and uses no browser storage.
- **Analytics:** Plausible-compatible and cookieless, loaded after interaction only when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set. `track()` sends conversion events without personal data (Contact message, Newsletter signup, Membership request, Volunteer interest, RSVP, Donation checkout).
- **Share links:** plain URLs (Facebook, X, LinkedIn, WhatsApp, Email) plus Copy link. No third-party script loads before a click.
- **Social feed:** no social feed is embedded because no social accounts are approved. An approved one can be added to `/news` later without touching the homepage.

### J9. Club-editable content

Copy and media live in typed records with `status`/`provenance`/`review` (README → Editing content). New in this part:
- `content/history.ts`
- `content/impact.ts`
- `content/donations.ts`
- `content/involvement.ts`
- `content/policies.ts`
- `content/event-view.ts` (derived event facts)

`getReviewFlags()` includes them.

---

## Part K — Prompt 10: motion, mobile, accessibility, performance and QA

This is a repair and calibration pass, not a redesign. Results are in [docs/qa-report.md](qa-report.md).

### K1. Touch and phones

- **Touch targets:** `--touch` is 0 on fine pointers and 44px on coarse pointers. A zero-specificity rule in `styles/base.css` gives every standalone control a `min-height` of `var(--touch)`; buttons and tabs also get it as `min-width`. Components that draw a smaller control use `min-height: max(<drawn>, var(--touch))`. Desktop controls keep their drawn size, for example the 27px hero squares. Links inside running text are exempt.
- **Phone type:** `--fs-small` is 16px on phones in either orientation, so body text, secondary copy and form controls are 16px and mobile Safari does not zoom on focus.
- **Safe areas:** the viewport sets `viewport-fit=cover`. `--page-x` takes the larger of the gutter and the left/right insets. The hero control strip, mobile menu levels, lightbox and footer legal row add `env(safe-area-inset-bottom)`.
- **Events toolbar:** below 560px the tabs and the view switch sit on separate rows, so the layout no longer changes when the web font arrives (this removed a 0.083 CLS).

### K2. Loader and motion

- The loader's crest fades in by CSS from the first server-rendered paint, so first paint does not wait for JavaScript. GSAP still controls the exit.
- A failed font request no longer delays the reveal to the 4.5s failsafe: the 1.8s readiness cap applies.

### K3. Performance

- **Hydration:** homepage sections below the hero, and the footer/dialog host, sit in `<Suspense>` boundaries. React hydrates them in separate, interruptible chunks; the server HTML is unchanged and no fallback ever shows.
- **ScrollTrigger:** lives in `lib/scroll-trigger.ts` and is imported only by `Reveal` (homepage sections). Smooth scrolling reaches it through `scrollTriggerRef`.
- **Lenis:** loaded with a dynamic import only where it runs (desktop, fine pointer, motion allowed). Phones never download it.
- **Form dialogs:** their content mounts only while open, the form code is fetched on idle, and focus moves to the first field once it mounts.

### K4. SEO and structured data

- **`lib/seo.ts → pageMetadata()`:** each page gets a title, description, canonical URL and complete Open Graph/Twitter cards. Detail pages use their own record photograph.
- **Default preview image:** the authentic 1200×630 group-photo preview moved from a file convention (which would override every page) to `assets/media/og-default.jpg`.
- **Homepage Organization JSON-LD:** name, URL, crest, description, published email and phone, and the city. It has no street address and states no tax or nonprofit status.
- **Event JSON-LD:** only for non-archived events with a confirmed schedule (start/end in UTC, place, image, organizer).
- **Utility pages:** the donation status and search pages are `noindex`. Album titles read "…: photographs" so they differ from the matching event.

### K5. Analytics

Events are sent only after the corresponding real acknowledgement, without names, emails, amounts or identifiers:

- `Contact message`, `Newsletter signup`, `Membership request`, `Volunteer interest` and `RSVP`, after a 2xx from the form service.
- `Donation checkout`, after the provider session is created.
- `Donation confirmed`, after a signature-verified webhook marks the gift paid.

Analytics is cookieless, so no consent banner is required. It stays disabled unless configured.

---

## Part L — Route reveal, scroll motion and the About page (2026-10-16)

### L1. Route reveal (`components/motion/RouteTransition.tsx`)

Every client-side page change reuses the intro loader's three curtains. They are light (`--color-mist`, with the fine ⅓/⅔ rules), have no mark, and use no charcoal.

- They cover the new page before it paints, then lift left → middle → right: `yPercent -100`, 0.75s `power3.inOut`, 80ms stagger. Measured: fully clear in ≈0.9s.
- They sit below the header (the header stays put) and never take pointer events.
- They are skipped on the first load (the intro loader handles that) and under reduced motion.

### L2. Scroll motion (`components/motion/Reveal.tsx`)

`data-reveal` now selects the motion: `up` (default), `down`, `left`, `right`, `fade`, `scale` (from 96%), `mask` (clip-path wipe upward) and `mask-left`. Travel is set with `data-reveal-y` / `data-reveal-x`.

All variants run once, as elements cross 88% of the viewport, with a per-batch stagger. They are set up at idle; content already on screen is never hidden, and reduced motion shows everything immediately.

| Section | Motion |
| --- | --- |
| Mission | Label fades; paragraphs slide from the left; the President's video card wipes open. |
| Intro panels | The three panels rise in sequence. |
| Explore our causes | Heading slides from the left; arrows fade; cards slide in from the right in sequence; each photograph wipes open. |
| Culture | Heading slides from the left; the media wipes open left → right. |
| Editorial | Heading slides from the left; the image settles from 96%. |
| News & Events | Heading slides from the left; cards rise. |
| Contact band | The invitation slides from the left; the columns rise. |
| Footer | The six columns fade in. |
| About | Each block uses a different motion (see L3). |

### L3. About page (`app/about/page.tsx`, copy in `content/about.ts`)

Order and layout:

1. **Breadcrumb and title.** "Rooted in Lagos, / at home in Louisiana" at `clamp(2.75rem, 7.6vw, 9rem)`, weight 200.
2. **Film.** A full-bleed band of the aerial Louisiana footage (`AmbientVideo`: muted, plays only when visible, with a pause control), 62vh tall.
3. **Statement.** "About us" across ⅔, with a rule at ⅔.
4. **Story.** The 2018 club photograph across ⅔ with its caption; history notes bottom-aligned in the last third, with a "Read our history" link.
5. **Facts at a glance.** Label and heading in the first third; facts in two columns, with large Geologica 200 values and square-marked, underlined labels:
   - 6 areas of focus
   - 2 homes
   - 1974, the original Eko Club's founding (labelled as such)
   - 4 ways to take part
   
   The section ends with "Read our reports". Every figure is a fact, not an estimate.
6. **Two inset mist bands, in thirds.** Culture and Service: label and heading, then text and link, then a full-height photograph.
7. **Accent band** (`--color-accent-pale`, the stoles' gold). The six areas as a numbered, linked list.
8. **"Two homes, one community".** Intro text bottom-aligned in the first third, with Baton Rouge and Lagos cards (photo, title, line, outlined action).
9. **The shared contact band, then the footer.**

Phones stack every block in reading order. Bands become single columns, with the photograph shown 16:9.
