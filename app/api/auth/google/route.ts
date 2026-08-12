export const dynamic = "force-dynamic";

const googleClientId = "530840408871-o2dq3b2bfo4346n5at0i44f7oa526h44.apps.googleusercontent.com";
const cookieName = "intelflow_google_session";

type GoogleClaims = {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  exp?: string | number;
};

async function verifyGoogleCredential(credential: string) {
  if (!credential || credential.length > 5000) return null;
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) return null;
  const claims = await response.json() as GoogleClaims;
  const expiry = Number(claims.exp || 0);
  if (claims.aud !== googleClientId || !claims.sub || !claims.email || claims.email_verified === false || claims.email_verified === "false" || expiry * 1000 <= Date.now()) return null;
  return {
    profile: { name: claims.name || "", title: "", photo: claims.picture || "", email: claims.email, googleSub: claims.sub },
    maxAge: Math.max(0, Math.min(3600, expiry - Math.floor(Date.now() / 1000))),
  };
}

function cookieValue(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) || "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { credential?: string };
  const verified = await verifyGoogleCredential(body.credential || "");
  if (!verified) return Response.json({ error: "Google sign-in could not be verified." }, { status: 401 });
  return Response.json({ profile: verified.profile }, {
    headers: { "Set-Cookie": `${cookieName}=${encodeURIComponent(body.credential || "")}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${verified.maxAge}` },
  });
}

export async function GET(request: Request) {
  const credential = decodeURIComponent(cookieValue(request));
  const verified = await verifyGoogleCredential(credential);
  if (!verified) return Response.json({ profile: null }, { status: 401, headers: { "Set-Cookie": `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
  return Response.json({ profile: verified.profile });
}

export async function DELETE() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
}

