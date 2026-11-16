import type { EventCategory } from "@/lib/db/types";
export const initialEventCategories: EventCategory[] = [
  { id:"b1000000-0000-4000-8000-000000000002", title:"Banquets", slug:"banquets", description:"", image_url:"", sort_order:1, published:true, created_at:"2026-11-09T00:00:00Z" },
  { id:"b1000000-0000-4000-8000-000000000003", title:"Oldies Social Night", slug:"oldies-social-night", description:"", image_url:"", sort_order:2, published:true, created_at:"2026-11-09T00:00:00Z" },
  { id:"b1000000-0000-4000-8000-000000000004", title:"Youth Outreach", slug:"youth-outreach", description:"", image_url:"", sort_order:3, published:true, created_at:"2026-11-09T00:00:00Z" },
];

/**
 * The photo collections shown as cards in the header's Events dropdown, in order: the category's slug
 * and the name the card shows. A category that is missing, hidden or still empty is left out.
 */
export const featuredEventCollections: { slug: string; title: string; year: string }[] = [
  { slug: "banquets", title: "2026 Banquet", year: "2026" },
  { slug: "oldies-social-night", title: "2026 Oldies Night", year: "2026" },
];
