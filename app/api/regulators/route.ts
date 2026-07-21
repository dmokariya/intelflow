export const dynamic = "force-dynamic";

type Authority = "SEBI" | "AMFI" | "RBI" | "IRDAI" | "PFRDA";
type Source = { authority: Authority; url: string; kind: "rss" | "html" };

const sources: Source[] = [
  { authority: "SEBI", url: "https://www.sebi.gov.in/sebirss.xml", kind: "rss" },
  { authority: "RBI", url: "https://rbi.org.in/notifications_rss.xml", kind: "rss" },
  { authority: "AMFI", url: "https://www.amfiindia.com/distributor/amfi-circulars", kind: "html" },
  { authority: "IRDAI", url: "https://irdai.gov.in/circulars", kind: "html" },
  { authority: "PFRDA", url: "https://www.pfrda.org.in/web/pfrda/regulatory-framework/circulars/active-circulars", kind: "html" },
];

const relevantWords = /circular|notification|guideline|master|advisory|regulation|compliance|disclosure|expense|ratio|commission|distributor|intermediar|investor|insurance|pension|nps|arn|euin|kyc|mutual fund/i;

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ").trim();
}

function field(item: string, name: string) {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function normaliseUrl(href: string, base: string) {
  try {
    const url = new URL(decodeHtml(href), base);
    if (url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function titleFromUrl(url: string) {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() || "")
      .replace(/\.pdf$/i, "").replace(/[+_-]+/g, " ").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

function parseDate(value: string) {
  const candidates = [
    value.match(/\b\d{1,2}[-/.]\d{1,2}[-/.]\d{4}\b/)?.[0],
    value.match(/\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b/i)?.[0],
  ].filter(Boolean) as string[];
  for (const candidate of candidates) {
    const timestamp = Date.parse(candidate.replace(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/, "$2/$1/$3"));
    if (Number.isFinite(timestamp)) return new Date(timestamp).toISOString();
  }
  return "";
}

function classify(title: string) {
  const text = title.toLowerCase();
  if (/expense ratio|\bter\b|total expense/.test(text)) return "Expense ratio / TER";
  if (/advertis|social media|communication|disclosure/.test(text)) return "Client communication";
  if (/kyc|know your client|aml|money laundering/.test(text)) return "KYC / AML";
  if (/arn|euin|distributor|intermediar|commission/.test(text)) return "Distributor compliance";
  if (/insurance|insurer|policyholder|claim/.test(text)) return "Insurance";
  if (/pension|\bnps\b|subscriber/.test(text)) return "Pension / NPS";
  if (/interest rate|repo|liquidity|bank|credit/.test(text)) return "Banking / rates";
  return "Regulatory update";
}

function audienceFor(title: string, authority: Authority) {
  const text = title.toLowerCase();
  if (/distributor|mfd|arn|euin|commission/.test(text)) return "mutual fund distributors";
  if (/investor|unitholder|client|subscriber|policyholder/.test(text)) return "investors and clients";
  if (/insurer|insurance|agent/.test(text)) return "insurance participants";
  if (/pension|\bnps\b/.test(text)) return "pension and NPS participants";
  if (/bank|lender|credit/.test(text)) return "regulated financial entities";
  return authority === "AMFI" ? "mutual fund distributors" : "regulated entities and financial professionals";
}

function makeUpdate(authority: Authority, title: string, url: string, date = "") {
  const category = classify(title);
  const audience = audienceFor(title, authority);
  const id = Math.abs([...`${authority}:${url}`].reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0));
  return {
    id: `${authority.toLowerCase()}-${id}`,
    authority,
    title,
    url,
    publishedAt: date,
    documentType: /\.pdf(?:$|\?)/i.test(url) ? "PDF" : "Official page",
    category,
    audience,
    brief: `${category} for ${audience}. Open the official source or scan the document before using it in a client or compliance communication.`,
  };
}

async function readBounded(response: Response, limit = 3_000_000) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let output = "";
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > limit) {
      await reader.cancel("Official page exceeded size limit");
      return "";
    }
    output += decoder.decode(value, { stream: true });
  }
  return output + decoder.decode();
}

function parseRss(xml: string, source: Source) {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0, 12).map((match) => {
    const item = match[1];
    const title = field(item, "title");
    const url = normaliseUrl(field(item, "link") || field(item, "guid"), source.url);
    const date = parseDate(field(item, "pubDate") || field(item, "dc:date"));
    return title && url ? makeUpdate(source.authority, title, url, date) : null;
  }).filter(Boolean);
}

function parseHtml(html: string, source: Source) {
  const updates: ReturnType<typeof makeUpdate>[] = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = normaliseUrl(match[1], source.url);
    if (!url || seen.has(url)) continue;
    let title = decodeHtml(match[2]);
    if (!title || /^(pdf|view|download|read more|more)$/i.test(title)) title = titleFromUrl(url);
    if (title.length < 16 || (!relevantWords.test(title) && !/\.pdf(?:$|\?)/i.test(url))) continue;
    if (/logo|privacy|terms|tender|career|archive/i.test(title)) continue;
    const offset = match.index || 0;
    const nearby = decodeHtml(html.slice(Math.max(0, offset - 220), Math.min(html.length, offset + match[0].length + 260)));
    updates.push(makeUpdate(source.authority, title.slice(0, 220), url, parseDate(nearby)));
    seen.add(url);
    if (updates.length >= 10) break;
  }
  return updates;
}

async function collect(source: Source) {
  const startedAt = Date.now();
  try {
    const response = await fetch(source.url, {
      headers: { Accept: source.kind === "rss" ? "application/rss+xml, application/xml, text/xml" : "text/html,application/xhtml+xml", "User-Agent": "IntelFlow-Regulator-Watch/1.0 (+https://intelflow.in)" },
      signal: AbortSignal.timeout(6500),
    });
    if (!response.ok) return { updates: [], health: { authority: source.authority, status: `HTTP ${response.status}`, count: 0, responseMs: Date.now() - startedAt, url: source.url } };
    const body = await readBounded(response);
    const updates = body ? (source.kind === "rss" ? parseRss(body, source) : parseHtml(body, source)) : [];
    return { updates, health: { authority: source.authority, status: updates.length ? "live" : "no machine-readable items", count: updates.length, responseMs: Date.now() - startedAt, url: source.url } };
  } catch (error) {
    const status = error instanceof Error && /timeout/i.test(error.name + error.message) ? "timeout" : "unavailable";
    return { updates: [], health: { authority: source.authority, status, count: 0, responseMs: Date.now() - startedAt, url: source.url } };
  }
}

export async function GET() {
  const batches = await Promise.all(sources.map(collect));
  const updates = batches.flatMap((batch) => batch.updates)
    .filter((update, index, all) => all.findIndex((candidate) => candidate.url === update.url || (candidate.authority === update.authority && candidate.title === update.title)) === index)
    .sort((left, right) => Date.parse(right.publishedAt || "1970-01-01") - Date.parse(left.publishedAt || "1970-01-01"))
    .slice(0, 35);
  const sourceHealth = batches.map((batch) => batch.health);
  return Response.json({
    updates,
    sourceHealth,
    generatedAt: new Date().toISOString(),
    method: "Official RSS and official listing pages",
  }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=900, stale-while-revalidate=21600" } });
}
