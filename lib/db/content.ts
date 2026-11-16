import { searchIndex } from "@/content/search";
import { headerData, footerColumns } from "@/content/navigation";
import { settings as baseSite } from "@/content/site";
import { eventWhenLine } from "@/content/event-view";
import { resolveMedia } from "@/content/media";
import "server-only";
import { cache } from "react";
import { isDatabaseConfigured, publicRows } from "./mongo";
import { publishedEvents as bundledEvents } from "@/content/event-view";
import { heroSlides } from "@/content/hero";
import { albums } from "@/content/gallery";
import { published } from "@/content/meta";
import type { EventRecord, GalleryAlbum, HeroSlide } from "@/content/types";
import type { PageMedia } from "./types";

import { meta, mapEvent, managedMedia } from "./adapters";
import { publicEventCollections } from "./event-collections";
import { featuredEventCollections } from "@/content/event-categories";
// Built-in history (content/events.ts, content/gallery.ts) is part of the site and always shows; records
// added in the admin appear alongside it, and a database record with the same slug replaces it.
export const publicEvents = cache(async (): Promise<EventRecord[]> => {
  if (!isDatabaseConfigured()) return bundledEvents();
  const managed = (await publicRows("events", { published: true }, { start_at: 1 })).map(mapEvent);
  return [...managed, ...bundledEvents().filter(event => !managed.some(m => m.slug === event.slug))];
});
export async function publicEvent(slug: string) { return (await publicEvents()).find(e => e.slug === slug); }
export const publicSlides = cache(async (): Promise<HeroSlide[]> => {
  if (!isDatabaseConfigured()) return published(heroSlides);
  return (await publicRows("hero_slides", { active: true })).filter(row => Boolean(row.image_url)).map((row, index) => ({ ...meta, id: row.id, tab: row.title, eyebrow: "Eko Club Louisiana", headline: row.title,
    text: row.subtitle, cta: { label: row.cta_label, href: safeDestination(row.cta_url) }, media: managedMedia(row.image_url, row.image_alt), video: index === 0 ? heroSlides[0].video : [] }));
});
export const publicPageMedia = cache(async (page: "home" | "about"): Promise<PageMedia[]> => {
  if (!isDatabaseConfigured()) return [];
  return (await publicRows("page_media", { page, active: true })).filter(row => Boolean(row.image_url));
});
function safeDestination(value: string) {
  return /^(\/[^/]|https:\/\/)/.test(value) ? value : "/";
}
export const publicAlbums = cache(async (): Promise<GalleryAlbum[]> => {
  if (!isDatabaseConfigured()) return published(albums);
  const [albumRows, photoRows] = await Promise.all([publicRows("gallery_albums", { published: true }), publicRows("gallery_photos", { published: true })]);
  const managed: GalleryAlbum[] = albumRows.map(row => ({ ...meta, slug: row.slug, title: row.title, excerpt: row.description,
    date: row.album_date ? { value: row.album_date, precision: "day" as const } : null,
    cover: managedMedia(row.image_url, row.title),
    photos: photoRows.filter(p => p.album_id === row.id).map(p => ({ media: managedMedia(p.image_url, p.alt_text), caption: p.caption })) }));
  return [...managed, ...published(albums).filter(album => !managed.some(m => m.slug === album.slug))];
});
export async function publicAlbum(slug: string) { return (await publicAlbums()).find(a => a.slug === slug); }

export const publicSettings = cache(async () => {
 if(!isDatabaseConfigured())return null;
 const [row]=await publicRows("site_settings",{id:1},{id:1});return row??null;
});
export const publicSearchIndex = cache(async () => {
 const [events,albums]=await Promise.all([publicEvents(),publicAlbums()]);
 return [...searchIndex().filter(e=>e.type!=="Event"&&e.type!=="Gallery"),
 ...events.map(e=>({type:"Event" as const,title:e.title,summary:e.excerpt,href:"/events/"+e.slug})),
 ...albums.map(a=>({type:"Gallery" as const,title:a.title,summary:a.excerpt,href:"/gallery/"+a.slug}))];
});
/** Header Events dropdown: the featured photo collections (content/event-categories.ts), each with its first photo. */
async function featuredCollectionCards() {
 const {categories,media}=await publicEventCollections();
 const base=(process.env.R2_PUBLIC_URL??"").replace(/[/]$/,"");
 return featuredEventCollections.flatMap(({slug,title,year})=>{
  const category=categories.find(c=>c.slug===slug);
  const items=category?media.filter(m=>m.category_id===category.id):[];
  if(!category||!items.length) return [];
  const photo=items.find(m=>m.media_type==="image");
  const src=category.image_url||(photo?photo.preview_url||photo.media_url:"");
  const photos=items.filter(m=>m.media_type==="image").length,videos=items.length-photos;
  const count=[photos&&`${photos} ${photos===1?"photo":"photos"}`,videos&&`${videos} ${videos===1?"video":"videos"}`].filter(Boolean).join(" · ");
  return [{kind:"event" as const,slug:`collection-${slug}`,title,href:`/events#collection-${slug}`,meta:`${year} · ${count}`,media:resolveMedia(managedMedia(src,`Photo from ${title}`)),cta:"See photos",optimize:Boolean(base&&src.startsWith(base+"/"))}];
 });
}

export async function publicNavigation() {
 const [events,index,config,featured]=await Promise.all([publicEvents(),publicSearchIndex(),publicSettings(),featuredCollectionCards()]);
 const site=config?{...baseSite,name:config.organization_name,contact:{email:config.email,phone:{display:config.phone,tel:config.phone.replace(/[^+0-9]/g,"")},location:config.address,streetAddress:config.address}}:baseSite;
 const social=config?[["Facebook",config.facebook_url],["Instagram",config.instagram_url],["YouTube",config.youtube_url]].filter(([,href])=>/^https:\/\//.test(href)).map(([label,href])=>({label,href})):headerData.menu.social.links;
 return {site,header:{...headerData,siteName:site.name,utility:{...headerData.utility,text:headerData.utility.text,links:[...headerData.utility.links,{label:"Login",href:"/login"}]},
 events:{...headerData.events,cards:featured.length?featured:events.slice(0,3).map(e=>({kind:"event" as const,slug:e.slug,title:e.title,href:"/events/"+e.slug,meta:eventWhenLine(e),media:resolveMedia(e.media)}))},
 menu:{...headerData.menu,social:{...headerData.menu.social,links:social}},
 search:{...headerData.search,index}},
 columns:footerColumns.map((column,i)=>i===0?{...column,heading:site.name,links:[{label:site.contact.phone.display,href:"tel:"+site.contact.phone.tel},{label:site.contact.email,href:"mailto:"+site.contact.email}]}:i===1?{...column,lines:[site.contact.location]}:i===5?{...column,links:[...column.links.filter(l=>!l.href.startsWith("https://")),...social]}:column)};
}

// Before setup use the supplied roster; an intentionally empty table stays empty.
export const publicExecutives = cache(async () => {
  const { leadership, presidents } = await import("@/content/leadership");
  const fallback = () => [...leadership.map(person => ({...person, section: "current"})), ...presidents.map(person => ({...person, section: "presidents"}))];
  if (!isDatabaseConfigured()) return fallback();
  return (await publicRows("executives", { published: true }, { sort_order: 1, name: 1 })).map(row => ({...meta, slug:row.slug, name:row.name, role:row.role, term:row.term, bio:row.bio, section:row.section,
    media:row.image_url ? {...managedMedia(row.image_url,row.image_alt || row.name),fit:"contain" as const} : null}));
});
