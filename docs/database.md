# Database, accounts and media

The site keeps its managed content in **MongoDB**, member and administrator logins in the same
database, uploaded photos and videos in **Cloudflare R2**, and sends account emails with **Sendridge**.
All keys are listed in `.env.example`.

Without `MONGODB_URI` the site runs on its built-in content (what you see on a fresh local checkout);
login, the member area and the admin dashboard then report that the database is not configured.

## Homepage content

The homepage hero slides, mission text and top-bar line are always the site's own content
(`content/hero.ts`, `content/site.ts`, `content/navigation.ts`). The admin dashboard still manages
events, gallery, executives, page images, contact details and the other sections.

## Collections

| Collection | Holds |
| --- | --- |
| `users` | logins: email, bcrypt password hash, role (`member` / `admin`), confirmation date |
| `auth_tokens` | one-time email confirmation and password-reset tokens (hashed, expire automatically) |
| `profiles` | member name and phone |
| `events`, `event_rsvps` | events and member responses |
| `event_categories`, `event_media` | event photo/video collections |
| `gallery_albums`, `gallery_photos` | gallery |
| `executives` | leadership page |
| `page_media` | replaceable homepage/about photographs |
| `hero_slides`, `site_settings` | dashboard-managed slides and club details |
| `contact_messages`, `newsletter_subscribers` | form submissions |

Every document keeps a string `id` (also its `_id`). Indexes are created by `scripts/seed-database.mjs`.

## Security

The browser never talks to the database. Everything goes through the site's API routes:

- `/api/auth/*`: sign in, sign up, confirm email, forgot/reset password, sign out, current user
- `/api/account/*`: the signed-in member's profile and RSVPs
- `/api/admin/*`: dashboard records, counts and upload URLs (administrators only)

Sessions are HTTP-only cookies signed with `AUTH_SECRET`. Admin writes only accept the fields each
dashboard section offers, validated on the server (`lib/server/admin-records.ts`).

## Making someone an administrator

In MongoDB Atlas → Browse Collections → `users`, set the person's `role` to `"admin"`.

## Cloudflare R2 setup

1. Create a bucket and turn on public access (r2.dev subdomain or a custom domain); that address is `R2_PUBLIC_URL`.
2. Create an API token with Object Read & Write for the bucket (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`).
3. Bucket → Settings → CORS policy, so the dashboard can upload directly:

```json
[{ "AllowedOrigins": ["https://ecl-project.vercel.app", "http://localhost:3000"], "AllowedMethods": ["PUT"], "AllowedHeaders": ["content-type"], "MaxAgeSeconds": 3600 }]
```

## Setting up a new database

Run once after creating the database (safe to repeat; it never overwrites existing records):

```bash
node --env-file=.env.local scripts/seed-database.mjs
```

It adds the club details, the leadership roster, the four event categories and the homepage/about
image spots, so each can be edited in the admin dashboard. Image spots start empty, which means the
site shows its own photographs until an administrator uploads a replacement.

`scripts/set-homepage-images.mjs` (needs the R2 keys) fills those image spots with the homepage
photographs, if you want them listed in the admin instead of empty.

## Account emails

Until `SENDRIDGE_API_KEY` and `EMAIL_FROM` are set, new sign-ups are confirmed straight away and
"forgot password" asks people to contact the club.
