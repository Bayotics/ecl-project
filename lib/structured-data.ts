import crest from "@/assets/media/ecl-crest.png";
import { eventHref, eventInstants } from "@/content/event-view";
import { resolveMedia } from "@/content/media";
import { published } from "@/content/meta";
import { settings } from "@/content/site";
import { socialLinks } from "@/content/social";
import type { EventRecord } from "@/content/types";

const absolute = (path: string) => new URL(path, settings.url).toString();

/**
 * Organization facts that are confirmed: name, site, logo, description, published email and phone,
 * and the city. Deliberately omits a street address (unconfirmed) and any tax or nonprofit status.
 */
export function organizationLd() {
  const sameAs = published(socialLinks).map((link) => link.url);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.name,
    alternateName: settings.shortName,
    url: settings.url,
    logo: absolute(crest.src),
    description: settings.description,
    email: settings.contact.email,
    telephone: settings.contact.phone.tel,
    address: { "@type": "PostalAddress", addressLocality: "Baton Rouge", addressRegion: "LA", addressCountry: "US" },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** Event data only when the club has confirmed the date and time; archive records get none. */
export function eventLd(event: EventRecord) {
  const instants = eventInstants(event);
  if (!instants || event.historical) return null;
  const image = resolveMedia(event.media);
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.excerpt,
    url: absolute(eventHref(event.slug)),
    startDate: instants.start.toISOString(),
    ...(instants.end ? { endDate: instants.end.toISOString() } : {}),
    ...(event.location ? { location: { "@type": "Place", name: event.location, address: event.location } } : {}),
    image: [absolute(image.src.src)],
    organizer: { "@type": "Organization", name: settings.name, url: settings.url },
  };
}
