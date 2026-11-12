import { searchIndex } from "@/content/search";
import { headerData, footerColumns } from "@/content/navigation";
import { settings as baseSite } from "@/content/site";
import { eventWhenLine } from "@/content/event-view";
import { resolveMedia } from "@/content/media";
import "server-only";
import { cache } from "react";
import { publicDatabase } from "./server";
import { publishedEvents as bundledEvents } from "@/content/event-view";
import { heroSlides } from "@/content/hero";
import { albums } from "@/content/gallery";
import { published } from "@/content/meta";
import type { EventRecord, GalleryAlbum, HeroSlide, MediaRef } from "@/content/types";
import type { Event } from "./types";

import { meta, mapEvent, managedMedia } from "./adapters";
// Once configured, Supabase is authoritative: empty/published=false must never resurrect bundled content.
export const publicEvents = cache(async (): Promise<EventRecord[]> => {
  const db = publicDatabase(); if (!db) return bundledEvents();
  const { data, error } = await db.from("events").select("*").eq("published", true).order("start_at");
  if (error) throw new Error("Unable to load club events.");
  return (data ?? []).map(mapEvent);
});
export async function publicEvent(slug: string) { return (await publicEvents()).find(e => e.slug === slug); }
export const publicSlides = cache(async (): Promise<HeroSlide[]> => {
  const db = publicDatabase(); if (!db) return published(heroSlides);
  const { data, error } = await db.from("hero_slides").select("*").eq("active", true).order("sort_order");
  if (error) throw new Error("Unable to load homepage slides.");
  return (data ?? []).map((row, index) => ({ ...meta, id: row.id, tab: row.title, eyebrow: "Eko Club Louisiana", headline: row.title,
    text: row.subtitle, cta: { label: row.cta_label, href: safeDestination(row.cta_url) }, media: index === 0 ? heroSlides[0].media : managedMedia(row.image_url, row.image_alt), video: index === 0 ? heroSlides[0].video : [] }));
});
function safeDestination(value: string) {
  return /^(\/[^/]|https:\/\/)/.test(value) ? value : "/";
}
export const publicAlbums = cache(async (): Promise<GalleryAlbum[]> => {
  const db = publicDatabase(); if (!db) return published(albums);
  const [albumResult, photoResult] = await Promise.all([
    db.from("gallery_albums").select("*").eq("published", true).order("sort_order"),
    db.from("gallery_photos").select("*").eq("published", true).order("sort_order")
  ]);
  if (albumResult.error || photoResult.error) throw new Error("Unable to load club photographs.");
  return (albumResult.data ?? []).map(row => ({ ...meta, slug: row.slug, title: row.title, excerpt: row.description,
    date: row.album_date ? { value: row.album_date, precision: "day" as const } : null,
    cover: managedMedia(row.image_url, row.title),
    photos: (photoResult.data ?? []).filter(p => p.album_id === row.id).map(p => ({ media: managedMedia(p.image_url, p.alt_text), caption: p.caption })) }));
});
export async function publicAlbum(slug: string) { return (await publicAlbums()).find(a => a.slug === slug); }

export const publicSettings = cache(async () => {
 const db=publicDatabase();if(!db)return null;
 const {data,error}=await db.from("site_settings").select("*").eq("id",1).maybeSingle();
 if(error)throw new Error("Unable to load club settings.");return data;
});
export const publicSearchIndex = cache(async () => {
 const [events,albums]=await Promise.all([publicEvents(),publicAlbums()]);
 return [...searchIndex().filter(e=>e.type!=="Event"&&e.type!=="Gallery"),
 ...events.map(e=>({type:"Event" as const,title:e.title,summary:e.excerpt,href:"/events/"+e.slug})),
 ...albums.map(a=>({type:"Gallery" as const,title:a.title,summary:a.excerpt,href:"/gallery/"+a.slug}))];
});
export async function publicNavigation() {
 const [events,index,config]=await Promise.all([publicEvents(),publicSearchIndex(),publicSettings()]);
 const site=config?{...baseSite,name:config.organization_name,contact:{email:config.email,phone:{display:config.phone,tel:config.phone.replace(/[^+0-9]/g,"")},location:config.address,streetAddress:config.address}}:baseSite;
 const social=config?[["Facebook",config.facebook_url],["Instagram",config.instagram_url],["YouTube",config.youtube_url]].filter(([,href])=>/^https:\/\//.test(href)).map(([label,href])=>({label,href})):headerData.menu.social.links;
 return {site,header:{...headerData,siteName:site.name,utility:{...headerData.utility,text:config?.tagline||headerData.utility.text,links:[...headerData.utility.links,{label:"Login",href:"/login"}]},
 events:{...headerData.events,cards:events.slice(0,3).map(e=>({kind:"event" as const,slug:e.slug,title:e.title,href:"/events/"+e.slug,meta:eventWhenLine(e),media:resolveMedia(e.media)}))},
 menu:{...headerData.menu,social:{...headerData.menu.social,links:social}},
 search:{...headerData.search,index}},
 columns:footerColumns.map((column,i)=>i===0?{...column,heading:site.name,links:[{label:site.contact.phone.display,href:"tel:"+site.contact.phone.tel},{label:site.contact.email,href:"mailto:"+site.contact.email}]}:i===1?{...column,lines:[site.contact.location]}:i===5?{...column,links:[...column.links.filter(l=>!l.href.startsWith("https://")),...social]}:column)};
}

// Before setup use the supplied roster; an intentionally empty table stays empty.
export const publicExecutives = cache(async () => {
  const { leadership, presidents } = await import("@/content/leadership");
  const fallback = () => [...leadership.map(person => ({...person, section: "current"})), ...presidents.map(person => ({...person, section: "presidents"}))];
  const db = publicDatabase();
  if (!db) return fallback();
  const { data, error } = await db.from("executives").select("*").eq("published", true).order("sort_order").order("name");
  if (error) {
    if (["PGRST205", "42P01"].includes(error.code)) return fallback();
    throw new Error("Unable to load club executives.");
  }
  return (data ?? []).map(row => ({...meta, slug:row.slug, name:row.name, role:row.role, term:row.term, bio:row.bio, section:row.section,
    media:row.image_url ? {...managedMedia(row.image_url,row.image_alt || row.name),fit:"contain" as const} : null}));
});
