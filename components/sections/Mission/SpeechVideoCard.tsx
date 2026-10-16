"use client";

import { useRef, useState } from "react";

import type { ResolvedMedia, VideoSource } from "@/content/types";
import { PlayIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";

import styles from "./SpeechVideoCard.module.css";

export interface SpeechVideo {
  /** Small label above the title, e.g. "From the President". */
  label: string;
  title: string;
  /** "Name, President" once confirmed; null until then. */
  speaker: string | null;
  /** Display duration, e.g. "4:12". */
  duration: string | null;
  sources: VideoSource[];
  /** WebVTT captions (strongly recommended for speech). */
  captions: string | null;
  poster: ResolvedMedia;
}

/**
 * Video card for a speech (Our mission row). Unlike the ambient footage elsewhere, a speech plays with
 * sound, only when the visitor asks: a poster with a play button swaps in a native <video controls>.
 * Nothing is downloaded until then. Without a source the card says the video is on its way.
 */
export function SpeechVideoCard({ video }: { video: SpeechVideo }) {
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const available = video.sources.length > 0 && !failed;
  const titleId = "speech-title";

  const start = () => {
    setStarted(true);
    // The element mounts on this render; focus it so keyboard users land on the player controls.
    requestAnimationFrame(() => {
      videoRef.current?.focus();
      videoRef.current?.play().catch(() => undefined);
    });
  };

  return (
    <figure className={styles.card} aria-labelledby={titleId}>
      <div className={styles.frame}>
        {started && available ? (
          <video
            ref={videoRef}
            className={styles.video}
            controls
            playsInline
            preload="none"
            poster={video.poster.src.src}
            aria-labelledby={titleId}
            onError={() => setFailed(true)}
          >
            {video.sources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
            {video.captions ? <track kind="captions" src={video.captions} srcLang="en" label="English" default /> : null}
          </video>
        ) : (
          <>
            <MediaImage media={video.poster} sizes="(min-width: 1024px) 30vw, 92vw" className={styles.poster} />
            {available ? (
              <button type="button" className={styles.play} onClick={start} aria-describedby={titleId}>
                <span className={styles.playIcon} aria-hidden="true">
                  <PlayIcon size={14} />
                </span>
                <span className={styles.playLabel}>Play video{video.duration ? ` · ${video.duration}` : ""}</span>
              </button>
            ) : (
              <span className={styles.pending}>{failed ? "Video unavailable" : "Video coming soon"}</span>
            )}
          </>
        )}
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.label}>{video.label}</span>
        <span id={titleId} className={styles.title}>
          {video.title}
        </span>
        {video.speaker ? <span className={styles.speaker}>{video.speaker}</span> : null}
      </figcaption>
    </figure>
  );
}
