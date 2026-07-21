import { NextRequest, NextResponse } from "next/server";
import { trustedPublisherUrl } from "../../../lib/trusted-publishers";
import { createShareRecord, getShareImageBucket, hashOwnerToken, randomUrlToken } from "../../../lib/share-store";

export const dynamic = "force-dynamic";

type CreateSharePayload = {
  story?: { title?: string; context?: string; actionDo?: string; actionDont?: string; sourceName?: string; sourceUrl?: string };
  profile?: { name?: string; arn?: string; euin?: string; phone?: string; disclaimer?: string; brandColor?: string };
  expiresInDays?: number;
  previewImageData?: string;
};

function clean(value: unknown, maximum: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maximum) : "";
}

function sameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function decodePng(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const binary = atob(match[1]);
  if (binary.length > 900_000) return null;
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function readJson(request: Request, maximumBytes = 1_500_000) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Request body is required");
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    bytes += chunk.value.byteLength;
    if (bytes > maximumBytes) {
      await reader.cancel();
      throw new Error("Request body is too large");
    }
    text += decoder.decode(chunk.value, { stream: true });
  }
  return JSON.parse(text + decoder.decode()) as CreateSharePayload;
}

export async function POST(request: NextRequest) {
  if (!sameOriginRequest(request)) return NextResponse.json({ error: "Cross-site share creation is not allowed." }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 1_500_000) return NextResponse.json({ error: "The preview image is too large." }, { status: 413 });

  try {
    const payload = await readJson(request);
    const title = clean(payload.story?.title, 180);
    const context = clean(payload.story?.context, 360);
    const actionDo = clean(payload.story?.actionDo, 180);
    const actionDont = clean(payload.story?.actionDont, 180);
    const sourceName = clean(payload.story?.sourceName, 100);
    const sourceUrl = clean(payload.story?.sourceUrl, 800);
    const disclaimer = clean(payload.profile?.disclaimer, 600);
    const image = decodePng(payload.previewImageData || "");
    if (!title || !context || !actionDo || !actionDont || !sourceName || !disclaimer || !image || !trustedPublisherUrl(sourceUrl)) {
      return NextResponse.json({ error: "Complete, attributed share content and a valid preview image are required." }, { status: 400 });
    }

    const expiryDays = [7, 30, 90].includes(payload.expiresInDays || 0) ? Number(payload.expiresInDays) : 30;
    const createdAt = Date.now();
    const id = randomUrlToken(9);
    const ownerToken = randomUrlToken(24);
    const imageKey = `shares/${id}.png`;
    const bucket = getShareImageBucket();
    await bucket.put(imageKey, image, { httpMetadata: { contentType: "image/png", cacheControl: "public, max-age=300" } });
    try {
      await createShareRecord({
        id,
        ownerTokenHash: await hashOwnerToken(ownerToken),
        storyTitle: title,
        storyContext: context,
        actionDo,
        actionDont,
        sourceName,
        sourceUrl,
        distributorName: clean(payload.profile?.name, 120),
        arn: clean(payload.profile?.arn, 40),
        euin: clean(payload.profile?.euin, 40),
        phone: clean(payload.profile?.phone, 30),
        disclaimer,
        brandColor: /^#[0-9a-f]{6}$/i.test(payload.profile?.brandColor || "") ? payload.profile!.brandColor! : "#d0aa65",
        imageKey,
        createdAt,
        expiresAt: createdAt + expiryDays * 86_400_000,
      });
    } catch (error) {
      await bucket.delete(imageKey);
      throw error;
    }

    const url = new URL(`/share/${id}`, request.nextUrl.origin).toString();
    return NextResponse.json({ share: { id, url, ownerToken, createdAt, expiresAt: createdAt + expiryDays * 86_400_000, title } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "The share link could not be created. Please try again." }, { status: 500 });
  }
}
