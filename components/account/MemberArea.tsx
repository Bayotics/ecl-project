"use client";
import { MemberResponses } from "./MemberResponses";


import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import crest from "@/assets/media/ecl-crest.png";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

import styles from "./MemberArea.module.css";

export function MemberArea() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { let live = true; async function load() {
    try { const client = supabaseBrowser(); const { data: { user: currentUser } } = await client.auth.getUser();
      if (!currentUser) { window.location.assign(`/login?next=${encodeURIComponent("/member")}`); return; }
      const { data } = await client.from("profiles").select("*").eq("id", currentUser.id).maybeSingle();
      if (!live) return; setUser(currentUser); setProfile(data); setName(data?.full_name ?? currentUser.user_metadata.full_name ?? ""); setPhone(data?.phone ?? "");
    } catch { if (live) setNotice("We could not load your account. Please try again."); } finally { if (live) setLoading(false); }
  } void load(); return () => { live = false; }; }, []);
  async function save() { if (!user) return; setNotice(""); try { const { error } = await supabaseBrowser().from("profiles").update({ full_name: name.trim(), phone: phone.trim() }).eq("id", user.id); if (error) throw error; setNotice("Your member profile has been saved."); } catch (caught) { setNotice(caught instanceof Error ? caught.message : "Unable to save your profile."); } }
  async function signOut() { await supabaseBrowser().auth.signOut(); window.location.assign("/"); }
  if (loading) return <section className={styles.loading}>Loading your account…</section>;
  return <section className={styles.shell}><header className={styles.header}><Link href="/" className={styles.brand}><Image src={crest} alt="" width={42} height={42} /><span>Eko Club Louisiana</span></Link><button onClick={() => void signOut()} className={styles.textButton}>Sign out</button></header><div className={styles.content}><p className={styles.eyebrow}>Member area</p><h1>Your club account.</h1><p className={styles.lead}>Keep your details current and use your account when responding to club events.</p><div className={styles.grid}><section className={styles.panel}><h2>Profile</h2><label>Full name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label><label>Email address<input value={user?.email ?? ""} disabled /></label><label>Phone number<input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></label><button onClick={() => void save()} className={styles.primary}>Save profile</button>{notice ? <p className={styles.notice}>{notice}</p> : null}</section><aside className={styles.panel}><h2>Explore the club</h2><p>Discover what is coming up, revisit club moments, and keep in touch with Eko Club Louisiana.</p><nav className={styles.actions}><Link href="/events">Browse events</Link><Link href="/gallery">View the gallery</Link><Link href="/contact">Contact the club</Link></nav></aside></div><MemberResponses />{profile ? null : <p className={styles.note}>Complete your profile to make future event responses quicker.</p>}</div></section>;
}
