import { env } from "cloudflare:workers";

export const googleClientId = "530840408871-o2dq3b2bfo4346n5at0i44f7oa526h44.apps.googleusercontent.com";
export const sessionCookie = "intelflow_google_session";

export type UserProfile = { id: string; name: string; title: string; photo: string; email: string; googleSub: string };
type Claims = { aud?: string; sub?: string; email?: string; email_verified?: string | boolean; name?: string; picture?: string; exp?: string | number };

export function readSession(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const value = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookie}=`))?.slice(sessionCookie.length + 1) || "";
  try { return decodeURIComponent(value); } catch { return ""; }
}

export async function verifyCredential(credential: string) {
  if (!credential || credential.length > 5000) return null;
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000) });
  if (!response.ok) return null;
  const claims = await response.json() as Claims;
  const expiry = Number(claims.exp || 0);
  if (claims.aud !== googleClientId || !claims.sub || !claims.email || claims.email_verified === false || claims.email_verified === "false" || expiry * 1000 <= Date.now()) return null;
  return { claims, maxAge: Math.max(0, Math.min(3600, expiry - Math.floor(Date.now() / 1000))) };
}

export async function currentUser(request: Request) {
  const verified = await verifyCredential(readSession(request));
  if (!verified) return null;
  const db = (env as unknown as { DB: D1Database }).DB;
  const row = await db.prepare("SELECT id, google_sub, email, name, title, photo FROM users WHERE google_sub = ? AND deleted_at IS NULL").bind(verified.claims.sub).first<Record<string, string>>();
  if (!row) return null;
  return { id: row.id, googleSub: row.google_sub, email: row.email, name: row.name, title: row.title, photo: row.photo } satisfies UserProfile;
}

export function isAdmin(user: UserProfile) {
  const configured = String((env as unknown as { ADMIN_EMAILS?: string }).ADMIN_EMAILS || "").toLowerCase().split(",").map((email) => email.trim()).filter(Boolean);
  return configured.includes(user.email.toLowerCase());
}
