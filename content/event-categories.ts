import type { EventCategory } from "@/lib/supabase/types";
export const initialEventCategories: EventCategory[] = [
  { id:"b1000000-0000-4000-8000-000000000002", title:"Banquets", slug:"banquets", description:"", image_url:"", sort_order:1, published:true, created_at:"2026-11-09T00:00:00Z" },
  { id:"b1000000-0000-4000-8000-000000000003", title:"Oldies Social Night", slug:"oldies-social-night", description:"", image_url:"", sort_order:2, published:true, created_at:"2026-11-09T00:00:00Z" },
  { id:"b1000000-0000-4000-8000-000000000004", title:"Youth Outreach", slug:"youth-outreach", description:"", image_url:"", sort_order:3, published:true, created_at:"2026-11-09T00:00:00Z" },
];
