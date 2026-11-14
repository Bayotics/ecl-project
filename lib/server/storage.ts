import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Uploaded media lives in Cloudflare R2 (S3-compatible). The admin dashboard asks for a short-lived
 * signed upload URL and the browser sends the file straight to R2, so large videos never pass
 * through the site's own server functions.
 *
 * Needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET and R2_PUBLIC_URL (the
 * bucket's public r2.dev address or custom domain).
 */
export const isStorageConfigured = () =>
  Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET && process.env.R2_PUBLIC_URL);

let client: S3Client | undefined;
function r2() {
  client ??= new S3Client({
    region: "auto",
    // Sign uploads without a precomputed checksum: the browser sends the file, not the server.
    requestChecksumCalculation: "WHEN_REQUIRED",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
  });
  return client;
}

export const publicUrl = (key: string) => `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;

export async function signedUpload(key: string, contentType: string, size: number) {
  const command = new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: contentType, ContentLength: size, CacheControl: "public, max-age=31536000, immutable" /* every upload gets a new name */ });
  return getSignedUrl(r2(), command, { expiresIn: 600 });
}
