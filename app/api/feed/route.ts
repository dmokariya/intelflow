export const dynamic = "force-dynamic";

type FeedSource = { name: string; url: string; defaults: string[] };

const sources: FeedSource[] = [
  { name: "Economic Times — Markets", url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", defaults: ["Markets", "Business", "India"] },
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", defaults: ["World"] },
  { name: "BBC US & Canada", url: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml", defaults: ["US", "World"] },
  { name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml", defaults: ["Business", "Markets"] },
  { name: "BBC Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", defaults: ["Technology"] },
  { name: "BBC Science", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", defaults: ["Science", "World"] },
  { name: "BBC India", url: "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml", defaults: ["India", "World"] },
  { name: "The Hindu — India", url: "https://www.thehindu.com/news/national/feeder/default.rss", defaults: ["India"] },
  { name: "The Indian Express", url: "https://indianexpress.com/section/india/feed/", defaults: ["India"] },
  { name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms", defaults: ["India"] },
  { name: "New York Times — US", url: "https://rss.nytimes.com/services/xml/rss/nyt/US.xml", defaults: ["US", "World"] },
  { name: "New York Times — Business", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", defaults: ["Business", "Markets", "US"] },
  { name: "New York Times — Technology", url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", defaults: ["Technology", "US"] },
  { name: "US Federal Reserve", url: "https://www.federalreserve.gov/feeds/press_all.xml", defaults: ["US", "Economy", "Regulation"] },
  { name: "US SEC", url: "https://www.sec.gov/news/pressreleases.rss", defaults: ["US", "Markets", "Regulation"] },
  { name: "NASA", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", defaults: ["Science", "Technology"] },
];

const tagRules: Record<string, string[]> = {
  AI: ["artificial intelligence", " ai ", "openai", "machine learning", "chatgpt", "gemini", "nvidia", "language model"],
  India: ["india", "indian", "delhi", "mumbai", "bengaluru", "gujarat", "parliament", "rupee"],
  US: ["united states", "u.s.", "american", "america", "washington", "wall street", "federal reserve", "white house"],
  Markets: ["market", "stocks", "shares", "sensex", "nifty", "investor", "inflation", "interest rate"],
  Economy: ["economy", "gdp", "inflation", "employment", "jobs report", "monetary policy", "fiscal", "tariff"],
  Regulation: ["regulator", "regulation", "sebi", "sec ", "federal reserve", "rbi", "circular", "enforcement"],
  "Personal Finance": ["personal finance", "mutual fund", "retirement", "pension", "insurance", "tax", "savings"],
  Energy: ["energy", "oil", "gas", "renewable", "solar", "power sector"],
  Technology: ["technology", "software", "internet", "chip", "smartphone", "cyber", "digital", "app"],
  Business: ["business", "company", "economy", "bank", "revenue", "profit", "trade", "industry"],
  Startups: ["startup", "venture", "funding", "founder", "seed round"],
  World: ["world", "global", "international", "united states", "europe", "china", "ukraine", "russia"],
  Science: ["science", "research", "space", "climate", "nasa", "satellite", "study"],
  Health: ["health", "medical", "hospital", "disease", "doctor", "vaccine", "nutrition"],
  Cricket: ["cricket", "test match", "ipl", "bcci", "wicket", "innings"],
  Sports: ["sport", "football", "tennis", "match", "tournament", "championship"],
  Entertainment: ["film", "cinema", "actor", "music", "bollywood", "television", "streaming"],
};

const fallbacks = [
  "linear-gradient(135deg,#3c2a76,#805fd8)",
  "linear-gradient(135deg,#173f59,#2b84a5)",
  "linear-gradient(135deg,#78401e,#d98c3c)",
];

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

function field(item: string, name: string) {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decode(match[1]) : "";
}

function attr(item: string, element: string, attribute: string) {
  const match = item.match(new RegExp(`<${element}[^>]*${attribute}=["']([^"']+)["'][^>]*>`, "i"));
  return match?.[1]?.replace(/&amp;/g, "&") ?? "";
}

function summarise(description: string) {
  const words = decode(description).split(" ").filter(Boolean);
  const brief = words.slice(0, 68).join(" ");
  if (!brief) return "Open the original report for the latest details and complete context.";
  return `${brief}${words.length > 68 ? "…" : ""}`;
}

function assignTags(title: string, description: string, defaults: string[]) {
  const text = ` ${title} ${description} `.toLowerCase();
  const matches = Object.entries(tagRules)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([tag]) => tag);
  return Array.from(new Set([...matches, ...defaults])).slice(0, 4);
}

async function readBounded(response: Response, limit = 2_000_000) {
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
      await reader.cancel("Feed exceeded size limit");
      return "";
    }
    output += decoder.decode(value, { stream: true });
  }
  return output + decoder.decode();
}

async function collect(source: FeedSource) {
  try {
    const response = await fetch(source.url, { headers: { Accept: "application/rss+xml, application/xml, text/xml", "User-Agent": "IntelFlow/0.1 (+https://intelflow.in)" }, signal: AbortSignal.timeout(2500) });
    if (!response.ok) return [];
    const xml = await readBounded(response);
    if (!xml) return [];
    return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0, 10).map((match) => {
      const item = match[1];
      const title = field(item, "title");
      const description = field(item, "description") || field(item, "content:encoded");
      const link = field(item, "link") || attr(item, "atom:link", "href");
      const published = field(item, "pubDate") || field(item, "dc:date");
      const image = attr(item, "media:content", "url") || attr(item, "media:thumbnail", "url") || attr(item, "enclosure", "url") || item.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || "";
      return { title, description, link, published, image, source };
    }).filter((story) => story.title && story.link);
  } catch {
    return [];
  }
}

export async function GET() {
  const batches = await Promise.all(sources.map(collect));
  const seen = new Set<string>();
  const now = Date.now();
  const stories = batches.flat().filter((story) => {
    const key = story.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).filter((story) => {
    const timestamp = Date.parse(story.published);
    return !Number.isFinite(timestamp) || timestamp > now - 7 * 86_400_000;
  }).sort((a, b) => {
    const relevance = (story: typeof a) => {
      const tags = assignTags(story.title, story.description, story.source.defaults);
      return (Number.isFinite(Date.parse(story.published)) ? Date.parse(story.published) : now) + tags.filter((tag) => ["India", "US", "Markets", "Economy", "Regulation"].includes(tag)).length * 3_600_000;
    };
    return relevance(b) - relevance(a);
  }).slice(0, 60).map((story, index) => {
    const timestamp = Date.parse(story.published);
    const hours = Number.isFinite(timestamp) ? Math.max(0, Math.round((now - timestamp) / 3_600_000)) : 0;
    return {
      id: Math.abs([...story.link].reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0)),
      title: story.title,
      summary: summarise(story.description),
      source: story.source.name,
      sourceUrl: story.link,
      age: hours < 1 ? "Just now" : hours < 24 ? `${hours} hr ago` : `${Math.round(hours / 24)}d ago`,
      readTime: "1 min brief",
      tags: assignTags(story.title, story.description, story.source.defaults),
      image: story.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
      imageFallback: fallbacks[index % fallbacks.length],
      accent: "#6747e8",
      coverage: 1,
    };
  });
  return Response.json({ stories, sources: sources.length, generatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "public, max-age=30, s-maxage=120, stale-while-revalidate=300" } });
}
