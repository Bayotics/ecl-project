import Link from "next/link";

import { ArrowRightIcon } from "@/components/ui/icons";
import { cx } from "@/lib/cx";

import styles from "./page.module.css";

export interface RowAction {
  label: string;
  href: string;
  /** The one charcoal-filled action; the rest are outlined. */
  primary?: boolean;
}

/** A clear row of compact actions closing an inner-page section. */
export function ActionRow({ actions }: { actions: RowAction[] }) {
  return (
    <ul role="list" className={styles.actions}>
      {actions.map((action) => (
        <li key={action.href}>
          <Link href={action.href} className={cx(styles.action, action.primary && styles.actionPrimary)}>
            {action.label}
            <ArrowRightIcon size={12} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
