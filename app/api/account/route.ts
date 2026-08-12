import { env } from "cloudflare:workers";
import { currentUser, sessionCookie } from "../../../lib/user-auth";

export const dynamic = "force-dynamic";
export async function PATCH(request: Request) {
  const user = await currentUser(request); if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { name?: string; title?: string; photo?: string; interests?: string[] };
  const name = String(body.name ?? user.name).trim().slice(0, 80); const title = String(body.title ?? user.title).trim().slice(0, 80); const photo = String(body.photo ?? user.photo).slice(0, 1_500_000);
  if (!name) return Response.json({ error: "Name is required." }, { status: 400 });
  const interests = JSON.stringify(Array.isArray(body.interests) ? body.interests.slice(0, 20).map(String) : []);
  const db = (env as unknown as { DB: D1Database }).DB; await db.prepare("UPDATE users SET name=?, title=?, photo=?, interests=?, updated_at=?, last_seen_at=? WHERE id=?").bind(name, title, photo, interests, Date.now(), Date.now(), user.id).run();
  return Response.json({ profile: { ...user, name, title, photo, interests: JSON.parse(interests) } });
}
export async function DELETE(request: Request) {
  const user = await currentUser(request); if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const db = (env as unknown as { DB: D1Database }).DB; const now = Date.now();
  await db.batch([db.prepare("DELETE FROM user_saves WHERE user_id=?").bind(user.id), db.prepare("UPDATE user_events SET user_id=NULL WHERE user_id=?").bind(user.id), db.prepare("UPDATE users SET email='', name='', title='', photo='', interests='[]', deleted_at=?, updated_at=? WHERE id=?").bind(now, now, user.id)]);
  return Response.json({ ok: true }, { headers: { "Set-Cookie": `${sessionCookie}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
}
