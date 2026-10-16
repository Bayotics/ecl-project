"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

import type { DialogId } from "@/content/types";
import { requestDialog } from "@/lib/overlay-bus";

interface DialogLinkProps {
  dialog: DialogId;
  /** Page fallback (no JavaScript, new tab, modified click). */
  href: string;
  className?: string;
  children: ReactNode;
}

/** A real link to the form page that, on a plain click, opens the form as a dialog instead. */
export function DialogLink({ dialog, href, className, children }: DialogLinkProps) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    requestDialog(dialog);
  };

  return (
    <Link href={href} className={className} onClick={onClick} aria-haspopup="dialog">
      {children}
    </Link>
  );
}
