"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { DialogId } from "@/content/types";
import { announceLayer, onDialogRequest, onOtherLayer } from "@/lib/overlay-bus";

import { FormDialog } from "./FormDialog";

// Form code loads on first open; dialogs render their content only while open.
const ContactForm = dynamic(() => import("./ContactForm").then((m) => m.ContactForm));
const NewsletterSignup = dynamic(() => import("./NewsletterSignup").then((m) => m.NewsletterSignup));

interface DialogHostProps {
  fallback: { email: string; phone: string };
}

/**
 * Mounted once in the layout. Opens the contact or newsletter dialog on request (DialogLink), and
 * yields to any other layer (header menus/search) so only one layer is ever open.
 */
export function DialogHost({ fallback }: DialogHostProps) {
  const [open, setOpen] = useState<DialogId | null>(null);

  useEffect(
    () =>
      onDialogRequest((dialog) => {
        announceLayer("dialog");
        setOpen(dialog);
      }),
    [],
  );

  useEffect(() => onOtherLayer("dialog", () => setOpen(null)), []);

  // Fetch the form code once the page is idle, so a dialog opens with its fields ready.
  useEffect(() => {
    const preload = () => {
      void import("./ContactForm");
      void import("./NewsletterSignup");
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(preload, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(preload, 2500);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <FormDialog id="contact-dialog" title="Send a message" open={open === "contact"} onClose={() => setOpen(null)}>
        <ContactForm fallback={fallback} />
      </FormDialog>
      <FormDialog id="newsletter-dialog" title="Newsletter" open={open === "newsletter"} onClose={() => setOpen(null)}>
        <p>Get updates on community programs, volunteer opportunities and club news.</p>
        <NewsletterSignup />
      </FormDialog>
    </>
  );
}
