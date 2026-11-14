import "server-only";

import bcrypt from "bcryptjs";
import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { collection, database } from "@/lib/db/mongo";
import type { User } from "@/lib/db/types";

/**
 * Member and administrator sessions. A session is an HMAC-signed, HTTP-only cookie holding the user
 * id and an expiry (AUTH_SECRET signs it). The user record is re-read on every check, so a changed
 * role or a deleted account takes effect immediately.
 */
const COOKIE = "ecl_session";
const MAX_AGE = 60 * 60 * 24 * 14;

export type SessionUser = Pick<User, "id" | "email" | "role">;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");
  return value;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function sessionCookieValue(userId: string) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Math.floor(Date.now() / 1000) + MAX_AGE })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readCookie(value: string | undefined): string | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { uid?: string; exp?: number };
    return typeof data.uid === "string" && typeof data.exp === "number" && data.exp > Date.now() / 1000 ? data.uid : null;
  } catch {
    return null;
  }
}

export async function setSession(userId: string) {
  (await cookies()).set(COOKIE, sessionCookieValue(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in user, or null. */
export async function currentUser(): Promise<SessionUser | null> {
  const id = readCookie((await cookies()).get(COOKIE)?.value);
  if (!id) return null;
  const db = await database();
  if (!db) return null;
  const user = await collection(db, "users").findOne({ id }, { projection: { _id: 0, id: 1, email: 1, role: 1 } });
  return user ? { id: user.id, email: user.email, role: user.role } : null;
}

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
/** Accepts bcrypt hashes from any bcrypt implementation, including those carried over from the old database. */
export const verifyPassword = (password: string, hash: string) => (hash ? bcrypt.compare(password, hash) : Promise.resolve(false));

/** One-time link token: the raw value goes in the email, only its hash is stored. */
export async function issueToken(userId: string, purpose: "confirm" | "reset", hours: number) {
  const db = await database();
  if (!db) throw new Error("The database is not configured.");
  const raw = randomBytes(32).toString("base64url");
  const now = new Date();
  await collection(db, "auth_tokens").deleteMany({ user_id: userId, purpose });
  await collection(db, "auth_tokens").insertOne({ _id: randomUUID(), id: randomUUID(), user_id: userId, purpose, token_hash: hashToken(raw), expires_at: new Date(now.getTime() + hours * 3600_000), created_at: now });
  return raw;
}

/** Consumes a token; returns its user id when it is valid and unexpired. */
export async function consumeToken(raw: string, purpose: "confirm" | "reset") {
  const db = await database();
  if (!db || !raw) return null;
  const token = await collection(db, "auth_tokens").findOneAndDelete({ token_hash: hashToken(raw), purpose });
  return token && token.expires_at > new Date() ? token.user_id : null;
}

const hashToken = (raw: string) => createHash("sha256").update(raw).digest("hex");
