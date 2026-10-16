import Link from "next/link";
import type { Ref } from "react";

import type { HeaderData } from "@/content/types";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cx } from "@/lib/cx";

import styles from "./panels.module.css";

interface MenuPanelProps {
  id: string;
  data: HeaderData["menu"];
  open: boolean;
  ref?: Ref<HTMLDivElement>;
  onNavigate: () => void;
}

/**
 * C — full menu, 50% / 25% / 25% with thin separators. Two large links top-left, two compact lists,
 * and a shared social row under the right-hand quarters.
 */
export function MenuPanel({ id, data, open, ref, onNavigate }: MenuPanelProps) {
  return (
    <div id={id} ref={ref} className={cx(styles.panel, styles.menu)} inert={!open} data-lenis-prevent>
      <nav aria-label="Site menu" className={styles.menuWelcome}>
        <p className={styles.label} data-panel-item>
          {data.label}
        </p>
        <ul role="list" className={styles.featureLinks}>
          {data.feature.map((link) => (
            <li key={link.href} data-panel-item>
              <Link href={link.href} className={styles.featureLink} onClick={onNavigate}>
                <span>{link.label}</span>
                <ArrowRightIcon size={18} className={styles.listArrow} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {data.columns.map((column) => (
        <nav key={column.heading} aria-label={column.heading} className={styles.menuColumn}>
          <p className={styles.label} data-panel-item>
            {column.heading}
          </p>
          <ul role="list" className={styles.compactList}>
            {column.links.map((link) => (
              <li key={link.href} data-panel-item>
                <Link href={link.href} className={styles.compactLink} onClick={onNavigate}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}

      <div className={styles.social}>
        <p className={styles.label} data-panel-item>
          {data.social.label}
        </p>
        {data.social.links.length ? (
          <ul role="list" className={styles.socialLinks}>
            {data.social.links.map((link) => (
              <li key={link.href} data-panel-item>
                <a href={link.href} className={styles.compactLink} rel="noopener noreferrer" target="_blank">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.socialEmpty} data-panel-item>
            {data.social.emptyText}
          </p>
        )}
      </div>
    </div>
  );
}
