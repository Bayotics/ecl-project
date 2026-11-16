import { randomUUID } from "node:crypto";

import { ApiError, handle } from "@/lib/server/api";
import { isStorageConfigured, publicUrl, signedUpload } from "@/lib/server/storage";

const TYPES: Record<string, { extension: string; maxMb: number; buckets: string[] }> = {
  "image/jpeg": { extension: "jpg", maxMb: 50, buckets: ["site-media", "event-media"] },
  "image/png": { extension: "png", maxMb: 50, buckets: ["site-media", "event-media"] },
  "image/webp": { extension: "webp", maxMb: 50, buckets: ["site-media", "event-media"] },
  "image/avif": { extension: "avif", maxMb: 50, buckets: ["site-media", "event-media"] },
  // Videos go straight from the browser to R2 (one request, up to 5 GB there), never through the site.
  "video/mp4": { extension: "mp4", maxMb: 2048, buckets: ["event-media"] },
  "video/webm": { extension: "webm", maxMb: 2048, buckets: ["event-media"] },
  "video/quicktime": { extension: "mov", maxMb: 2048, buckets: ["event-media"] },
};

/** POST { bucket, contentType, size } → a 10-minute signed PUT URL and the file's eventual public URL. */
export async function POST(request: Request) {
  return handle(request, { body: 1024, auth: "admin", limit: ["upload", 2000, 3600] }, async ({ data, user }) => {
    if (!isStorageConfigured()) throw new ApiError("File storage is not configured yet. Paste an image URL instead.", 503);
    const bucket = String(data.bucket);
    const contentType = String(data.contentType);
    const size = Number(data.size);
    const type = TYPES[contentType];
    if (!type || !type.buckets.includes(bucket)) throw new ApiError("This file type cannot be uploaded here.");
    if (!Number.isInteger(size) || size <= 0 || size > type.maxMb * 1024 * 1024) throw new ApiError(`Choose a file under ${type.maxMb} MB.`);
    const key = `${bucket}/${user!.id}/${randomUUID()}.${type.extension}`;
    return { uploadUrl: await signedUpload(key, contentType, size), publicUrl: publicUrl(key) };
  });
}
