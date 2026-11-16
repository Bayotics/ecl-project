"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type SyntheticEvent } from "react";

import { cx } from "@/lib/cx";

import styles from "./LoadingImage.module.css";

interface LoadingImageProps extends Omit<ImageProps, "fill"> {
  /** Extra class for the frame (the positioned box the image fills). */
  frameClassName?: string;
}

/**
 * A photo that fills its frame, with a spinner on the frame's colour until it arrives, then fades in.
 * Remote photos (event uploads in R2) go through the image optimizer, so each place gets a copy sized
 * for it, served from the CDN. If the optimizer fails (e.g. it times out fetching a photo the first
 * time), the photo itself is loaded instead, so a frame never stays empty.
 */
export function LoadingImage({ frameClassName, className, alt, onLoad, onError, unoptimized, ...props }: LoadingImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [direct, setDirect] = useState(false);
  const done = () => setLoaded(true);
  return (
    <span className={cx(styles.frame, frameClassName)} data-loaded={loaded || undefined}>
      <Image
        {...props}
        key={direct ? "direct" : "optimized"}
        alt={alt}
        unoptimized={unoptimized || direct}
        fill
        className={cx(styles.image, className)}
        onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
          done();
          onLoad?.(event);
        }}
        onError={(event: SyntheticEvent<HTMLImageElement>) => {
          if (!unoptimized && !direct) return setDirect(true);
          done();
          onError?.(event);
        }}
      />
    </span>
  );
}

/** The same loading frame for a video's first frame (used as its thumbnail). */
export function LoadingVideoThumb({ src, frameClassName }: { src: string; frameClassName?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={cx(styles.frame, frameClassName)} data-loaded={loaded || undefined}>
      <video src={`${src}#t=0.5`} preload="metadata" muted playsInline tabIndex={-1} aria-hidden="true" className={styles.image} onLoadedData={() => setLoaded(true)} onError={() => setLoaded(true)} />
    </span>
  );
}
