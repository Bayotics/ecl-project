// Gives a new, empty club database the records the admin dashboard edits: club details, the
// leadership roster, the event categories and the homepage/about image spots, and creates the
// database indexes. Existing records are
// never overwritten, so it is safe to run again.
//
//   node --env-file=.env.local scripts/seed-database.mjs
//
// Built-in history (the 2018 and 2021 events, the 2018 gallery album) is part of the site's code and
// always shows; it is not copied here. Image spots start empty, so the site shows its own photos until
// an administrator uploads a replacement.

import { randomUUID } from "node:crypto";

import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}

const now = new Date().toISOString();
const record = (fields) => {
  const id = randomUUID();
  return { _id: id, id, ...fields, created_at: now, updated_at: now };
};

const settings = {
  _id: 1, id: 1,
  organization_name: "Eko Club Louisiana",
  tagline: "Eko Club Louisiana · Baton Rouge",
  mission_headline: "Our mission",
  mission_summary: "Eko Club Louisiana brings together the sons, daughters and friends of Lagos to strengthen community, preserve cultural heritage and support humanitarian service.",
  address: "Baton Rouge, Louisiana",
  phone: "(225) 932-9150",
  email: "info@ekoclublouisiana.com",
  donation_url: "", facebook_url: "", instagram_url: "", youtube_url: "",
  updated_at: now,
};

const executive = (slug, name, role, term, section, sort_order) =>
  record({ slug, name, role, term, section, bio: "", image_url: `/media/executives/${slug}.webp`, image_alt: name, sort_order, published: true });
const executives = [
  executive("wallace-jimson", "Hon. Wallace Jimson", "President", "2025–2028", "current", 0),
  executive("dominic-adedeji", "Hon. Dominic Adedeji", "Vice President", "2025–2028", "current", 1),
  executive("bode-omololu", "Hon. Bode Omololu", "General Secretary", "2025–2028", "current", 2),
  executive("ademola-oloko", "Hon. Ademola Oloko", "Treasurer/Financial Secretary", "2025–2028", "current", 3),
  executive("james-olalekan", "Hon. James Olalekan", "PRO/Social Secretary", "2025–2028", "current", 4),
  executive("francis-adelaja", "Hon. Dr. Francis A. Adelaja", "President", "2016–2020", "presidents", 0),
  executive("ayodeji-famuyide", "Hon. Dr. Ayodeji Famuyide", "President", "2020–2025", "presidents", 1),
  executive("wallace-jimson-presidency", "Hon. Wallace Jimson", "President", "2025–present", "presidents", 2),
];

// Same ids as the site's built-in categories (content/event-categories.ts).
const category = (id, title, slug, sort_order) => ({ _id: id, id, title, slug, description: "", image_url: "", sort_order, published: true, created_at: now, updated_at: now });
const categories = [
  category("b1000000-0000-4000-8000-000000000001", "2nd Line", "2nd-line", 0),
  category("b1000000-0000-4000-8000-000000000002", "Banquets", "banquets", 1),
  category("b1000000-0000-4000-8000-000000000003", "Oldies Social Night", "oldies-social-night", 2),
  category("b1000000-0000-4000-8000-000000000004", "Youth Outreach", "youth-outreach", 3),
];

const spot = (placement, page, label, sort_order) => record({ placement, page, label, image_url: "", image_alt: "", active: true, sort_order });
const pageMedia = [
  spot("home-president-poster", "home", "President message poster", 1),
  spot("home-impact-panel", "home", "Impact panel", 2),
  spot("home-causes-panel", "home", "Causes panel", 3),
  spot("home-cause-youth-outreach", "home", "Youth Outreach card", 5),
  spot("home-cause-cultural-heritage", "home", "Cultural Heritage card", 6),
  spot("home-cause-humanitarian-support", "home", "Humanitarian Support card", 7),
  spot("home-cause-community-building", "home", "Community Building card", 8),
  spot("home-cause-health-and-wellbeing", "home", "Health and Wellbeing card", 9),
  spot("home-culture-feature", "home", "Culture feature", 10),
  spot("home-editorial", "home", "Get involved feature", 11),
  spot("about-hero", "about", "About page hero", 12),
];

async function insertMissing(db, name, docs, key) {
  let added = 0;
  for (const doc of docs) {
    const result = await db.collection(name).updateOne({ [key]: doc[key] }, { $setOnInsert: doc }, { upsert: true });
    added += result.upsertedCount;
  }
  console.log(`- ${name}: ${added} added, ${docs.length - added} already there`);
}

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "ecl");
  const unique = { unique: true };
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, unique),
    db.collection("auth_tokens").createIndex({ token_hash: 1 }, unique),
    db.collection("auth_tokens").createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }),
    db.collection("events").createIndex({ slug: 1 }, unique),
    db.collection("executives").createIndex({ slug: 1 }, unique),
    db.collection("event_categories").createIndex({ slug: 1 }, unique),
    db.collection("gallery_albums").createIndex({ slug: 1 }, unique),
    db.collection("page_media").createIndex({ placement: 1 }, unique),
    db.collection("event_rsvps").createIndex({ event_id: 1, user_id: 1 }, unique),
    db.collection("newsletter_subscribers").createIndex({ email: 1 }, unique),
  ]);
  console.log("- indexes: ready");
  await insertMissing(db, "site_settings", [settings], "id");
  await insertMissing(db, "executives", executives, "slug");
  await insertMissing(db, "event_categories", categories, "slug");
  await insertMissing(db, "page_media", pageMedia, "placement");
  console.log("\nDatabase ready.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.close();
}
