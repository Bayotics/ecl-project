"use client";

import { useEffect, useRef, useState } from "react";

import type { ResolvedMedia, VideoSource } from "@/content/types";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";
import { media } from "@/lib/motion";
import { useMediaQuery } from "@/lib/use-media-query";

import styles from "./AmbientVideo.module.css";

interface AmbientVideoProps {
  sources: VideoSource[];
  poster: ResolvedMedia;
  /** Describes the footage for assistive tech. */
  label: string;
  sizes: string;
}

/**
 * Muted, inline, looping landscape footage that plays only while on screen, with a small pause/play
 * control (WCAG 2.2.2). Reduced motion starts paused (the visitor may still press Play). Autoplay
 * rejection leaves the poster with a Play control; if every source fails, or there are no sources,
 * the poster photograph fills the slot (the footage is recorded as outstanding in content/media.ts).
 */
export function AmbientVideo({ sources, poster, label, sizes }: AmbientVideoProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useMediaQuery(media.reducedMotion);
  // `null` follows the default (play unless reduced motion); otherwise the visitor's explicit choice.
  const [choice, setChoice] = useState<"play" | "pause" | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const wantsPlayback = choice ? choice === "play" : !reducedMotion;

  // Every <source> rejected → poster. Errors can predate hydration, so re-run selection once if needed.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const fail = () => setFailed(true);
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
  }, []);

  // Visibility-based playback.
  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video || failed) return;
    if (!wantsPlayback) {
      video.pause();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => setPlaying(false));
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [wantsPlayback, failed]);

  if (!sources.length || failed) {
    return (
      <div className={styles.frame}>
        <MediaImage media={poster} sizes={sizes} />
      </div>
    );
  }

  return (
    <div ref={frameRef} className={styles.frame}>
      <video
        ref={videoRef}
        className={styles.media}
        style={{ objectPosition: poster.position }}
        muted
        loop
        playsInline
        disablePictureInPicture
        preload="metadata"
        poster={poster.src.src}
        aria-label={label}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>
      <button
        type="button"
        className={styles.toggle}
        aria-label={playing ? "Pause video" : "Play video"}
        onClick={() => setChoice(playing ? "pause" : "play")}
      >
        {playing ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
      </button>
    </div>
  );
}
