import Link from "next/link";
import type { ComponentProps } from "react";

import { cx } from "@/lib/cx";

import { ArrowRightIcon } from "./icons";
import styles from "./ActionLink.module.css";

interface ActionLinkProps extends Omit<ComponentProps<typeof Link>, "children"> {
  children: string;
  /** `outline` = small outlined rectangle; `text` = underlined inline link. */
  variant?: "outline" | "text";
  tone?: "dark" | "light";
}

/** Small outlined (or underlined) navigation action with a trailing arrow. */
export function ActionLink({ children, variant = "outline", tone = "dark", className, ...rest }: ActionLinkProps) {
  return (
    <Link
      className={cx(styles.link, styles[variant], tone === "light" && styles.light, className)}
      {...rest}
    >
      <span className={styles.label}>{children}</span>
      <ArrowRightIcon className={styles.icon} size={14} />
    </Link>
  );
}
