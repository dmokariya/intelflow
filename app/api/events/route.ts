import { env } from "cloudflare:workers";
import { currentUser } from "../../../lib/user-auth";

export const dynamic = "force-dynamic";
const allowed = new Set(["session_started","story_viewed","story_saved","story_unsaved","storyarc_opened","source_opened","share_started","share_completed","share_downloaded","feed_refreshed","topic_opened","profile_updated","signed_out","account_deleted"]);
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { event?: string; anonymousId?: string; sessionId?: string; storyId?: string; topic?: string; properties?: Record<string, unknown> };
  if (!body.event || !allowed.has(body.event)) return Response.json({ error: "Unsupported event." }, { status: 400 });
  const user = await currentUser(request).catch(() => null); const cleanProperties = JSON.stringify(body.properties || {}).slice(0, 2000);
  const db = (env as unknown as { DB: D1Database }).DB; await db.prepare("INSERT INTO user_events (user_id, anonymous_id, session_id, event_name, story_id, topic, properties, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(user?.id || null, String(body.anonymousId || "").slice(0, 80), String(body.sessionId || "").slice(0, 80), body.event, String(body.storyId || "").slice(0, 80) || null, String(body.topic || "").slice(0, 80) || null, cleanProperties, Date.now()).run();
  return Response.json({ ok: true });
}
