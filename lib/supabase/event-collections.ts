import "server-only";
import { cache } from "react";
import { publicDatabase } from "./server";
import { initialEventCategories } from "@/content/event-categories";
import type { EventCategory, EventMedia } from "./types";

export const publicEventCollections = cache(async (): Promise<{categories:EventCategory[];media:EventMedia[]}> => {
  const db=publicDatabase();
  if(!db) return {categories:initialEventCategories,media:[]};
  const [categories,media]=await Promise.all([
    db.from("event_categories").select("*").eq("published",true).order("sort_order").order("title"),
    db.from("event_media").select("*").eq("published",true).order("sort_order").order("created_at",{ascending:false})
  ]);
  // Keep the four category headings visible until the migration is applied.
  if(categories.error && ["PGRST205","42P01"].includes(categories.error.code)) return {categories:initialEventCategories,media:[]};
  if(categories.error || media.error) throw new Error("Unable to load event collections.");
  const visible=categories.data??[];
  return {categories:visible,media:(media.data??[]).filter(item=>visible.some(category=>category.id===item.category_id))};
});
