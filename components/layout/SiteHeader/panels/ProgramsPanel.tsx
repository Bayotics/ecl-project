import Link from "next/link";
import { useState, type Ref } from "react";

import type { LinkPanel } from "@/content/types";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";
import { cx } from "@/lib/cx";

import styles from "./panels.module.css";

interface ProgramsPanelProps {
  id: string;
  data: LinkPanel;
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
  // Photos load the first time the panel opens, not with every page.
  const [opened, setOpened] = useState(false);
  if (open && !opened) setOpened(true);
  return (
    <div id={id} ref={ref} className={cx(styles.panel, styles.programs)} inert={!open} data-lenis-prevent>
      <div className={styles.programsMedia} data-panel-item>
        {opened ? <MediaImage media={data.media} sizes="(min-width: 1024px) 30vw, 1px" unoptimized={data.exact} /> : null}
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
        {data.viewAll ? (
          <div data-panel-item>
            <Link href={data.viewAll.href} className={styles.textAction} onClick={onNavigate}>
              <span>{data.viewAll.label}</span>
              <ArrowRightIcon size={14} />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
