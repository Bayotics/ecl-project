# QA report — Prompt 10

The site was checked against the written specification (Prompts 1–10 and [ui-spec.md](ui-spec.md)), using screenshots and scripted interactions of this site only. Every number below was measured. This report does **not** claim a fidelity percentage: passing checks show that the implementation meets the stated anchors and behaviours, nothing more.

- **Build:** Next.js 16.3.8 production build (`next build` + `next start`), React 19.2.8.
- **Static checks:** `npm run check` (ESLint 9 + `next typegen && tsc --noEmit`) passes with 0 errors and 0 warnings. `npm run build` succeeds: 45 prerendered pages plus the dynamic routes.
- **Test environment:** headless Chrome (Puppeteer) on Windows 10. The scripted suites are listed under "How the checks were run".
- **External services:** none were contacted. Forms, RSVP and donations were exercised against a local form-webhook mock and a local Stripe-shaped mock, with temporary test records that were removed afterwards. No real form or payment was submitted.

## Summary

| Suite | Result |
| --- | --- |
| Desktop calibration at 1363px | **26 / 26 pass** |
| Mandatory interactions (loader, header and menus, hero, panels, carousel, back to top, stress, resize, history) | **59 / 59 pass** (re-run 2026-10-16 with the supplied hero video) |
| Responsive: 360, 390, 768, 1024, 1366, 1440, 1920 and phone landscape (844×390), 15 routes each | **34 / 34 pass** |
| Accessibility: 28 routes, plus skip link, focus visibility, reduced motion and no-JavaScript | **38 / 38 pass** |
| SEO and crawl: metadata on every sitemap URL, structured data, robots, sitemap, 404, internal links, console errors | **All SEO and crawl checks pass.** Only the performance-target rows in the same suite fail (see Performance). |
| Server validation, RSVP, membership and volunteer, donations, analytics (sandbox mocks) | **All flows pass**. See [Sandbox flows](#sandbox-flows). |
| Performance (lab, Lighthouse-like mobile throttling) | LCP and CLS meet "good" on every page measured. Total blocking time is above target: 572ms (median) on the homepage, 318–412ms on inner pages. See [Performance](#performance). |

## Desktop calibration (1363px window; 1348px content width after the 15px scrollbar gutter)

| Anchor | Specified | Measured | Result |
| --- | --- | --- | --- |
| Surfaces | #EEEEEB / #1B1A14 / #E0E0DE / #FAFAF8 | Identical token values; page background rgb(238,238,235) | Pass |
| Heading weight and family | Geologica 200 | Geologica 200 (hero, section headings) | Pass |
| Navigation and copy weight | 300 | 300 / 300 | Pass |
| Gutter | ≈28.4px | 28.4px | Pass |
| Hero headline | ≈113.6px | 113.58px | Pass |
| Section headings | ≈28.4px | 28.4px (causes, news, editorial, culture, intro) | Pass |
| Main navigation height | ≈73.5px | 73.5px | Pass |
| Utility strip | ≈27px | 27px | Pass |
| Full Menu columns | 50 / 25 / 25 | 674 / 337 / 337px | Pass |
| Structural rules | ⅓ and ⅔ | 449.3 / 898.7px on every ruled section | Pass |
| Interactive panels | ≈426 / 454 / 426 × 409 | 421 / 449 / 421 × 409 (same ratios at the 1348px content width) | Pass |
| Carousel | ≈3 full images + partial next | 3 full + 1 partial | Pass |
| Charcoal feature | ≈650px high; media ≈852×479 | 644px; 842×474 | Pass |
| Editorial image | near-square | 393×412 | Pass |
| News | 3 items across the right ⅔, ≈500px | 3 items aligned on one baseline from the ⅓ line; 500px | Pass |
| Contact band | ≈325px on #E0E0DE | 325px | Pass |
| Footer | logo strip, 6 columns, tiny legal row | 110px strip, 6 columns, 11px legal row | Pass |

## Homepage state matrix

| Area | State or behaviour checked | Result |
| --- | --- | --- |
| Loader | Centre crest resolves (now painted by CSS from the first server render) | Pass |
| | Three curtains lift upward, left → middle → right. Earlier run: first movement at 7346 / 7445 / 7546ms; the final run sampled all three in the same 40ms window. | Pass |
| | Curtains fully clear; header and copy usable; page scrolls; no errors | Pass |
| | Every image, font and media request aborted: page still unlocks, in 2.7s (was 6.0s before the font-failure fix) | Pass |
| | Reduced motion: no loader wait, no smooth-scroll engine | Pass |
| Header | Transparent hero theme → solid light theme after the hero → transparent again at the top | Pass |
| | Programs (image + list), Events (preview cards), Menu (50/25/25), Search: distinct panels | Pass |
| | Backdrop dims and blurs while open, then fully reverses (opacity 0, hidden) | Pass |
| | Hamburger ↔ close X | Pass |
| | Only one overlay at a time, including fast switching across five overlays | Pass |
| | Escape closes; focus returns to the trigger; page scroll locked while open and position kept | Pass |
| | Rapid toggling (9× and 16×) settles consistently, with no invisible layer intercepting clicks | Pass |
| | Hover open, exit and re-entry within the grace period, leave-to-close | Pass |
| | Keyboard: Enter opens, ↓ enters the panel, Esc restores; Tab stays in the header and open Menu | Pass |
| | A form dialog opened while a menu is open closes the menu first (Prompt 8, re-run in the sandbox) | Pass |
| Hero | Tabs, copy, image and CTA stay in sync on all three slides | Pass |
| | Next wraps 3 → 1; Previous wraps 1 → 3; ←/→ on the tabs moves selection and focus | Pass |
| | Slide 1 footage (supplied aerial Louisiana montage) plays under the unchanged "A shared legacy" copy | Pass |
| | Pause / play control | Pass |
| | Footage request fails → poster photograph (opening frame), no dead control | Pass |
| | Down-arrow lands the mission just below the bar | Pass |
| Panels | At rest: title high, image lower-right | Pass |
| | Activated: image removed, content revealed, title at the bottom; leaving restores the rest state | Pass |
| | Hidden links cannot be activated (inert); revealed links work | Pass |
| | Keyboard Enter / Escape; tap opens and closes on touch | Pass |
| Carousel | Starts with Previous disabled; arrows advance one finite track; Next disabled at the end | Pass |
| | Momentum drag moves the track and springs back at the edges; buttons match the settled position | Pass |
| | Releasing a drag does not navigate; a plain click does | Pass |
| | Phone: peeking next card; vertical swipe scrolls the page; horizontal swipe moves the track | Pass |
| Charcoal feature | 644px, 16:9 media slot, poster photograph (no footage supplied) | Pass (footage outstanding) |
| Editorial row | Near-square image; on phones stacks heading → copy → image | Pass |
| News & Events | 3 columns, 3:2 images, honest "no further updates" third card | Pass |
| Contact band | 325px; Contact and Newsletter open dialogs with page fallbacks | Pass |
| Footer | 110px logo strip, 6 ruled columns, legal row; phones show 2 columns | Pass |
| Back to top | 1058ms travel, soft ease; hero header restored; focus to `#top`; no loader; slides still work afterwards; immediate under reduced motion | Pass |
| Stress | Resize desktop ↔ phone with Menu open: no stuck overlay or inert page | Pass |
| | Browser back/forward: home returns without replaying the loader | Pass |
| | Zero console or page errors through the whole interaction session | Pass |

## Responsive

All 15 routes were checked at each width (homepage, events list and calendar, donate, join, volunteer, contact, about, history, a program page, gallery album, reports, impact, news, privacy).

| Check | 360 | 390 | 768 | 1024 | 1366 | 1440 | 1920 | Landscape 844×390 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| No horizontal page overflow | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Donate visible in the header | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Body and form text ≥16px | Pass | Pass | n/a (tablet) | — | — | — | — | Pass |
| Touch targets ≥44px tall (≥24px wide for text links) | Pass | Pass | Pass | — | — | — | — | Pass |

### Defects found and fixed in this pass

1. **14px secondary text and filter selects on phones.** `--fs-small` is now 16px on phones in both orientations.
2. **Touch targets of 22–40px** (hero arrows and tabs, panel toggles, brand, Donate, Menu, footer, legal, event filters, share links, calendar links). Fixed with a zero-specificity rule tied to a `--touch` token: coarse pointers only, so desktop squares keep their drawn size.
3. **No safe-area handling.** Added `viewport-fit=cover`, inset-aware gutters, and bottom insets for the hero strip, mobile menu, lightbox and legal row.
4. **0.083 CLS on /events at phone width.** The toolbar re-wrapped when the web font arrived. Tabs and the view switch now sit on fixed rows below 560px.

The two remaining harness exceptions follow WCAG 2.5.8:
- Inline card-title links whose card also has a large link to the same page.
- Stretched links whose `::after` covers the whole row.

## Accessibility

| Check | Result |
| --- | --- |
| One `<main>`, header, footer; every `<nav>` uniquely labelled | Pass (28 routes) |
| One `h1` per page; no skipped heading levels | Pass |
| Every image has alt text; empty alt only where an adjacent title or link names it | Pass |
| Accessible names on every link, button, tab and disclosure; labels on every field | Pass |
| Text contrast ≥ 4.5:1 (≥ 3:1 for large text) against solid backgrounds; 35–84 text nodes per page | Pass. Hero copy sits on a dark gradient scrim over the photograph and was not computed pixel-by-pixel. |
| Skip link is the first Tab stop, visible on focus, moves focus to `<main>` | Pass |
| Visible focus on 60 consecutive Tab stops (homepage, events, join, donate, gallery album) | Pass |
| Modal focus containment and restoration (form dialogs, lightbox) | Pass (Prompts 8–9, re-run) |
| Validation messages tied to fields; status messages in live regions | Pass (Prompts 8–9) |
| Reduced motion: all copy visible without scrolling; back to top immediate; same actions available | Pass |
| JavaScript disabled: loader hidden; no essential text left hidden | Pass |

## SEO and crawl

| Check | Result |
| --- | --- |
| Every sitemap URL (29) plus detail pages: unique title, description, canonical, `og:title/url/image`, `twitter:card=summary_large_image`, `lang=en` | Pass |
| Social preview images | Default is the authentic 1200×630 group-photo crop. Detail pages use their own record photograph. |
| Organization JSON-LD on the homepage | Pass. No street address, and no tax, 501(c)(3) or nonprofit-status claim anywhere in the HTML. |
| Event JSON-LD | Only for events with a confirmed date and time; the archived 2021 record has none | Pass (scheduled events verified in the sandbox) |
| `robots.txt` | Allows the site; disallows `/api/` and `/search`; names the sitemap |
| Sitemap | Lists every main route; excludes `/api`, `/search` and `/donate/thank-you` |
| Legacy redirects | `/history/`, `/contact-2/` and `/2021-eci-biennial-convention-coming-up-in-louisiana/` all redirect permanently (Prompt 9, re-run) |
| Unknown URL | 404 with `noindex` |
| Internal links | Every internal link target found on every crawled page returns 200 |
| Console errors, failed requests, broken images | None on any crawled page |

## Performance

### Lab conditions

- Headless Chrome on the development machine. The emulation approximates Lighthouse's mobile profile: 412×823 viewport, DPR 1.75, 150ms round-trip time, 1.6 Mbps down / 750 kbps up, 4× CPU slowdown, cache disabled, warm server connection.
- Each page was measured 5 times; medians are reported.
- **Lighthouse itself was not run.** It is not installed in this project, and I did not add new tooling. Other Node servers were running on the same machine (ports 3000 and 3010), so individual runs vary.
- Field data (real Core Web Vitals) requires a deployment.

| Page | FCP | LCP (element) | CLS | TBT | Estimated Lighthouse-equivalent score* |
| --- | --- | --- | --- | --- | --- |
| `/` mobile | 1.87s (1.72s with the hero video, 2026-10-16) | 1.87s (hero headline) | 0 | 572ms (493ms with the video build) | ≈82 |
| `/about` mobile | 1.38s | 1.38s (photo) | 0 | 318ms | ≈92 |
| `/events` mobile | 1.44s | 1.44s (h1) | 0 | 348ms | ≈91 |
| `/donate` mobile | 1.51s | 1.51s | 0 | 412ms | ≈88 |
| `/` desktop (unthrottled) | 0.40s | 0.40s (hero photo) | 0.005 | 22ms | — |

\* Computed by me from these metrics using Lighthouse's published mobile scoring curves (FCP 10%, LCP 25%, TBT 30%, CLS 25%; Speed Index excluded and re-weighted). It is an estimate, not a Lighthouse result. After deployment, run `npx lighthouse https://<site>/ --preset=perf --form-factor=mobile` (or PageSpeed Insights) to get the real number.

**Against the goals:**
- LCP ≤ 2.5s and CLS ≤ 0.1 are met on every measured page, mobile and desktop.
- Mobile TBT is above the ≈200ms that a 90+ score needs. The homepage is about 82 and inner pages about 88–92 (estimated).
- The remaining blocking work is mainly framework start-up and hydration, plus parsing and styling the first document. These are about 0.4 MB of decoded JavaScript shared by every page and about 160KB of homepage HTML, including the hydration payload.
- Interaction latency after load is ≈24ms for clicks. The first pointer movement during post-load idle work occasionally measured 376–640ms in lab runs; it was not reproducible once the page settled.

### Improvements made in this pass

| Change | Effect (lab, median) |
| --- | --- |
| Loader crest painted by CSS from the first server render (no wait for JavaScript) | Homepage FCP no longer waits for hydration |
| Font-load failure treated as ready | Missing-media unlock: 6.0s → 2.7s |
| `<Suspense>` boundaries split homepage hydration into chunks | Long tasks broken up |
| ScrollTrigger only where scroll reveals are used; Lenis loaded only on desktop fine-pointer devices; dialog forms loaded on idle and mounted only when open | Smaller shared bundle; phones never download Lenis |
| Scroll-reveal setup deferred to browser idle time | Homepage mobile TBT 785ms → 572ms |
| /events toolbar fixed rows on phones | CLS 0.083 → 0 |

**Still to do for a 90+ homepage score:** reduce what hydrates on first load, for example rendering the header's closed panels (Programs, Events, Menu, Search, mobile sheet) only on first open. That would change the overlay motion code, so it is left as the recommended next step rather than done hastily at the end of this pass.

### Image and font handling (verified)

- The hero's first image is eager with high fetch priority; other slides and below-the-fold images are lazy.
- `next/image` serves responsive sizes in AVIF/WebP at q75; focal point and zoom are applied by CSS.
- Geologica is self-hosted through `next/font` (25KB).
- There is no video (no footage supplied). The video components only load when visible and pause off screen (Prompts 4 and 7).

## Analytics

| Requirement | Implementation | Result |
| --- | --- | --- |
| Page views | Plausible-compatible script, cookieless; loads after the page is interactive and only when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set | Pass: script present in the sandbox build, absent otherwise |
| Conversion events only after real acknowledgement | `Contact message`, `Newsletter signup`, `Membership request`, `Volunteer interest` and `RSVP` after a 2xx from the form service; `Donation checkout` after the provider session exists; `Donation confirmed` after a signature-verified webhook | Pass (sandbox) |
| No personal or payment data | Events carry only the name and, for donations, the frequency; no names, emails, amounts or IDs | Pass (sandbox) |
| Consent model | Cookieless analytics, so no consent banner is needed. The privacy and cookie notices are generated from the configuration and say whether analytics is on. | Pass |

<a id="sandbox-flows"></a>

## Sandbox flows (mocked external services)

The sandbox build pointed every service at local mocks: a form webhook receiver and a Stripe-shaped Checkout API that checks `sk_test_` keys, honours `Idempotency-Key` and signs webhooks with the endpoint secret. It used a file data store and temporary test records (scheduled Louisiana and Lagos events, a news item, stories, a figure, testimonials, an officer, reports and a three-photo album). All test records were removed afterwards and the clean build re-run.

| Flow | Checks | Result |
| --- | --- | --- |
| Time zones | 16 Jan 2027 18:00 Central → **CST**, `.ics` DTSTART 00:00Z next day; 10 Jul 2027 12:00 → **CDT**, 17:00Z; past 14 Mar 2026 shown as **CDT**; Lagos 5 Dec 2026 16:00 → **WAT**, 15:00Z | Pass |
| Event list and calendar | Upcoming soonest first, past newest first; category filter; month grid with Previous/Next; dates without a confirmed day listed under the grid | Pass |
| Event detail | Confirmed date, time and zone, location, status; `.ics` only when scheduled and upcoming; RSVP closed and "event ended" states | Pass |
| Event JSON-LD | Scheduled Louisiana and Lagos events carry `startDate`/`endDate` (UTC) and `location`; the archived 2021 record carries none | Pass |
| RSVP | Validation and focus; confirmation with reference only after the webhook acknowledges (HMAC-signed body); duplicate email refused; over-capacity refused with the form kept; last place filled; closed and past refused (409); party size enforced (400); upstream failure keeps the data and the retry succeeds | Pass |
| Membership request | Stored by the receiving service as `status: "requested"` (never "approved"); the confirmation says membership is not yet confirmed | Pass |
| Volunteer | Upstream failure keeps every field; the retry succeeds | Pass |
| Spam and abuse protection | Cross-site Origin 403; oversized body 413; honeypot silently accepted; 6th contact submission in the window → 429 | Pass |
| Donation checkout | Idempotent retries return the same session; a changed amount gets a new one; hosted URL redirect; amount 3 or 50.5, currency `eur`, unknown designation or missing attempt id → 400; monthly → subscription only when approved | Pass |
| Donation webhook | Wrong secret, stale timestamp and unsigned bodies → 400; replayed event deduplicated; `paid` is final (a late `expired` cannot undo it); unpaid completion → `processing`; async failure → `failed` | Pass |
| Thank-you page | "Confirming…" before the webhook; "$50.00 is confirmed" only after it; failed, expired, unknown and canceled states | Pass |
| Gallery lightbox | Photo n of 3; ←/→ with wrap-around; Next button; captions and credit; Tab kept inside; focus returned to the thumbnail | Pass |
| Content pages with records | Figures with date and source; consented testimonials only (the non-consented one hidden); stories on program pages; officer card; report download "PDF · 24 KB" only when the file exists ("available on request" otherwise); dated news with share links | Pass |
| Privacy policy | Text switches to describe Stripe when donations are configured | Pass |
| Search privacy | Searching for submitted email addresses returns nothing | Pass |
| Analytics | No event when the service fails; `Volunteer interest` after acknowledgement with no properties; `Donation confirmed` only after the verified webhook, with `{frequency}` only (no amount or IDs); `RSVP` after confirmation | Pass |

## The club's twelve improvement requirements

| # | Requirement | Where | Status |
| --- | --- | --- | --- |
| 1 | Clear mission | Hero slide 1, mission section, /about (mission, who we serve) | **Pass** (copy flagged for club approval) |
| 2 | Simple navigation | Four-item header + Donate, three distinct menus, search, six-column footer, mobile sheet | **Pass** |
| 3 | Visible secure donations | Donate in the header on every page and width; hosted Stripe Checkout; server validation; idempotency; signed webhooks; pending, canceled, failed and verified states | **Pass in sandbox.** Live use needs Stripe credentials and a data store. |
| 4 | Responsive mobile UX | 8 viewports; tap-driven panels and menus; 44px targets; 16px text; safe areas | **Pass** |
| 5 | Real club visuals | One authentic photograph and the crest, cropped per placement | **Partial: media outstanding** (see below) |
| 6 | Impact and storytelling | /impact, /impact/[slug], stories on program pages, sourced figures, consented testimonials | **Built; content outstanding** (honest empty states) |
| 7 | Events and calendar | /events with upcoming/past, category/year filters, list and calendar, Central/Lagos time with DST, .ics, RSVP | **Pass** (no upcoming events announced yet) |
| 8 | Newsletter signup | Contact band, dialog, /contact; explicit consent; success only on acknowledgement | **Built; needs `NEWSLETTER_WEBHOOK_URL`** |
| 9 | Social links and sharing | Share links on news, events and stories; social accounts appear automatically once approved | **Sharing pass; accounts outstanding** |
| 10 | Leadership and financial transparency | /about/leadership, /reports (period, description, download only if the file exists) | **Built; content outstanding** |
| 11 | Speed and accessibility | See Accessibility and Performance | **Accessibility pass. Speed: LCP and CLS pass; mobile TBT above target.** |
| 12 | Analytics | Cookieless page views plus acknowledged conversion events | **Built; needs `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`** |

## Unresolved authentic media and content

Nothing below has been invented to fill a gap. Each area shows an honest state until the club supplies the item.

| Item | Where it shows | Current state |
| --- | --- | --- |
| Smaller hero video encode (≤6 MB muted MP4, plus WebM) | Hero | The supplied 16.7 MB file plays. It streams (metadata-only preload), the poster is preloaded, and data-saver visitors get the poster only. |
| Culture feature footage (16:9 loop, 10–20s, ≤8 MB) | Charcoal feature | The photograph is shown, with no dead play control. |
| Club photography of members and events | Hero 2–3, panels, cause cards, editorial row | Supplied Unsplash and Lagos festival photographs are used and described neutrally (not as ECL members). Replace with club photos over time; see docs/media-manifest.md. |
| Original high-resolution group photograph, plus Zion Photography usage rights and credit | Site-wide | The 979px file is upscaled in wide placements. |
| Vector crest (SVG/PDF) | Header, footer, loader | 238px raster only. |
| Officers: names, roles, terms, photographs, bios | /about/leadership | A plain notice is shown. |
| Governance, financial and impact reports (files) | /reports | An empty state is shown. A download appears only when a file exists. |
| Confirmed impact figures (with date and source), stories, volunteer highlights, approved testimonials | /impact, program pages | Not published. Unknown numbers stay unpublished. |
| Louisiana chapter history | /about/history | Marked "being written". The original Eko Club's 1974/1975 dates are kept separate. |
| Upcoming events (confirmed date, time, venue) | /events, header Events panel, homepage | A truthful "none announced yet" state is shown. The 2018 and 2021 records are archived. |
| Approved social accounts | Footer, menu, Organization `sameAs` | None are listed, and no social feed is embedded. |
| Street address (two conflicting published addresses) | Contact, structured data | "Baton Rouge, Louisiana" only. |
| Launch news item (date and approval) | /news | Draft, not published. |
| Club approval of drafted copy: program explanations, "Who we serve", contact paragraph, privacy and cookie notices, donation amounts | Various | Flagged in `content/review.ts → getReviewFlags()`. The policy pages say they are drafts. |
| Tax status | Nowhere | Not stated anywhere, including structured data. |

## Configuration required to switch on each service

All variables are listed in `.env.example`. Redeploy after any change, because the policy pages describe what is configured.

| Service | Variables | Unconfigured behaviour (verified) |
| --- | --- | --- |
| Canonical origin | `NEXT_PUBLIC_SITE_URL` | Defaults to https://ekoclublouisiana.org |
| Form delivery (contact, newsletter, membership, volunteer, RSVP) | `FORMS_WEBHOOK_URL`, or per-form `CONTACT_`/`NEWSLETTER_`/`MEMBERSHIP_`/`VOLUNTEER_`/`RSVP_WEBHOOK_URL`; optional `FORMS_WEBHOOK_SECRET` (HMAC-SHA256 signature) | API returns 503. The form keeps the visitor's data and offers the club email and phone. Analytics receives nothing. |
| Data store (RSVP capacity and duplicates, donation status, shared rate limits) | `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Upstash REST, for serverless), or `DATA_DIR` (single Node server) | Donations stay unavailable. RSVPs for events with a capacity are refused. Rate limits fall back to per-instance memory. |
| Stripe hosted Checkout | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; `DONATIONS_ALLOW_LIVE=true` only when going live | /donate explains that online giving is being set up and offers email and phone. Live keys are refused without the flag. |
| Stripe webhook endpoint | `https://<site>/api/donate/webhook`, events `checkout.session.completed`, `.async_payment_succeeded`, `.async_payment_failed`, `.expired` | Without it, gifts remain "Confirming…" and are never marked paid. |
| Analytics (cookieless, Plausible-compatible) | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, optional `NEXT_PUBLIC_PLAUSIBLE_SRC` | No script loads, and the policies say "no analytics". |
| Reverse proxy (self-hosting only) | Overwrite `X-Forwarded-For` with the client address | On Vercel the platform sets it. |

## How the checks were run

- The suites live in the session scratchpad, not the repository: `qa1-calibration`, `qa2-interactions`, `qa3-responsive`, `qa4-a11y`, `qa5-perf-seo`, `qa6-vitals-median`, `qa7-sandbox-extra`, plus the Prompt 9 `p9a`/`p9b` flows.
- They run against `next start`. They use Puppeteer from the sibling `eko-club-redesign` project; no dependency was added here.
- The sandbox mocks (`mock-services.mjs`) emulate a form webhook receiver and Stripe's Checkout Session and webhook-signature behaviour on 127.0.0.1. Test records were injected from a script and restored from backups afterwards.
