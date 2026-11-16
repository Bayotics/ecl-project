// Gives event photos uploaded before web-size copies existed a copy for display: about 2400px on the
// long edge, WebP at quality 90, usually under 1 MB (camera originals are 15–20 MB and load far too
// slowly in a gallery). The original stays untouched and is still linked as "Full-size photo".
// The admin uploader now makes these copies itself; this only fills in older records. Safe to re-run:
// photos that already have a copy are skipped.
//
//   node --env-file=.env.local scripts/make-event-previews.mjs            (add --dry-run to preview)
//
// Needs MONGODB_URI (MONGODB_DB optional) and the R2_* keys.

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { MongoClient } from "mongodb";
import sharp from "sharp";

const DRY = process.argv.includes("--dry-run");
const EDGE = 2400;
const AT_ONCE = 3;

const need = ["MONGODB_URI", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"];
const missing = need.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const base = process.env.R2_PUBLIC_URL.replace(/\/$/, "");
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  requestChecksumCalculation: "WHEN_REQUIRED",
});
const mongo = new MongoClient(process.env.MONGODB_URI);

async function copyFor(item) {
  if (!item.media_url.startsWith(`${base}/`)) return `skipped (not in this bucket): ${item.media_url}`;
  const key = item.media_url.slice(base.length + 1);
  const previewKey = key.replace(/\.[a-z0-9]+$/i, "") + ".preview.webp";
  if (DRY) return `would make ${previewKey}`;
  const started = Date.now();
  const object = await r2.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
  const original = Buffer.from(await object.Body.transformToByteArray());
  const copy = await sharp(original).rotate().resize({ width: EDGE, height: EDGE, fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toBuffer();
  await r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: previewKey, Body: copy, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));
  return { previewUrl: `${base}/${previewKey}`, note: `${(original.length / 1048576).toFixed(1)} MB → ${(copy.length / 1024).toFixed(0)} KB in ${((Date.now() - started) / 1000).toFixed(1)}s` };
}

try {
  await mongo.connect();
  const media = mongo.db(process.env.MONGODB_DB || "ecl").collection("event_media");
  const todo = await media.find({ media_type: "image", $or: [{ preview_url: { $exists: false } }, { preview_url: "" }] }, { projection: { _id: 0, id: 1, media_url: 1 } }).toArray();
  console.log(`${todo.length} ${todo.length === 1 ? "photo needs" : "photos need"} a web-size copy${DRY ? " (dry run)" : ""}.`);
  let next = 0;
  let failed = 0;
  const worker = async () => {
    while (next < todo.length) {
      const item = todo[next++];
      try {
        const result = await copyFor(item);
        if (typeof result === "string") console.log(`· ${item.id}: ${result}`);
        else {
          await media.updateOne({ id: item.id }, { $set: { preview_url: result.previewUrl } });
          console.log(`✓ ${item.id}: ${result.note}`);
        }
      } catch (error) {
        failed++;
        console.error(`✗ ${item.id}: ${error.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(AT_ONCE, todo.length) }, worker));
  if (failed) process.exitCode = 1;
} finally {
  await mongo.close();
}
