# Media manifest

The code manifest is `content/media.ts`; this page is its human-readable companion.

Club photographs are described as the club. Supplied stock and Lagos photographs are described neutrally and are never captioned or labelled as Eko Club Louisiana members or events.

## Assets

| ID | File | Size | Source | Credit | Status |
| --- | --- | --- | --- | --- | --- |
| `eclGroup2018` | `assets/media/ecl-group-2018.jpg` | 979×606 | [ekoclublouisiana.org …/group-pic.png](https://ekoclublouisiana.org/wp-content/uploads/2021/08/group-pic.png), retrieved 2026-10-14 | Zion Photography (watermark) | Club photograph; review open |
| `eclCrest` | `assets/media/ecl-crest.png` | 238×239 PNG | [ekoclublouisiana.org …/eko-logob.png](https://ekoclublouisiana.org/wp-content/uploads/2021/04/eko-logob.png), retrieved 2026-10-14 | — | Club crest; review open |
| hero video | `public/media/hero-video.mp4` | 1280×720 H.264, 24.6s, 16.7 MB (has an unused audio track; plays muted) | Supplied 2026-10-15 (`new-media/hero-video.mp4`) | — | Aerial Louisiana footage; confirm source and rights |
| `heroVideoPoster` | `assets/media/hero-video-poster.jpg` | 1280×720 | Opening frame of the hero video, extracted for the poster and fallback | — | Derived |
| `lagosEyoFloat` | `assets/media/lagos-eyo-float.jpg` | 2048×1365 | Supplied (`eko-2.jpeg`) | Unknown | Lagos street festival; confirm photographer and rights |
| `lagosCarnival` | `assets/media/lagos-carnival.jpg` | 2048×1365 | Supplied (`eko-3.jpeg`) | Unknown | Lagos carnival; confirm photographer and rights |
| `eldersGathering` | `assets/media/elders-gathering.jpg` | 2400×1600 (from 2940) | Supplied Unsplash photo | Bunting Kargbo / Unsplash | Stock, not ECL |
| `celebrationGuests` | `assets/media/celebration-guests.jpg` | 2400×1600 (from 5472) | Supplied Unsplash photo | Jim Nyamao / Unsplash | Stock, not ECL |
| `asoOkeCouple` | `assets/media/aso-oke-couple.jpg` | 2400×1578 (from 3748) | Supplied Unsplash photo | Samson Ejim / Unsplash | Stock, not ECL |
| `communityDance` | `assets/media/community-dance.jpg` | 2400×1350 (from 4928) | Supplied Unsplash photo | Steward Masweneng / Unsplash | Stock, not ECL |
| `familyCelebration` | `assets/media/family-celebration.jpg` | 2400×1602 (from 6016) | Supplied Unsplash photo | Temitayo Olatoke / Unsplash | Stock, not ECL |
| `greetingCelebration` | `assets/media/greeting-celebration.jpg` | 2400×1602 (from 6016) | Supplied Unsplash photo | Temitayo Olatoke / Unsplash | Stock, not ECL |

The originals are kept in `assets/source/new-media/`. Photos were resized to a maximum of 2400px (JPEG q82); `next/image` serves AVIF/WebP at the widths each placement needs. The default social preview remains the 1200×630 crop of the club's group photograph (`assets/media/og-default.jpg`).

## Placements

| Placement | Asset |
| --- | --- |
| Hero 1 "A shared legacy" | Club footage on R2 `site-media/hero/club-hero-{720,1080,1440,2160}.mp4` (from `homepage-hero.MOV`, 4K 40 s; H.264 CRF 18, no audio). Each screen gets the smallest copy that is sharp on it and drops a size if playback stalls. `homeHeroThumbnail` shows until the footage plays, under reduced motion, on data-saver connections, and if the video fails. The About page still uses `hero-video.mp4` with `heroVideoPoster`. |
| Hero 2 "Community in action" | `communityDance` |
| Hero 3 "Build with us" (also the /get-involved intro) | `familyCelebration` |
| Homepage "Our impact" panel | `celebrationGuests` |
| Causes panel | `eldersGathering` |
| Cause cards and program pages | Youth Outreach `homeYouthOutreach` · Cultural Heritage `lagosEyoFloat` · Humanitarian Support `greetingCelebration` · Community Building `communityDance` · Health and Wellbeing `celebrationGuests` |
| Header Programs panel | `asoOkeCouple` |
| Culture feature (charcoal) | `lagosEyoFloat` |
| Editorial row "A community built together" | `lagosCarnival` |
| /programs intro | `communityDance` |
| /about intro, /about/history, the 2018 event, gallery album, news draft | `eclGroup2018` (genuinely the club) |
| 2021 convention archive | `eclCrest` |

## Outstanding

| Need | Why |
| --- | --- |
| Photographs of Eko Club Louisiana's own members, events and service | The supplied Unsplash photographs show other celebrations. They give the site variety, but the club should replace them over time, starting with the cause cards. |
| A smaller muted encode of the hero video (≤ 6 MB MP4, plus WebM) | 16.7 MB is heavy on phones. The player streams it and data-saver visitors get the poster, but a lighter file would start faster. |
| Culture feature video: 16:9 loop, 10–20s, muted, ≤ 8 MB | The design calls for moving footage; the Eyo float photograph stands in. |
| The group photograph's original high-resolution file, unwatermarked if licensed | The 979px file is upscaled in wide placements. |
| A vector (SVG/PDF) master of the crest | Only a 238px raster exists. |

## Open review items

- Confirm the source and usage rights of the hero footage and of `eko-2`/`eko-3`, and their photographer credits.
- Keep the Unsplash credits shown in the gallery and lightbox wherever these photos are captioned.
- Confirm usage rights and the credit line with Zion Photography.
- Confirm the date of the "Inauguration and ECI Quarterly Meeting" (the banner shows December 2018; the day is not legible).

## History page (supplied 2026-11-16, originals in public/media/history, git-ignored)

| Asset | File | Used on |
| --- | --- | --- |
| historyLagosIsland | assets/media/history/lagos-island.jpg (lagos-island.jpeg, 2048×1366, unchanged) | /about/history, "How it began" |
| historyDawodu | assets/media/history/olusesi-dawodu.jpg (Late-dawodu1.jpg, 230×285, unchanged; the page frame hides its 6px black border) | /about/history, portrait card of the late Olusesi Dawodu, founding president of Eko Club International |
| historyKeynotePoster | assets/media/history/keynote-poster.jpg (frame at 0:30 of the keynote) | /about/history, film poster |
| Keynote film | R2 `site-media/history/keynote-2009.mp4` (videoplayback (1).mp4 unchanged: 44 min, 480×360, 101 MB; upload with scripts/upload-history-video.mjs). Plays from 0:07.5, after the "Beginning of disc 2" title card. | /about/history, film |

The 10 Bishop Street section uses the existing oldies-night photograph (asoOkeCouple).
