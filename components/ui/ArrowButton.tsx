import type { ButtonHTMLAttributes } from "react";

import { cx } from "@/lib/cx";

import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from "./icons";
import styles from "./ArrowButton.module.css";

type Direction = "prev" | "next" | "up" | "down";

interface ArrowButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  direction: Direction;
  /** Accessible name, e.g. "Next slide". */
  label: string;
  tone?: "light" | "dark";
  /** `compact` is the ~27px square used in the hero control strip. */
  size?: "default" | "compact";
}

const ICONS = { prev: ArrowLeftIcon, next: ArrowRightIcon, up: ArrowUpIcon, down: ArrowDownIcon } as const;

/** Small square control used by the hero, the causes carousel and back-to-top. */
export function ArrowButton({
  direction,
  label,
  tone = "dark",
  size = "default",
  className,
  type = "button",
  ...rest
}: ArrowButtonProps) {
  const Icon = ICONS[direction];
  return (
    <button
      type={type}
      aria-label={label}
      className={cx(styles.button, tone === "light" && styles.light, size === "compact" && styles.compact, className)}
      {...rest}
    >
      <Icon size={size === "compact" ? 12 : 16} />
    </button>
  );
}
