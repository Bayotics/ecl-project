import Image, { type ImageProps } from "next/image";
import type { CSSProperties } from "react";

import type { ResolvedMedia } from "@/content/types";
import { cx } from "@/lib/cx";

import styles from "./MediaImage.module.css";

interface MediaImageProps extends Omit<ImageProps, "src" | "alt" | "fill" | "style" | "placeholder"> {
  media: ResolvedMedia;
  /** Empty alt when an adjacent title already names the content (e.g. linked cards). */
  decorative?: boolean;
}

/**
 * Renders a resolved media reference into a positioned frame: applies the record's focal point,
 * zoom and fit. Consumers scale on hover with `scale(calc(var(--zoom, 1) * 1.04))`.
 */
export function MediaImage({ media, decorative = false, className, quality = 90, unoptimized, ...rest }: MediaImageProps) {
  const style = {
    objectPosition: media.position,
    "--zoom": media.zoom,
    "--focal": media.position,
  } as CSSProperties;

  // Photos uploaded through the admin are shown exactly as uploaded: the original file, never
  // resized or re-encoded by the site.
  const uploaded = /^https?:\/\//.test(media.src.src);

  return (
    <Image
      src={media.src}
      alt={decorative ? "" : media.alt}
      fill
      quality={quality}
      unoptimized={uploaded || unoptimized}
      placeholder={media.src.blurDataURL ? "blur" : "empty"}
      className={cx(styles.image, media.fit === "contain" && styles.contain, className)}
      style={style}
      {...rest}
    />
  );
}
