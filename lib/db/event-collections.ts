import "server-only";
import { cache } from "react";
import { database, rows } from "./mongo";
import { initialEventCategories } from "@/content/event-categories";
import type { EventCategory, EventMedia } from "./types";

export const publicEventCollections = cache(async (): Promise<{categories:EventCategory[];media:EventMedia[]}> => {
  const db=await database();
  if(!db) return {categories:initialEventCategories,media:[]};
  const [categories,media]=await Promise.all([
    rows(db,"event_categories",{published:true},{sort_order:1,title:1}),
    rows(db,"event_media",{published:true},{sort_order:1,created_at:-1})
  ]);
  return {categories,media:media.filter(item=>categories.some(category=>category.id===item.category_id))};
});
