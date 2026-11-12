import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import { resolveMedia } from "@/content/media";
import { managedMedia } from "@/lib/supabase/adapters";
import type { EventCategory,EventMedia } from "@/lib/supabase/types";
import styles from "./collections.module.css";

export function EventCollections({categories,media,selected}:{categories:EventCategory[];media:EventMedia[];selected:string}) {
 const active=categories.find(c=>c.slug===selected);
 const items=active?media.filter(m=>m.category_id===active.id):media;
 return <section id="collections" className={styles.section} aria-labelledby="collections-title">
  <div className={styles.heading}><div><p className={styles.eyebrow}>Our community, in moments</p><h2 id="collections-title">Explore our events</h2></div><p>Browse photographs and videos by category, or see what’s coming up in the calendar below.</p></div>
  <div className={styles.categories}>{categories.map((category,i)=>{
   const count=media.filter(m=>m.category_id===category.id).length;
   return <Link key={category.id} href={`/events?collection=${encodeURIComponent(category.slug)}#event-media`} className={`${styles.category} ${active?.id===category.id?styles.active:""}`} aria-current={active?.id===category.id?"true":undefined}>
    {category.image_url && <div className={styles.cover}><MediaImage media={resolveMedia(managedMedia(category.image_url,category.title))} sizes="(max-width: 700px) 90vw, 25vw" /></div>}
    <span className={styles.number}>{String(i+1).padStart(2,"0")}</span><h3>{category.title}</h3>
    {category.description && <p>{category.description}</p>}
    <span className={styles.categoryFooter}>{count ? `${count} ${count===1?"moment":"moments"}` : "Collection coming soon"}<span aria-hidden="true">↗</span></span>
   </Link>;
  })}</div>
  <div id="event-media" className={styles.collectionHeader}><h3>{active?active.title:"All photos & videos"}</h3>{active && <Link href="/events#event-media">View all categories</Link>}</div>
  {items.length ? <div className={styles.mediaGrid}>{items.map(item=><figure key={item.id} className={styles.mediaCard}>
    <div className={styles.mediaFrame}>{item.media_type==="video" ? <video controls playsInline preload="none" poster={item.poster_url||undefined} aria-label={item.alt_text||item.title}><source src={item.media_url}/>Your browser does not support this video. <a href={item.media_url}>Open video</a></video> : <MediaImage media={resolveMedia(managedMedia(item.media_url,item.alt_text||item.title))} sizes="(max-width: 700px) 90vw, 45vw" loading="lazy"/>}</div>
    <figcaption><span className={styles.eyebrow}>{categories.find(c=>c.id===item.category_id)?.title} · {item.media_type==="video"?"Video":"Photo"}</span><h4>{item.title}</h4>{item.caption && <p>{item.caption}</p>}</figcaption>
  </figure>)}</div> : <div className={styles.empty}><span aria-hidden="true">◇</span><p>{active?`${active.title} photos and videos will appear here as they are published.`:"Photos and videos will appear here as the club publishes them."}</p></div>}
 </section>;
}
