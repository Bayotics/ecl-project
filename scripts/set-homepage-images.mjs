// Replaces the admin dashboard's "Home & about images" entries for the homepage with the club's new
// photographs exactly as supplied (assets/media/homepage), uploading each to R2 exactly as the dashboard's upload does.
// The Education card is left as it is. Safe to re-run.
//
//   node --env-file=.env.local scripts/set-homepage-images.mjs            (add --dry-run to preview)
//
// Needs MONGODB_URI (MONGODB_DB optional) and the R2_* keys. Run it after scripts/seed-database.mjs.

import { readFile } from "node:fs/promises";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { MongoClient } from "mongodb";

const DRY = process.argv.includes("--dry-run");

// placement → [file in assets/media/homepage, image description]
const IMAGES = {
  "home-president-poster": ["message-from-president.webp", "Portrait of a man in a cream agbada and an embroidered gold cap."],
  "home-impact-panel": ["impact-card.png", "Women in matching royal-blue lace attire and gele head wraps standing together in a school hall."],
  "home-causes-panel": ["causes-card.png", "Two club members wearing green Eko Club stoles and blue head ties."],
  "home-cause-youth-leadership": ["youth-leadership.jpg", "Young people in matching red-and-white shirts gathered around a table of donated supplies."],
  "home-cause-cultural-heritage": ["cultural-heritage.png", "Two men in white traditional attire and blue caps, one wearing coral beads, in front of a balloon backdrop."],
  "home-cause-humanitarian-support": ["humanitarian-support.png", "Volunteers in red-and-white shirts sorting donated personal-care products."],
  "home-cause-community-building": ["community-building.png", "A smiling woman and man in white Eko Club polo shirts at a club gathering."],
  "home-cause-health-and-wellbeing": ["health-and-wellbeing.jpg", "A health worker in gloves and a mask taking a nasal swab from a seated man."],
  "home-culture-feature": ["rooted-in-lagos.png", "A colourful masquerade figure leading a street procession of people in traditional attire."],
  "home-editorial": ["community-built-together.png", "Club members in white attire and black-and-gold Eko Club stoles standing together."],
};

const need = ["MONGODB_URI", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"];
const missing = need.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const mongo = new MongoClient(process.env.MONGODB_URI);

async function main() {
  await mongo.connect();
  const pageMedia = mongo.db(process.env.MONGODB_DB || "ecl").collection("page_media");
  for (const [placement, [file, alt]] of Object.entries(IMAGES)) {
    const key = `site-media/homepage/${file}`;
    const url = `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
    if (!DRY) {
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: await readFile(new URL(`../assets/media/homepage/${file}`, import.meta.url)),
        ContentType: { webp: "image/webp", png: "image/png", jpg: "image/jpeg" }[file.split(".").pop()],
        CacheControl: "public, max-age=3600",
      }));
    }
    const result = DRY ? { matchedCount: await pageMedia.countDocuments({ placement }) } : await pageMedia.updateOne({ placement }, { $set: { image_url: url, image_alt: alt, active: true, updated_at: new Date().toISOString() } });
    console.log(`${result.matchedCount ? "✓" : "! no admin entry for"} ${placement} → ${file}`);
  }
  console.log(DRY ? "\nDry run complete; nothing was changed." : "\nHomepage images updated.");
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => mongo.close().catch(() => {}));
