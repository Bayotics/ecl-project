import Link from "next/link";
import type { Ref } from "react";

import type { HeaderData } from "@/content/types";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";
import { cx } from "@/lib/cx";

import styles from "./panels.module.css";

interface ProgramsPanelProps {
  id: string;
  data: HeaderData["programs"];
  open: boolean;
  ref?: Ref<HTMLDivElement>;
  onNavigate: () => void;
}

/**
 * A — image-plus-list panel. Left third: one authentic photograph cropped to the panel's lower edge.
 * Middle third: label and the six categories. Right third: mostly empty, with a quiet "view all".
 * (No per-category photography exists yet, so the photograph does not crossfade.)
 */
export function ProgramsPanel({ id, data, open, ref, onNavigate }: ProgramsPanelProps) {
  return (
    <div id={id} ref={ref} className={cx(styles.panel, styles.programs)} inert={!open} data-lenis-prevent>
      <div className={styles.programsMedia} data-panel-item>
        <MediaImage media={data.media} sizes="(min-width: 1024px) 30vw, 1px" />
      </div>

      <div className={styles.programsList}>
        <p className={styles.label} data-panel-item>
          {data.label}
        </p>
        <ul role="list">
          {data.links.map((link) => (
            <li key={link.href} data-panel-item>
              <Link href={link.href} className={styles.listLink} onClick={onNavigate}>
                <span>{link.label}</span>
                <ArrowRightIcon size={16} className={styles.listArrow} />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.programsAside}>
        <div data-panel-item>
          <Link href={data.viewAll.href} className={styles.textAction} onClick={onNavigate}>
            <span>{data.viewAll.label}</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
