import { CollectionMontage, type MontageItem } from "@/components/events/CollectionMontage";
import { Reveal } from "@/components/motion/Reveal";
import { LoadingImage } from "@/components/ui/LoadingImage";
import type { EventCategory, EventMedia } from "@/lib/db/types";
import styles from "./collections.module.css";

/** Files in the site's own R2 bucket can go through the image optimizer (sized copies from the CDN). */
const inBucket = (url: string) => Boolean(url && process.env.R2_PUBLIC_URL && url.startsWith(process.env.R2_PUBLIC_URL.replace(/\/$/, "") + "/"));

const toItem = (item: EventMedia): MontageItem => ({
  id: item.id,
  kind: item.media_type === "video" ? "video" : "image",
  src: (item.media_type === "image" && item.preview_url) || item.media_url,
  full: item.media_url,
  poster: item.poster_url || "",
  alt: item.alt_text || item.title,
  title: item.title,
  caption: item.caption || "",
  optimize: inBucket((item.media_type === "image" && item.preview_url) || item.media_url),
  optimizePoster: inBucket(item.poster_url),
});

/**
 * Event categories as cards, then each category with photos or videos as a five-item montage with a
 * "See all" viewer. Categories with nothing published yet keep their card ("Collection coming soon").
 */
export function EventCollections({ categories, media }: { categories: EventCategory[]; media: EventMedia[] }) {
  const collections = categories.map((category) => ({ category, items: media.filter((m) => m.category_id === category.id).map(toItem) }));
  const withMedia = collections.filter((c) => c.items.length);

  return (
    <section id="collections" className={styles.section} aria-labelledby="collections-title">
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Our community, in moments</p>
          <h2 id="collections-title">Explore our events</h2>
        </div>
        <p>Browse photographs and videos by category, or see what’s coming up in the calendar below.</p>
      </div>
      <div className={styles.categories}>
        {collections.map(({ category, items }, i) => {
          const cover = category.image_url || items.find((item) => item.kind === "image")?.src || "";
          const body = (
            <>
              {cover && (
                <div className={styles.cover}>
                  <LoadingImage src={cover} alt="" sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 25vw" quality={75} unoptimized={!inBucket(cover)} />
                </div>
              )}
              <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
              <h3>{category.title}</h3>
              {category.description && <p>{category.description}</p>}
              <span className={styles.categoryFooter}>
                {items.length ? `${items.length} ${items.length === 1 ? "moment" : "moments"}` : "Collection coming soon"}
                {items.length > 0 && <span aria-hidden="true">↓</span>}
              </span>
            </>
          );
          return items.length ? (
            <a key={category.id} href={`#collection-${category.slug}`} className={styles.category}>
              {body}
            </a>
          ) : (
            <div key={category.id} className={`${styles.category} ${styles.soon}`}>
              {body}
            </div>
          );
        })}
      </div>

      <div id="event-media" className={styles.collections}>
        {withMedia.length ? (
          withMedia.map(({ category, items }) => (
            <Reveal key={category.id} stagger={0.07}>
              <CollectionMontage id={category.slug} index={categories.indexOf(category)} title={category.title} description={category.description} items={items} />
            </Reveal>
          ))
        ) : (
          <div className={styles.empty}>
            <span aria-hidden="true">◇</span>
            <p>Photos and videos will appear here as the club publishes them.</p>
          </div>
        )}
      </div>
    </section>
  );
}
