export const dynamic = "force-dynamic";

type FeedCategory = "regulation" | "india-markets" | "personal-finance" | "us-markets" | "economy" | "business" | "technology" | "world";
type FeedSource = {
  name: string;
  url: string;
  defaults: string[];
  category: FeedCategory;
  tier: 1 | 2 | 3;
  maxItems?: number;
};

type RawStory = {
  title: string;
  description: string;
  link: string;
  published: string;
  image: string;
  source: FeedSource;
};

const sources: FeedSource[] = [
  { name: "SEBI — Official updates", url: "https://www.sebi.gov.in/sebirss.xml", defaults: ["Regulation", "India", "Markets"], category: "regulation", tier: 3, maxItems: 18 },
  { name: "RBI — Press releases", url: "https://rbi.org.in/pressreleases_rss.xml", defaults: ["Regulation", "India", "Economy"], category: "regulation", tier: 3, maxItems: 18 },
  { name: "RBI — Notifications", url: "https://rbi.org.in/notifications_rss.xml", defaults: ["Regulation", "India", "Economy"], category: "regulation", tier: 3, maxItems: 18 },
  { name: "Economic Times — Markets", url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", defaults: ["Markets", "Business", "India"], category: "india-markets", tier: 2, maxItems: 18 },
  { name: "Economic Times — Economy", url: "https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms", defaults: ["Economy", "Business", "India"], category: "economy", tier: 2, maxItems: 16 },
  { name: "Economic Times — Mutual Funds", url: "https://economictimes.indiatimes.com/mf/rssfeeds/359241701.cms", defaults: ["Personal Finance", "Markets", "India"], category: "personal-finance", tier: 2, maxItems: 18 },
  { name: "Economic Times — Industry", url: "https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms", defaults: ["Business", "India"], category: "business", tier: 2, maxItems: 14 },
  { name: "Economic Times — Wealth", url: "https://economictimes.indiatimes.com/wealth/rssfeeds/837555174.cms", defaults: ["Personal Finance", "India"], category: "personal-finance", tier: 2, maxItems: 14 },
  { name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml", defaults: ["Business", "Markets"], category: "business", tier: 2 },
  { name: "BBC US & Canada", url: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml", defaults: ["US", "World"], category: "us-markets", tier: 2 },
  { name: "BBC Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", defaults: ["Technology"], category: "technology", tier: 2 },
  { name: "BBC India", url: "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml", defaults: ["India", "World"], category: "world", tier: 2 },
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", defaults: ["World"], category: "world", tier: 2 },
  { name: "BBC Science", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", defaults: ["Science", "World"], category: "technology", tier: 2 },
  { name: "The Hindu — India", url: "https://www.thehindu.com/news/national/feeder/default.rss", defaults: ["India"], category: "world", tier: 2 },
  { name: "The Indian Express", url: "https://indianexpress.com/section/india/feed/", defaults: ["India"], category: "world", tier: 2 },
  { name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms", defaults: ["India"], category: "world", tier: 1 },
  { name: "New York Times — Business", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", defaults: ["Business", "Markets", "US"], category: "us-markets", tier: 2 },
  { name: "New York Times — US", url: "https://rss.nytimes.com/services/xml/rss/nyt/US.xml", defaults: ["US", "World"], category: "us-markets", tier: 2 },
  { name: "New York Times — Technology", url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", defaults: ["Technology", "US"], category: "technology", tier: 2 },
  { name: "US Federal Reserve", url: "https://www.federalreserve.gov/feeds/press_all.xml", defaults: ["Regulation", "US", "Economy"], category: "regulation", tier: 3 },
  { name: "US SEC", url: "https://www.sec.gov/news/pressreleases.rss", defaults: ["Regulation", "US", "Markets"], category: "regulation", tier: 3 },
  { name: "NPR — Business", url: "https://feeds.npr.org/1006/rss.xml", defaults: ["Business", "US"], category: "us-markets", tier: 2 },
  { name: "CNBC — Top News", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", defaults: ["Business", "Markets", "US"], category: "us-markets", tier: 2 },
  { name: "NASA", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", defaults: ["Science", "Technology"], category: "technology", tier: 3 },
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

const impactKeywords = [
  "monetary policy", "interest rate", "repo rate", "inflation", "gdp", "budget", "tax", "tariff",
  "sebi", "rbi", "federal reserve", "sec ", "circular", "regulation", "mutual fund", "pension",
  "insurance", "nifty", "sensex", "rupee", "bond", "yield", "earnings", "merger", "acquisition",
  "ipo", "liquidity", "oil", "trade deal", "employment", "jobs report",
];

const promotionalPatterns = [
  "should you buy", "buy the dip", "multibagger", "target price", "stocks to buy", "top stocks",
  "before everyone else", "could make you rich", "sure-shot", "guaranteed return",
];

const routineOfficialPatterns = ["auction of", "tender", "monetary penalty on", "holiday under"];
const duplicateStopWords = new Set(["about", "after", "again", "against", "amid", "among", "before", "being", "from", "have", "into", "more", "over", "says", "that", "their", "this", "with", "will", "your", "india", "indian", "latest", "news"]);

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
  return Array.from(new Set([...defaults, ...matches])).slice(0, 4);
}

function timestampOf(story: RawStory, fallback: number) {
  const timestamp = Date.parse(story.published);
  return Number.isFinite(timestamp) ? timestamp : fallback;
}

function primaryCategory(story: RawStory, tags: string[]): FeedCategory {
  const text = `${story.title} ${story.description}`.toLowerCase();
  if (story.source.category === "regulation" || tags.includes("Regulation")) return "regulation";
  if (tags.includes("Personal Finance") || /mutual fund|retirement|pension|insurance|income tax|savings/.test(text)) return "personal-finance";
  if (story.source.category === "india-markets" || (tags.includes("India") && tags.includes("Markets"))) return "india-markets";
  if (story.source.category === "us-markets" || (tags.includes("US") && tags.includes("Markets"))) return "us-markets";
  return story.source.category;
}

function importanceScore(story: RawStory, tags: string[], now: number) {
  const text = ` ${story.title} ${story.description} `.toLowerCase();
  const ageHours = Math.max(0, (now - timestampOf(story, now - 36 * 3_600_000)) / 3_600_000);
  const freshness = Math.max(0, 54 - ageHours * 1.15);
  const impact = Math.min(30, impactKeywords.filter((keyword) => text.includes(keyword)).length * 5);
  const authority = story.source.tier * 11;
  const categoryBonus: Record<FeedCategory, number> = {
    regulation: 18,
    "india-markets": 15,
    "personal-finance": 14,
    "us-markets": 10,
    economy: 13,
    business: 7,
    technology: 3,
    world: 0,
  };
  const quality = story.description.length > 150 ? 6 : story.description.length > 60 ? 2 : -8;
  const promotionalPenalty = promotionalPatterns.some((pattern) => text.includes(pattern)) ? 24 : 0;
  const routinePenalty = routineOfficialPatterns.some((pattern) => text.includes(pattern)) ? 12 : 0;
  return freshness + impact + authority + categoryBonus[primaryCategory(story, tags)] + quality - promotionalPenalty - routinePenalty;
}

function duplicateTokens(title: string) {
  return new Set(title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((word) => word.length > 3 && !duplicateStopWords.has(word)));
}

function isNearDuplicate(leftTokens: Set<string>, rightTokens: Set<string>) {
  if (!leftTokens.size || !rightTokens.size) return false;
  let overlap = 0;
  leftTokens.forEach((token) => { if (rightTokens.has(token)) overlap += 1; });
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return overlap >= 3 && overlap / union >= 0.58;
}

async function readBounded(response: Response, limit = 4_000_000) {
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
  const startedAt = Date.now();
  try {
    const response = await fetch(source.url, { headers: { Accept: "application/rss+xml, application/xml, text/xml", "User-Agent": "IntelFlow/0.2 (+https://intelflow.in)" }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return { stories: [] as RawStory[], health: { name: source.name, status: `HTTP ${response.status}`, count: 0, responseMs: Date.now() - startedAt } };
    const xml = await readBounded(response);
    if (!xml) return { stories: [] as RawStory[], health: { name: source.name, status: "empty", count: 0, responseMs: Date.now() - startedAt } };
    const rssItems = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)];
    const atomItems = rssItems.length ? [] : [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)];
    const stories = [...rssItems, ...atomItems].slice(0, source.maxItems || 14).map((match) => {
      const item = match[1];
      const title = field(item, "title");
      const description = field(item, "description") || field(item, "summary") || field(item, "content:encoded") || field(item, "content");
      const link = field(item, "link") || attr(item, "atom:link", "href") || attr(item, "link", "href");
      const published = field(item, "pubDate") || field(item, "dc:date") || field(item, "published") || field(item, "updated");
      const image = attr(item, "media:content", "url") || attr(item, "media:thumbnail", "url") || attr(item, "enclosure", "url") || item.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || "";
      return { title, description, link, published, image, source };
    }).filter((story) => story.title && story.link);
    return { stories, health: { name: source.name, status: stories.length ? "live" : "empty", count: stories.length, responseMs: Date.now() - startedAt } };
  } catch (error) {
    const status = error instanceof Error && /timeout/i.test(error.name + error.message) ? "timeout" : "unavailable";
    return { stories: [] as RawStory[], health: { name: source.name, status, count: 0, responseMs: Date.now() - startedAt } };
  }
}

type RankedStory = RawStory & { tags: string[]; score: number; category: FeedCategory; coverage: number; duplicateKey: string; duplicateWords: Set<string> };

function clusterAndRank(stories: RawStory[], now: number) {
  const ranked = stories.filter((story) => {
    const timestamp = Date.parse(story.published);
    return !Number.isFinite(timestamp) || (timestamp > now - 7 * 86_400_000 && timestamp < now + 86_400_000);
  }).map((story): RankedStory => {
    const tags = assignTags(story.title, story.description, story.source.defaults);
    return {
      ...story,
      tags,
      category: primaryCategory(story, tags),
      score: importanceScore(story, tags, now),
      coverage: 1,
      duplicateKey: story.title.toLowerCase().replace(/[^a-z0-9]/g, ""),
      duplicateWords: duplicateTokens(story.title),
    };
  }).sort((a, b) => b.score - a.score);

  const clusters: RankedStory[] = [];
  ranked.forEach((story) => {
    const existing = clusters.find((candidate) => {
      const publishedClose = Math.abs(timestampOf(candidate, now) - timestampOf(story, now)) < 72 * 3_600_000;
      return story.duplicateKey === candidate.duplicateKey || (publishedClose && isNearDuplicate(candidate.duplicateWords, story.duplicateWords));
    });
    if (existing) {
      existing.coverage += 1;
      existing.score += 4;
      if (!existing.image && story.image) existing.image = story.image;
      return;
    }
    clusters.push(story);
  });
  return clusters.sort((a, b) => b.score - a.score);
}

function balanceTopStories(stories: RankedStory[], limit = 80) {
  const openingSequence: FeedCategory[] = [
    "regulation", "india-markets", "personal-finance", "us-markets", "economy",
    "business", "india-markets", "personal-finance", "regulation", "us-markets",
    "india-markets", "economy", "personal-finance", "business", "regulation",
    "india-markets", "us-markets", "technology", "world", "india-markets",
  ];
  const selected: RankedStory[] = [];
  const used = new Set<string>();
  const sourceCounts = new Map<string, number>();
  const add = (story?: RankedStory) => {
    if (!story || used.has(story.link)) return false;
    selected.push(story);
    used.add(story.link);
    sourceCounts.set(story.source.name, (sourceCounts.get(story.source.name) || 0) + 1);
    return true;
  };

  openingSequence.forEach((category) => {
    const candidate = stories.find((story) => story.category === category && !used.has(story.link) && (sourceCounts.get(story.source.name) || 0) < 3);
    add(candidate);
  });
  stories.forEach((story) => {
    if (selected.length < 20 && (sourceCounts.get(story.source.name) || 0) < 3) add(story);
  });
  stories.forEach((story) => {
    if (selected.length < limit) add(story);
  });
  return selected.slice(0, limit);
}

export async function GET() {
  const batches = await Promise.all(sources.map(collect));
  const now = Date.now();
  const ranked = clusterAndRank(batches.flatMap((batch) => batch.stories), now);
  const ordered = balanceTopStories(ranked);
  const stories = ordered.map((story, index) => {
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
      tags: story.tags,
      image: story.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
      imageFallback: fallbacks[index % fallbacks.length],
      accent: "#6747e8",
      coverage: story.coverage,
      category: story.category,
      importance: Math.round(story.score),
    };
  });
  const sourceHealth = batches.map((batch) => batch.health);
  return Response.json({
    stories,
    sources: sources.length,
    activeSources: sourceHealth.filter((source) => source.status === "live").length,
    sourceHealth,
    generatedAt: new Date().toISOString(),
  }, { headers: { "Cache-Control": "public, max-age=20, s-maxage=60, stale-while-revalidate=120" } });
}
