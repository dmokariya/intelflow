import { env } from "cloudflare:workers";
import { currentUser, googleClientId, readSession, sessionCookie, verifyCredential } from "../../../../lib/user-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { credential?: string };
  const verified = await verifyCredential(body.credential || "");
  if (!verified) return Response.json({ error: "Google sign-in could not be verified." }, { status: 401 });
  const claims = verified.claims; const now = Date.now(); const id = crypto.randomUUID();
  const db = (env as unknown as { DB: D1Database }).DB;
  await db.prepare(`INSERT INTO users (id, google_sub, email, name, title, photo, interests, created_at, updated_at, last_seen_at)
    VALUES (?, ?, ?, ?, '', ?, '[]', ?, ?, ?)
    ON CONFLICT(google_sub) DO UPDATE SET email=excluded.email, name=CASE WHEN users.name='' THEN excluded.name ELSE users.name END,
    photo=CASE WHEN users.photo='' THEN excluded.photo ELSE users.photo END, updated_at=excluded.updated_at, last_seen_at=excluded.last_seen_at, deleted_at=NULL`)
    .bind(id, claims.sub, claims.email, claims.name || "", claims.picture || "", now, now, now).run();
  const row = await db.prepare("SELECT id, google_sub, email, name, title, photo, interests FROM users WHERE google_sub=?").bind(claims.sub).first<Record<string, string>>();
  return Response.json({ profile: { id: row?.id, googleSub: row?.google_sub, email: row?.email, name: row?.name, title: row?.title, photo: row?.photo, interests: JSON.parse(row?.interests || "[]") } }, {
    headers: { "Set-Cookie": `${sessionCookie}=${encodeURIComponent(body.credential || "")}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${verified.maxAge}` },
  });
}

export async function GET(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ profile: null }, { status: 401, headers: { "Set-Cookie": `${sessionCookie}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
  const db = (env as unknown as { DB: D1Database }).DB; await db.prepare("UPDATE users SET last_seen_at=? WHERE id=?").bind(Date.now(), user.id).run();
  return Response.json({ profile: user });
}

export async function DELETE() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": `${sessionCookie}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
}
