"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import crest from "@/assets/media/ecl-crest.png";
import { supabaseBrowser } from "@/lib/supabase/client";

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
type RawClient = { from: (table: string) => { select: (columns: string, options?: { count?: "exact"; head?: boolean }) => PromiseLike<{ count: number | null; error: { message: string } | null }> } };

function AdminHeader({ signOut }: { signOut: () => void }) { return <header className={styles.header}><Link href="/" className={styles.brand}><Image src={crest} alt="" width={38} height={38} /><span>Eko Club Louisiana</span></Link><button onClick={signOut}>Sign out</button></header>; }

export function AdminArea() {
  const [authorized, setAuthorized] = useState<boolean | null>(null); const [counts, setCounts] = useState<CountMap>({});
  useEffect(() => { let live = true; async function load() { try { const client = supabaseBrowser(); const { data: { user } } = await client.auth.getUser(); if (!user) { if (live) setAuthorized(false); return; } const { data: role } = await client.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(); if (role?.role !== "admin") { if (live) setAuthorized(false); return; } if (!live) return; setAuthorized(true); const raw = client as unknown as RawClient; const results = await Promise.all(SECTIONS.map(async ([table]) => { const result = await raw.from(table).select("id", { count: "exact", head: true }); return [table, result.count ?? 0] as const; })); if (live) setCounts(Object.fromEntries(results)); } catch { if (live) setAuthorized(false); } } void load(); return () => { live = false; }; }, []);
  async function signOut() { await supabaseBrowser().auth.signOut(); window.location.assign("/"); }
  if (authorized === null) return <section className={styles.notice}>Checking secure administrator access…</section>;
  if (!authorized) return <section className={styles.notice}><h1>Administrator access required</h1><p>Sign in with a club administrator account to manage this site.</p><Link href="/login?next=/admin">Sign in</Link></section>;
  return <section className={styles.shell}><AdminHeader signOut={() => void signOut()} /><div className={styles.content}><p className={styles.eyebrow}>Club administration</p><h1>Manage the club site.</h1><p className={styles.lead}>Content changes are protected by Supabase roles and publish controls. Draft records remain private until you make them live.</p><div className={styles.cards}>{SECTIONS.map(([key, title, description]) => <Link className={styles.card} key={key} href={`/admin/${key}`}><h2>{title}</h2><p>{description}</p><span className={styles.count}>{counts[key] ?? 0} records</span></Link>)}</div></div></section>;
}
