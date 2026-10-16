# Eko Club Louisiana — website

Next.js 16 (App Router) + TypeScript. Layout, states and motion follow [docs/ui-spec.md](docs/ui-spec.md); Part J covers the content pages and flows, and Part K the final calibration pass. Measured results, open items and configuration requirements are in [docs/qa-report.md](docs/qa-report.md).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server (Turbopack) on http://localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm run check` | Lint + typecheck |

Requires Node.js 20.9 or newer. Copy `.env.example` to `.env.local` (or set the same variables in the hosting dashboard) and redeploy after any change: the privacy and cookie pages are generated from what is configured.

## Editing content (club staff)

Everything visitors read lives in typed files under `content/`. Each record has a `status` (`"published"` or `"draft"`), a `provenance` (where the facts came from) and a `review` (open checks). Only published records appear anywhere: pages, menus, search and the sitemap. Change copy or photographs here; animation and layout code never needs to change.

| To change… | Edit | Notes |
| --- | --- | --- |
| Events | `content/events.ts` | Fill `schedule` only with a confirmed local date/time and its zone (`"America/Chicago"` for Louisiana, `"Africa/Lagos"` for Lagos). Set `rsvp` to open RSVPs. Events move to "Past" automatically. Never add unannounced or recurring meetings. |
| News | `content/news.ts` | Publish with a day-precision date. |
| Stories, volunteer highlights | `content/stories.ts` | `cause` links a story to its program page. |
| Figures and testimonials | `content/impact.ts` | Figures need `asOf` and `source`; testimonials need `consent: true`. |
| Officers | `content/leadership.ts` | Names, roles, terms, bios and photos from the club only. |
| Reports | `content/reports.ts` + `public/reports/` | The download appears only when the file exists. |
| Programs (six mission areas) | `content/causes.ts` | |
| History | `content/history.ts` | The original Eko Club and the Louisiana chapter are kept separate. |
| Photos and albums | `content/media.ts`, `content/gallery.ts` | Add the image under `assets/media/`, register it in `media.ts`, then reference it. |
| Donation amounts, monthly giving | `content/donations.ts` | The server rejects anything not listed here. |
| Join/volunteer wording | `content/involvement.ts` | No fees or acceptance criteria until the club supplies them. |
| Privacy and cookie text | `content/policies.ts` | Generated from the configured services; mark reviewed when the club approves. |

## Services

Every flow is built and works end to end; each one switches on when its configuration is present and says plainly when it is not.

| Service | Variables | Without it |
| --- | --- | --- |
| Form delivery (contact, newsletter, membership, volunteer, RSVP) | `FORMS_WEBHOOK_URL`, or per form `CONTACT_`/`NEWSLETTER_`/`MEMBERSHIP_`/`VOLUNTEER_`/`RSVP_WEBHOOK_URL`; optional `FORMS_WEBHOOK_SECRET` | The form shows the club email and phone instead of claiming success. |
| Data store (RSVP capacity and duplicates, donation status, shared rate limits) | `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Upstash Redis REST; for serverless hosting), or `DATA_DIR` (single Node server) | Donations stay unavailable; RSVPs with a capacity are refused rather than risk overbooking. |
| Donations (Stripe hosted Checkout) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; `DONATIONS_ALLOW_LIVE=true` for live keys | `/donate` explains that online giving is being set up and offers email and phone. |
| Analytics (cookieless, Plausible-compatible) | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, optional `NEXT_PUBLIC_PLAUSIBLE_SRC` | No analytics; the policies say so. |

A form submission counts as received only when the webhook answers 2xx. Signed bodies carry `X-ECL-Signature: sha256=<HMAC of the raw body>`. The site never stores names, emails or messages itself; the data store holds only counts, hashed RSVP emails, donation status and rate-limit counters.

**Stripe setup:** create a webhook endpoint at `https://<site>/api/donate/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`, and copy its signing secret into `STRIPE_WEBHOOK_SECRET`. Test in Stripe's sandbox with `sk_test_` keys and test cards only. A gift is shown as paid only after a verified webhook; the return URL proves nothing.

**Rate limits** use the first address in `X-Forwarded-For`. On Vercel the platform sets it. On your own server, make the reverse proxy overwrite it (for example nginx `proxy_set_header X-Forwarded-For $remote_addr;`).

## Publishing

1. **Host.** Import the repository into Vercel (framework preset: Next.js), or self-host with Node.js 20.9+:
   ```bash
   npm ci && npm run build && npm start
   ```
   When self-hosting, put it behind a reverse proxy that overwrites `X-Forwarded-For`.
2. **Configure.** Set the variables from `.env.example` in the host's environment settings: at minimum `NEXT_PUBLIC_SITE_URL`, the form webhook, the data store and, when the club is ready, Stripe. Redeploy after changes.
3. **Donations.** In Stripe, add the webhook endpoint `https://<site>/api/donate/webhook` (four `checkout.session.*` events; see Services). Test end to end with `sk_test_` keys and Stripe test cards. Switch to live keys, with `DONATIONS_ALLOW_LIVE=true`, only after the club approves.
4. **Domain.** Point `ekoclublouisiana.org` at the host, then check that `/history/`, `/contact-2/` and the old convention address redirect.
5. **After launch.**
   - Run PageSpeed Insights or `npx lighthouse https://<site>/ --form-factor=mobile` and record the real scores (the QA report gives lab estimates only).
   - Submit `https://<site>/sitemap.xml` in Google Search Console.
   - Work through `getReviewFlags()` in `content/review.ts`.

## Where things live

- `content/`: typed records and copy (see above). `content/review.ts → getReviewFlags()` lists every open check.
- `app/`: routes. `app/api/`: form, RSVP and donation handlers.
- `lib/server/`: server-only adapters: form delivery, data store, rate limiting, Stripe, donation status.
- `components/sections/`: homepage sections. `components/layout/`: header and footer. `components/forms/`, `components/donate/`, `components/events/`, `components/gallery/`: flow UI.
- `styles/tokens.css`: design tokens (Geologica, palette, fluid sizes calibrated at 1363px).
- `assets/source/`: original downloads, kept for provenance. `assets/media/`: optimized copies the site imports.
- `docs/media-manifest.md`: every image placement, its crop, and the media still needed.

## Before launch

`getReviewFlags()` in `content/review.ts` lists every open check, and `factualFlags` records what the site must not claim. In particular:

- **Services:** choose and configure the form service, data store and Stripe account (see Services). Until then those flows show their honest unavailable states.
- **Club decisions:** donation amounts and whether monthly giving is offered (`content/donations.ts`); membership fees or rules, if any; whether the club's tax status may be stated (it is not stated anywhere).
- **Policies:** the privacy and cookie notices are drafts generated from the configuration and are marked as drafts on the page. The club should review them and name its providers.
- **Street address:** two different addresses were published. The site shows "Baton Rouge, Louisiana" until the club confirms one.
- **Email:** the published email is `info@ekoclublouisiana.com` (.com). Confirm the inbox.
- **Media:** the hero plays the supplied aerial Louisiana video (`public/media/hero-video.mp4`, 16.7 MB; a smaller encode is recommended). Supplied Unsplash and Lagos festival photographs replace the recycled crops and are described neutrally, not as club members. Club photography should replace them over time. See `docs/media-manifest.md`, and confirm the rights for the video, `eko-2`/`eko-3` and the 2018 photograph.
- **Empty on purpose:** leadership, reports, stories, figures, testimonials, social links, the Louisiana chapter history and upcoming events. Pages state this plainly until club-supplied records are added. No social feed is shown because no accounts are approved.
- **Launch news item:** set its date and publish it in `content/news.ts`.
- **Old URLs:** `/history/`, `/contact-2/` and `/2021-eci-biennial-convention-coming-up-in-louisiana/` redirect permanently (see `next.config.ts`).
