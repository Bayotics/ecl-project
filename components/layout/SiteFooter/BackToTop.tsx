"use client";

import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { ArrowButton } from "@/components/ui/ArrowButton";

export function BackToTop({ className }: { className?: string }) {
  const { scrollToTop } = useSmoothScroll();

  return (
    <ArrowButton
      direction="up"
      label="Back to top"
      className={className}
      onClick={() => scrollToTop(() => document.getElementById("top")?.focus({ preventScroll: true }))}
    />
  );
}
