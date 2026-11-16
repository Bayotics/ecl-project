"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

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

type Connection = { saveData?: boolean; effectiveType?: string; downlink?: number };
const connection = () => (navigator as Navigator & { connection?: Connection }).connection;

const noSubscribe = () => () => {};
/** Visitors who asked to save data, or on a 2G connection, get the photograph only. */
const readSaveData = () => {
  const c = connection();
  return Boolean(c?.saveData || /^(slow-2g|2g)$/.test(c?.effectiveType ?? ""));
};

/**
 * The copies to try, best first: the smallest one that is sharp at this screen's size and pixel density,
 * then each smaller one (used if playback stalls). Phones stop at 1440p. The browser's speed estimate is often
 * far too low, so it only counts when it is very low (720p); real stalls are handled by stepping down.
 */
function rankSources(sources: VideoSource[]): VideoSource[] {
  const sized = sources.filter((source) => source.height).sort((a, b) => a.height! - b.height!);
  if (sized.length < 2) return sources;
  // The footage covers the hero (object-fit: cover), so it is drawn at least as tall as the viewport.
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const needed = Math.max(window.innerHeight, (window.innerWidth * 9) / 16) * dpr;
  const phone = window.matchMedia("(pointer: coarse)").matches && Math.min(screen.width, screen.height) < 768;
  const downlink = connection()?.downlink;
  const cap = downlink !== undefined && downlink < 1 ? 720 : phone ? 1440 : Infinity;
  const allowed = sized.filter((source) => source.height! <= cap);
  const pool = allowed.length ? allowed : [sized[0]];
  const best = pool.findIndex((source) => source.height! >= needed);
  const start = best === -1 ? pool.length - 1 : best;
  return pool.slice(0, start + 1).reverse();
}

/**
 * Muted, inline, looping background footage over its photograph. The photograph is painted first (it is
 * the LCP element); the footage starts downloading as soon as the page has loaded and fades in once it
 * is actually playing. If playback stalls, it drops to the next smaller copy and carries on from the same
 * moment. An autoplay rejection leaves the photograph in a paused state; if the footage fails, the
 * photograph simply stays.
 */
export function HeroVideo({ sources, poster, shouldPlay, onStatus, eager }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveData = useSyncExternalStore(noSubscribe, readSaveData, () => false);
  const pageLoaded = useAfterLoad(0);
  // Choose the copy only in the browser, once the page has loaded (pageLoaded is never true on the server).
  const ranked = useMemo(() => (pageLoaded && !saveData ? rankSources(sources) : null), [pageLoaded, saveData, sources]);
  const [level, setLevel] = useState(0);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const resumeAt = useRef(0);

  useEffect(() => {
    if (saveData) onStatus("failed");
  }, [saveData, onStatus]);

  const source = ranked?.[level];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source || failed) return;
    if (shouldPlay) video.play().catch(() => onStatus("paused"));
    else video.pause();
  }, [shouldPlay, source, failed, onStatus]);

  // Stall watch: a pause for data longer than 2.5 s once playing moves down one copy.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ranked || level >= ranked.length - 1) return;
    let timer = 0;
    const onWaiting = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        resumeAt.current = video.currentTime;
        setLevel((current) => current + 1);
      }, 2500);
    };
    const onProgressing = () => window.clearTimeout(timer);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onProgressing);
    video.addEventListener("timeupdate", onProgressing);
    return () => {
      window.clearTimeout(timer);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onProgressing);
      video.removeEventListener("timeupdate", onProgressing);
    };
  }, [ranked, level]);

  const onError = () => {
    if (ranked && level < ranked.length - 1) {
      setLevel(level + 1);
      return;
    }
    setFailed(true);
    setVisible(false);
    onStatus("failed");
  };

  return (
    <>
      <MediaImage
        media={poster}
        // Cover-fitted 3:2 photograph: on narrower-than-3:2 screens it is drawn 1.5× the viewport height wide.
        sizes="(max-aspect-ratio: 3/2) 150vh, 100vw"
        preload={eager}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
      {source && !failed ? (
        <video
          key={source.src}
          ref={videoRef}
          className={styles.video}
          data-visible={visible || undefined}
          style={{ objectPosition: poster.position }}
          src={source.src}
          muted
          loop
          playsInline
          disablePictureInPicture
          preload="auto"
          aria-label={poster.alt}
          onLoadedMetadata={(event) => {
            if (resumeAt.current) event.currentTarget.currentTime = resumeAt.current;
          }}
          onPlaying={() => {
            setVisible(true);
            onStatus("playing");
          }}
          onPause={() => onStatus("paused")}
          onError={onError}
        />
      ) : null}
    </>
  );
}
