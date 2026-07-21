import { NextRequest, NextResponse } from "next/server";
import { trustedPublisherUrl } from "../../../lib/trusted-publishers";

export const dynamic = "force-dynamic";

const cacheHeaders = {
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
};

function decodeEntities(value: string) {
  const named: Record<string, string> = { amp: "&", quot: "\"", apos: "'", lt: "<", gt: ">", nbsp: " " };
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => named[name.toLowerCase()] ?? match);
}

function cleanText(value: string) {
  return decodeEntities(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function conciseContext(value: string) {
  const text = cleanText(value).replace(/^(updated|published)\s*:?\s*/i, "");
  if (text.length < 35) return "";
  const sentences = text.match(/[^.!?]+[.!?]+(?:[\"'’”)]*)|[^.!?]+$/g)?.map((item) => item.trim()) ?? [];
  const useful = sentences.filter((sentence) => sentence.length >= 45 && !/cookies?|subscribe|newsletter|sign in/i.test(sentence));
  const first = useful[0] || text;
  const second = useful[1];
  const combined = second && `${first} ${second}`.length <= 280 ? `${first} ${second}` : first;
  return combined.length > 280 ? `${combined.slice(0, 277).trimEnd()}…` : combined;
}

function jsonLdText(html: string) {
  const scripts = html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scripts) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const stack: unknown[] = [parsed];
      let inspected = 0;
      let description = "";
      while (stack.length && inspected < 120) {
        const item = stack.shift();
        inspected += 1;
        if (!item || typeof item !== "object") continue;
        if (Array.isArray(item)) {
          stack.push(...item.slice(0, 30));
          continue;
        }
        const record = item as Record<string, unknown>;
        if (typeof record.articleBody === "string" && record.articleBody.length > 60) return record.articleBody;
        if (!description && typeof record.description === "string" && record.description.length > 45) description = record.description;
        stack.push(...Object.values(record).filter((value) => value && typeof value === "object").slice(0, 30));
      }
      if (description) return description;
    } catch {
      // Some publishers emit malformed JSON-LD; metadata and paragraphs remain available below.
    }
  }
  return "";
}

function metaDescription(html: string) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes: Record<string, string> = {};
    for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)) attributes[match[1].toLowerCase()] = match[3];
    const key = (attributes.property || attributes.name || "").toLowerCase();
    if ((key === "og:description" || key === "description" || key === "twitter:description") && attributes.content) {
      const text = cleanText(attributes.content);
      if (text.length > 45) return text;
    }
  }
  return "";
}

function paragraphText(html: string) {
  return Array.from(html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))
    .map((match) => cleanText(match[1]))
    .filter((text) => text.length >= 65 && !/cookies?|subscribe|newsletter|sign in|privacy policy/i.test(text))
    .slice(0, 3)
    .join(" ");
}

async function readBounded(response: Response, maximumBytes = 1_500_000) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let size = 0;
  let value = "";
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    size += result.value.byteLength;
    if (size > maximumBytes) {
      await reader.cancel();
      break;
    }
    value += decoder.decode(result.value, { stream: true });
  }
  return value + decoder.decode();
}

async function fetchPublisherPage(initialUrl: URL) {
  let current = initialUrl;
  for (let hop = 0; hop < 3; hop += 1) {
    if (!trustedPublisherUrl(current)) throw new Error("Publisher URL is not approved");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    try {
      const response = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "IntelFlow/0.2 (+https://intelflow.in)",
        },
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new Error("Publisher redirect was incomplete");
        current = new URL(location, current);
        continue;
      }
      if (!response.ok || !/html|xhtml/i.test(response.headers.get("content-type") || "")) throw new Error("Publisher page was unavailable");
      return await readBounded(response);
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error("Too many publisher redirects");
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("url") || "";
  if (!trustedPublisherUrl(source)) return NextResponse.json({ context: "", method: "unavailable" }, { status: 400, headers: cacheHeaders });
  try {
    const html = await fetchPublisherPage(new URL(source));
    const article = jsonLdText(html);
    const metadata = article ? "" : metaDescription(html);
    const paragraphs = article || metadata ? "" : paragraphText(html);
    const context = conciseContext(article || metadata || paragraphs);
    const method = context ? (article ? "article" : metadata ? "metadata" : "paragraphs") : "unavailable";
    return NextResponse.json({ context, method }, { headers: cacheHeaders });
  } catch {
    return NextResponse.json({ context: "", method: "unavailable" }, { headers: cacheHeaders });
  }
}
