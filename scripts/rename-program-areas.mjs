// Education was removed and Youth Leadership renamed Youth Outreach. Brings the database's admin image
// slots in line: the "Education card" slot is deleted and the "Youth Leadership card" slot (with any image
// already uploaded to it) becomes the "Youth Outreach card". Safe to re-run.
//
//   node --env-file=.env.local scripts/rename-program-areas.mjs            (add --dry-run to preview)

import { MongoClient } from "mongodb";

const DRY = process.argv.includes("--dry-run");
if (!process.env.MONGODB_URI) {
  console.error("Missing in .env.local: MONGODB_URI");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "ecl");
const media = db.collection("page_media");

const education = await media.find({ placement: "home-cause-education" }).toArray();
const youth = await media.find({ placement: "home-cause-youth-leadership" }).toArray();
console.log(`Education card slots: ${education.length}`, education.map((row) => row.image_url || "(no image)"));
console.log(`Youth Leadership card slots: ${youth.length}`, youth.map((row) => row.image_url || "(no image)"));

if (!DRY) {
  const removed = await media.deleteMany({ placement: "home-cause-education" });
  const renamed = await media.updateMany(
    { placement: "home-cause-youth-leadership" },
    { $set: { placement: "home-cause-youth-outreach", label: "Youth Outreach card", updated_at: new Date().toISOString() } },
  );
  console.log(`Deleted ${removed.deletedCount} Education slot(s); renamed ${renamed.modifiedCount} Youth Leadership slot(s).`);
}
await client.close();
