// Uploads the homepage hero footage copies (club-hero-720/1080/1440/2160.mp4) to R2 under site-media/hero/.
// R2 has no file-size limit and free downloads, so the large 4K copy stays out of git and off Vercel bandwidth.
//
//   node --env-file=.env.local scripts/upload-hero-video.mjs <folder with club-hero-*.mp4>
//
// Making the copies from public/media/homepage-hero.MOV (ffmpeg; repeat for 720/1080/1440/2160 with
// maxrate 7M/12M/18M/30M and bufsize twice that):
//   ffmpeg -i homepage-hero.MOV -map 0:v:0 -an -map_metadata -1 -vf scale=-2:1080:flags=lanczos \
//     -c:v libx264 -preset slow -tune film -profile:v high -pix_fmt yuv420p -crf 18 -maxrate 12M -bufsize 24M \
//     -g 48 -keyint_min 24 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart club-hero-1080.mp4
//
// File names are fixed and cached for a year: give a new video new names (and update content/hero.ts).

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const folder = process.argv[2];
const need = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"];
const missing = need.filter((key) => !process.env[key]);
if (!folder || missing.length) {
  console.error(folder ? `Missing in .env.local: ${missing.join(", ")}` : "Usage: node --env-file=.env.local scripts/upload-hero-video.mjs <folder>");
  process.exit(1);
}

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

for (const height of [720, 1080, 1440, 2160]) {
  const file = `club-hero-${height}.mp4`;
  const body = await readFile(join(folder, file));
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: `site-media/hero/${file}`,
      Body: body,
      ContentType: "video/mp4",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  console.log(`✓ ${file} (${(body.length / 1048576).toFixed(1)} MB) → ${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/site-media/hero/${file}`);
}
