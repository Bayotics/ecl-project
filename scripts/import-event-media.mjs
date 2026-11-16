// Imports a folder of event photos (and videos) into an event category, the same records the admin
// "Event photos & videos" screen creates, but with each photo compressed first:
//
//   · full resolution, MozJPEG quality 88: about a quarter of a camera JPEG's size, visually identical
//     (kept as the photo's "full-size" file);
//   · a 2400px WebP copy at quality 90 (usually under 1 MB) that the website shows.
//
// Canon .CR2 raw files are read through the full-size JPEG the camera stores inside them. Videos are
// only taken as .mp4 and are uploaded unchanged, so compress them first (1080p H.264 with the index at
// the front, e.g. ffmpeg -movflags +faststart); camera .mov files are skipped.
//
//   node --env-file=.env.local scripts/import-event-media.mjs <category-slug> <folder> [--replace] [--dry-run]
//
// --replace deletes what the category held before (records and their files in R2), only after every new
// file has uploaded. Files are added in name order (camera order) and published straight away.

import { randomUUID } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";

import { DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { MongoClient } from "mongodb";
import sharp from "sharp";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const DRY = process.argv.includes("--dry-run");
const REPLACE = process.argv.includes("--replace");
const [slug, folder] = args;
const need = ["MONGODB_URI", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"];
const missing = need.filter((key) => !process.env[key]);
if (!slug || !folder || missing.length) {
  console.error(missing.length ? `Missing in .env.local: ${missing.join(", ")}` : "Usage: node --env-file=.env.local scripts/import-event-media.mjs <category-slug> <folder> [--replace] [--dry-run]");
  process.exit(1);
}

const PHOTOS = new Set([".jpg", ".jpeg", ".png", ".webp", ".cr2"]);
const VIDEOS = new Set([".mp4"]);
const AT_ONCE = 2;
const base = process.env.R2_PUBLIC_URL.replace(/\/$/, "");
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  requestChecksumCalculation: "WHEN_REQUIRED",
});
const put = (key, body, type) => r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, Body: body, ContentType: type, CacheControl: "public, max-age=31536000, immutable" }));
const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;

/** A CR2 is TIFF-structured: IFD0's strip is the camera's full-size JPEG, and IFD0 holds the orientation. */
function fromCr2(buf) {
  const le = buf.toString("ascii", 0, 2) === "II";
  const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const ifd = u32(4);
  let offset, length, orientation = 1;
  for (let i = 0, n = u16(ifd); i < n; i++) {
    const entry = ifd + 2 + i * 12;
    const tag = u16(entry);
    if (tag === 0x111) offset = u32(entry + 8);
    if (tag === 0x117) length = u32(entry + 8);
    if (tag === 0x112) orientation = u16(entry + 8);
  }
  if (!offset || !length) throw new Error("No embedded JPEG found in this CR2.");
  return { image: buf.subarray(offset, offset + length), orientation };
}

/** Full-resolution JPEG (q88) and a 2400px WebP (q90), both upright, colour profile kept, other metadata dropped. */
async function compress(file) {
  const raw = await readFile(file);
  let source = raw;
  let orientation;
  if (extname(file).toLowerCase() === ".cr2") ({ image: source, orientation } = fromCr2(raw));
  const upright = () => {
    const image = sharp(source, { failOn: "none" }).keepIccProfile();
    return orientation ? image.rotate({ 1: 0, 3: 180, 6: 90, 8: 270 }[orientation] ?? 0) : image.rotate();
  };
  const [full, preview] = await Promise.all([
    upright().jpeg({ quality: 88, mozjpeg: true }).toBuffer(),
    upright().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toBuffer(),
  ]);
  return { original: raw.length, full, preview };
}

const mongo = new MongoClient(process.env.MONGODB_URI);
try {
  await mongo.connect();
  const db = mongo.db(process.env.MONGODB_DB || "ecl");
  const category = await db.collection("event_categories").findOne({ slug });
  if (!category) throw new Error(`No event category with the slug "${slug}".`);
  const media = db.collection("event_media");
  const before = await media.find({ category_id: category.id }).toArray();

  const names = (await readdir(folder)).filter((name) => PHOTOS.has(extname(name).toLowerCase()) || VIDEOS.has(extname(name).toLowerCase())).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  const skipped = (await readdir(folder)).filter((name) => !names.includes(name));
  console.log(`${category.title}: ${names.length} files to add${skipped.length ? `, skipping ${skipped.join(", ")}` : ""}; ${before.length} existing ${REPLACE ? "to remove afterwards" : "kept"}${DRY ? " (dry run)" : ""}.`);
  if (DRY) process.exit(0);

  const prefix = `event-media/${slug}`;
  const created = [];
  let next = 0;
  let failed = 0;
  const worker = async () => {
    while (next < names.length) {
      const index = next++;
      const name = names[index];
      const file = join(folder, name);
      const id = randomUUID();
      try {
        const video = VIDEOS.has(extname(name).toLowerCase());
        let mediaUrl, previewUrl = "", note;
        if (video) {
          const body = await readFile(file);
          await put(`${prefix}/${id}.mp4`, body, "video/mp4");
          mediaUrl = `${base}/${prefix}/${id}.mp4`;
          note = `video ${mb(body.length)}`;
        } else {
          const { original, full, preview } = await compress(file);
          await put(`${prefix}/${id}.jpg`, full, "image/jpeg");
          await put(`${prefix}/${id}.preview.webp`, preview, "image/webp");
          mediaUrl = `${base}/${prefix}/${id}.jpg`;
          previewUrl = `${base}/${prefix}/${id}.preview.webp`;
          note = `${mb(original)} → ${mb(full.length)} (${Math.round((full.length / original) * 100)}%), web copy ${(preview.length / 1024).toFixed(0)} KB`;
        }
        const now = new Date().toISOString();
        const kind = video ? "video" : "image";
        created.push({ _id: id, id, title: category.title, category_id: category.id, media_type: kind, media_url: mediaUrl, poster_url: "", preview_url: previewUrl, alt_text: `${video ? "Video" : "Photo"} from ${category.title}`, caption: "", sort_order: index + 1, published: true, created_at: now, updated_at: now });
        console.log(`✓ ${name}: ${note}`);
      } catch (error) {
        failed++;
        console.error(`✗ ${name}: ${error.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: AT_ONCE }, worker));
  if (failed) {
    console.error(`${failed} failed: nothing was saved and nothing was removed. Fix and run again.`);
    const keys = created.flatMap((c) => [c.media_url, c.preview_url].filter(Boolean).map((url) => ({ Key: url.slice(base.length + 1) })));
    if (keys.length) await r2.send(new DeleteObjectsCommand({ Bucket: process.env.R2_BUCKET, Delete: { Objects: keys } }));
    process.exitCode = 1;
  } else {
    if (created.length) await media.insertMany(created);
    console.log(`Added ${created.length} to ${category.title}.`);
    if (REPLACE && before.length) {
      const keys = before.flatMap((m) => [m.media_url, m.preview_url, m.poster_url].filter((url) => url?.startsWith(`${base}/event-media/`)).map((url) => ({ Key: url.slice(base.length + 1) })));
      await media.deleteMany({ id: { $in: before.map((m) => m.id) } });
      for (let i = 0; i < keys.length; i += 1000) await r2.send(new DeleteObjectsCommand({ Bucket: process.env.R2_BUCKET, Delete: { Objects: keys.slice(i, i + 1000) } }));
      console.log(`Removed the ${before.length} earlier ${before.length === 1 ? "item" : "items"} and ${keys.length} files from R2.`);
    }
  }
} finally {
  await mongo.close();
}
