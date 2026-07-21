import { env } from "cloudflare:workers";
import { eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import { shares } from "../db/schema";

export type ShareRecord = typeof shares.$inferSelect;
export type ShareMetric = "views" | "sourceClicks" | "contactClicks";

export function getShareImageStore() {
  const store = (env as unknown as { SHARE_IMAGES?: KVNamespace }).SHARE_IMAGES;
  if (!store) throw new Error("Cloudflare KV binding `SHARE_IMAGES` is unavailable.");
  return store;
}

export async function createShareRecord(record: typeof shares.$inferInsert) {
  await getDb().insert(shares).values(record);
}

export async function getShareRecord(id: string) {
  const [record] = await getDb().select().from(shares).where(eq(shares.id, id)).limit(1);
  return record || null;
}

export function shareIsActive(record: ShareRecord | null, now = Date.now()) {
  return Boolean(record && !record.revokedAt && record.expiresAt > now);
}

export async function incrementShareMetric(id: string, metric: ShareMetric) {
  const update = metric === "views"
    ? { views: sql`${shares.views} + 1` }
    : metric === "sourceClicks"
      ? { sourceClicks: sql`${shares.sourceClicks} + 1` }
      : { contactClicks: sql`${shares.contactClicks} + 1` };
  await getDb().update(shares).set(update).where(eq(shares.id, id));
}

export async function revokeShareRecord(id: string) {
  await getDb().update(shares).set({ revokedAt: Date.now() }).where(eq(shares.id, id));
}

export async function hashOwnerToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function randomUrlToken(bytes = 18) {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...values)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function publicShare(record: ShareRecord) {
  return {
    id: record.id,
    storyTitle: record.storyTitle,
    storyContext: record.storyContext,
    actionDo: record.actionDo,
    actionDont: record.actionDont,
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    distributorName: record.distributorName,
    arn: record.arn,
    euin: record.euin,
    phone: record.phone,
    disclaimer: record.disclaimer,
    brandColor: record.brandColor,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
  };
}
