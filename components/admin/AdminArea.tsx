"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import crest from "@/assets/media/ecl-crest.png";
import { api, type Me } from "@/lib/api-client";

import styles from "./AdminArea.module.css";

const SECTIONS = [
  ["page_media", "Home & about images", "Replace the photographs used across the homepage and about page."],
  ["event_categories", "Event categories", "Manage Banquets, Oldies Social Night, Youth Outreach and new categories."],
  ["event_media", "Event photos & videos", "Upload and publish photos and videos under an event category."],
  ["executives", "Executives", "Manage current and past executives, portraits and presidential history."],
  ["site_settings", "Site settings", "Manage club contact information and mission copy."],
  ["profiles", "Members", "View member profiles and export the member directory."],
  ["event_rsvps", "Event responses", "Review and export member RSVPs."],
  ["hero_slides", "Hero slides", "Control the rotating homepage stories."],
  ["events", "Events", "Publish events, schedules and RSVP settings."],
  ["gallery_albums", "Gallery albums", "Organize photography collections."],
  ["gallery_photos", "Gallery photos", "Add images, captions and accessible alt text."],
  ["contact_messages", "Messages", "Review enquiries from the club website."],
  ["newsletter_subscribers", "Newsletter", "Manage club mailing-list subscribers."],
] as const;

type CountMap = Record<string, number | undefined>;

function AdminHeader({ signOut }: { signOut: () => void }) { return <header className={styles.header}><Link href="/" className={styles.brand}><Image src={crest} alt="" width={38} height={38} /><span>Eko Club Louisiana</span></Link><button onClick={signOut}>Sign out</button></header>; }

export function AdminArea() {
  const [authorized, setAuthorized] = useState<boolean | null>(null); const [counts, setCounts] = useState<CountMap>({});
  useEffect(() => { let live = true; async function load() { try { const { user } = await api<Me>("/api/auth/me"); if (user?.role !== "admin") { if (live) setAuthorized(false); return; } if (!live) return; setAuthorized(true); const { counts } = await api<{ counts: CountMap }>("/api/admin/counts"); if (live) setCounts(counts); } catch { if (live) setAuthorized(false); } } void load(); return () => { live = false; }; }, []);
  async function signOut() { await api("/api/auth/logout", { method: "POST" }).catch(() => undefined); window.location.assign("/"); }
  if (authorized === null) return <section className={styles.notice}>Checking secure administrator access…</section>;
  if (!authorized) return <section className={styles.notice}><h1>Administrator access required</h1><p>Sign in with a club administrator account to manage this site.</p><Link href="/login?next=/admin">Sign in</Link></section>;
  return <section className={styles.shell}><AdminHeader signOut={() => void signOut()} /><div className={styles.content}><p className={styles.eyebrow}>Club administration</p><h1>Manage the club site.</h1><p className={styles.lead}>Content changes are limited to administrator accounts and publish controls. Draft records remain private until you make them live.</p><div className={styles.cards}>{SECTIONS.map(([key, title, description]) => <Link className={styles.card} key={key} href={`/admin/${key}`}><h2>{title}</h2><p>{description}</p><span className={styles.count}>{counts[key] ?? 0} records</span></Link>)}</div></div></section>;
}
