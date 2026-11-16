// Uploads the History page film (the 2009 keynote address, 44 min, 480×360 H.264/AAC, about 106 MB) to R2
// as site-media/history/keynote-2009.mp4. It is over GitHub's 100 MB limit, so it stays out of git.
// The file is uploaded unchanged: its index (moov) is already at the front, so it starts streaming at once.
//
//   node --env-file=.env.local scripts/upload-history-video.mjs "public/media/history/videoplayback (1).mp4"
//
// The name is cached for a year: give a new video a new name (and update content/history.ts).

import { readFile } from "node:fs/promises";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const file = process.argv[2];
const KEY = "site-media/history/keynote-2009.mp4";
const need = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"];
const missing = need.filter((key) => !process.env[key]);
if (!file || missing.length) {
  console.error(file ? `Missing in .env.local: ${missing.join(", ")}` : "Usage: node --env-file=.env.local scripts/upload-history-video.mjs <video.mp4>");
  process.exit(1);
}

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

const body = await readFile(file);
await r2.send(
  new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: KEY,
    Body: body,
    ContentType: "video/mp4",
    CacheControl: "public, max-age=31536000, immutable",
  }),
);
console.log(`✓ ${(body.length / 1048576).toFixed(1)} MB → ${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${KEY}`);
