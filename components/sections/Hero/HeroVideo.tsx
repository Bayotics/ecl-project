"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { preload } from "react-dom";

import type { ResolvedMedia, VideoSource } from "@/content/types";
import { MediaImage } from "@/components/ui/MediaImage";
import { useAfterLoad } from "@/lib/use-after-load";

import styles from "./Hero.module.css";

export type VideoStatus = "playing" | "paused" | "failed";

interface HeroVideoProps {
  sources: VideoSource[];
  poster: ResolvedMedia;
  /** Active slide, hero on screen, tab visible, and allowed by the visitor's choice / motion setting. */
  shouldPlay: boolean;
  onStatus: (status: VideoStatus) => void;
  eager: boolean;
}

/**
 * Muted, inline, looping background footage. Plays only while it should; an autoplay rejection
 * leaves the poster showing in a paused state; if every source fails, the poster photograph replaces it.
 */
const noSubscribe = () => () => {};
/** Visitors who asked to save data, or on a 2G/3G connection, get the poster only (the footage is 12.9 MB). */
const readSaveData = () => {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(connection?.saveData || /^(slow-2g|2g|3g)$/.test(connection?.effectiveType ?? ""));
};

export function HeroVideo({ sources, poster, shouldPlay, onStatus, eager }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const saveData = useSyncExternalStore(noSubscribe, readSaveData, () => false);

  // The poster is the first thing painted (and the LCP element): fetch it with high priority. The
  // original 1280px JPEG is already smaller than any re-encoded copy at full quality.
  const posterUrl = poster.src.src;
  if (eager) preload(posterUrl, { as: "image", fetchPriority: "high" });
  // The footage starts downloading only after everything on screen has loaded.
  const pageLoaded = useAfterLoad();

  useEffect(() => {
    if (saveData) onStatus("failed");
  }, [saveData, onStatus]);

  // An error on the last <source> means every source was rejected. Those errors can fire before
  // hydration, so if the element already reports no usable source, re-run selection once with load():
  // a real failure then repeats while the listener is attached.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const fail = () => {
      setFailed(true);
      onStatus("failed");
    };
    const last = video.querySelector("source:last-of-type");
    last?.addEventListener("error", fail);
    video.addEventListener("error", fail);
    const frame = requestAnimationFrame(() => {
      if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) video.load();
    });
    return () => {
      cancelAnimationFrame(frame);
      last?.removeEventListener("error", fail);
      video.removeEventListener("error", fail);
    };
  }, [onStatus]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    if (shouldPlay && pageLoaded) {
      video.play().catch(() => onStatus("paused"));
    } else {
      video.pause();
    }
  }, [shouldPlay, pageLoaded, failed, onStatus]);

  if (failed || saveData) {
    return (
      <MediaImage
        media={poster}
        sizes="100vw"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className={styles.video}
      style={{ objectPosition: poster.position }}
      poster={posterUrl}
      muted
      loop
      playsInline
      disablePictureInPicture
      // Nothing is fetched until playback starts (after the page has loaded); it then streams progressively.
      preload="none"
      aria-label={poster.alt}
      onPlaying={() => onStatus("playing")}
      onPause={() => onStatus("paused")}
    >
      {sources.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
    </video>
  );
}
