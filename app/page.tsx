"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function trackEvent(name: string, parameters: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...parameters });
}

type Story = {
  id: number;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  age: string;
  readTime: string;
  tags: string[];
  image: string;
  accent: string;
  coverage: number;
};

type AppPage = "feed" | "saved" | "pro";
type ProTab = "desk" | "studio" | "regulators" | "profile";
type StudioTool = "note" | "image";

const appPages: AppPage[] = ["feed", "saved", "pro"];
const proTabs: ProTab[] = ["desk", "studio", "regulators", "profile"];

type DistributorProfile = {
  name: string;
  arn: string;
  euin: string;
  phone: string;
  disclaimer: string;
  brandColor: string;
  logo: string;
};

type TrialState = { startedAt: number; actions: number };
type ShareStats = { views: number; sourceClicks: number; contactClicks: number; expiresAt: number; revokedAt: number | null };
type OwnedShare = { id: string; url: string; ownerToken: string; title: string; createdAt: number; expiresAt: number; stats?: ShareStats };
type CompanyProfile = { ticker: string; name: string; sector: string; aliases: string[] };
type CompanyImpact = {
  ticker: string;
  name: string;
  direction: "Potentially positive" | "Potentially negative" | "Mixed / conditional" | "Uncertain";
  confidence: "High" | "Medium";
  directness: "Direct company event" | "Sector read-through" | "Manually attached";
  mechanism: string;
  verify: string;
  posture: "Watchlist" | "Wait for proof" | "Re-underwrite";
};
type ManualCompanyLinks = Record<string, string[]>;
type RegulatorUpdate = {
  id: string;
  authority: "SEBI" | "AMFI" | "RBI" | "IRDAI" | "PFRDA";
  title: string;
  url: string;
  publishedAt: string;
  documentType: "PDF" | "Official page";
  category: string;
  audience: string;
  brief: string;
};
type RegulatorHealth = { authority: RegulatorUpdate["authority"]; status: string; count: number; responseMs: number; url: string };
type DocumentBrief = {
  method: string;
  extractionStatus: string;
  category: string;
  affectedAudience: string[];
  effectiveDate: string;
  keyPoints: string[];
  action: string;
  disclaimer: string;
  error?: string;
};
const trialDays = 7;
const trialActions = 10;
const trialStorageKey = "intelflow:pro-trial";
const ownedSharesStorageKey = "intelflow:owned-shares";
const companyWatchlistStorageKey = "intelflow:company-watchlist";
const manualCompanyLinksStorageKey = "intelflow:manual-company-links";

function getTrialStatus(trial: TrialState | null) {
  if (!trial) return { locked: false, day: 0, daysRemaining: trialDays, actionsRemaining: trialActions };
  const elapsedDays = Math.max(0, Math.floor((Date.now() - trial.startedAt) / 86_400_000));
  return {
    locked: elapsedDays >= trialDays && trial.actions >= trialActions,
    day: Math.min(trialDays, elapsedDays + 1),
    daysRemaining: Math.max(0, trialDays - elapsedDays),
    actionsRemaining: Math.max(0, trialActions - trial.actions),
  };
}

const defaultDistributorProfile: DistributorProfile = {
  name: "",
  arn: "",
  euin: "",
  phone: "",
  disclaimer: "Mutual fund investments are subject to market risks. Read all scheme-related documents carefully.",
  brandColor: "#d0aa65",
  logo: "",
};

const companyUniverse: CompanyProfile[] = [
  { ticker: "RELIANCE", name: "Reliance Industries", sector: "Energy & diversified", aliases: ["reliance industries", "reliance"] },
  { ticker: "ONGC", name: "ONGC", sector: "Oil & gas", aliases: ["oil and natural gas corporation", "ongc"] },
  { ticker: "IOC", name: "Indian Oil", sector: "Oil marketing", aliases: ["indian oil corporation", "indian oil", "ioc"] },
  { ticker: "INTERGLOBE", name: "InterGlobe Aviation", sector: "Aviation", aliases: ["interglobe aviation", "indigo airlines", "indigo"] },
  { ticker: "ASIANPAINT", name: "Asian Paints", sector: "Paints", aliases: ["asian paints"] },
  { ticker: "GLENMARK", name: "Glenmark Pharmaceuticals", sector: "Pharma", aliases: ["glenmark pharmaceuticals", "glenmark pharma", "glenmark"] },
  { ticker: "SUNPHARMA", name: "Sun Pharmaceutical", sector: "Pharma", aliases: ["sun pharmaceutical", "sun pharma"] },
  { ticker: "DRREDDY", name: "Dr. Reddy's Laboratories", sector: "Pharma", aliases: ["dr. reddy's", "dr reddy's", "dr reddys", "drreddy"] },
  { ticker: "CIPLA", name: "Cipla", sector: "Pharma", aliases: ["cipla"] },
  { ticker: "LUPIN", name: "Lupin", sector: "Pharma", aliases: ["lupin"] },
  { ticker: "TCS", name: "Tata Consultancy Services", sector: "IT services", aliases: ["tata consultancy services", "tcs"] },
  { ticker: "INFY", name: "Infosys", sector: "IT services", aliases: ["infosys", "infy"] },
  { ticker: "HCLTECH", name: "HCLTech", sector: "IT services", aliases: ["hcl technologies", "hcltech", "hcl tech"] },
  { ticker: "WIPRO", name: "Wipro", sector: "IT services", aliases: ["wipro"] },
  { ticker: "HDFCBANK", name: "HDFC Bank", sector: "Banking", aliases: ["hdfc bank"] },
  { ticker: "ICICIBANK", name: "ICICI Bank", sector: "Banking", aliases: ["icici bank"] },
  { ticker: "SBIN", name: "State Bank of India", sector: "Banking", aliases: ["state bank of india", "sbi"] },
  { ticker: "BAJFINANCE", name: "Bajaj Finance", sector: "Consumer finance", aliases: ["bajaj finance"] },
  { ticker: "TATAMOTORS", name: "Tata Motors", sector: "Automobiles", aliases: ["tata motors"] },
  { ticker: "MARUTI", name: "Maruti Suzuki", sector: "Automobiles", aliases: ["maruti suzuki", "maruti"] },
  { ticker: "M&M", name: "Mahindra & Mahindra", sector: "Automobiles", aliases: ["mahindra & mahindra", "mahindra and mahindra"] },
  { ticker: "TATAPOWER", name: "Tata Power", sector: "Power", aliases: ["tata power"] },
  { ticker: "NTPC", name: "NTPC", sector: "Power", aliases: ["ntpc"] },
  { ticker: "HDFCLIFE", name: "HDFC Life", sector: "Insurance", aliases: ["hdfc life"] },
  { ticker: "SBILIFE", name: "SBI Life", sector: "Insurance", aliases: ["sbi life"] },
];

function companyByTicker(ticker: string) {
  return companyUniverse.find((company) => company.ticker === ticker);
}

function companyImpact(company: CompanyProfile, values: Omit<CompanyImpact, "ticker" | "name">): CompanyImpact {
  return { ticker: company.ticker, name: company.name, ...values };
}

function getCompanyImpacts(story: Story, manualTickers: string[] = []) {
  const text = `${story.title} ${story.summary}`.toLowerCase();
  const impacts: CompanyImpact[] = [];
  const add = (impact: CompanyImpact) => {
    if (!impacts.some((item) => item.ticker === impact.ticker)) impacts.push(impact);
  };
  const containsAny = (...terms: string[]) => terms.some((term) => text.includes(term));
  const containsAlias = (alias: string) => alias.length > 4 ? text.includes(alias) : new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);

  companyUniverse.forEach((company) => {
    if (!company.aliases.some(containsAlias)) return;
    const pharmaRegulatory = company.sector === "Pharma" && containsAny("usfda", "u.s. fda", "fda approval", "regulatory approval", "drug approval", "gets nod");
    add(companyImpact(company, pharmaRegulatory ? {
      direction: "Potentially positive", confidence: "High", directness: "Direct company event",
      mechanism: "The reported regulatory milestone may support a product opportunity, subject to launch timing and commercial significance.",
      verify: "Confirm the exact product, entity, market size, competition and launch status in the company or exchange filing.", posture: "Wait for proof",
    } : {
      direction: "Uncertain", confidence: "High", directness: "Direct company event",
      mechanism: "The company is named directly, but the earnings or valuation effect cannot be established from the headline alone.",
      verify: "Check the original filing, affected financial line item, management commentary and whether the market has already reacted.", posture: "Re-underwrite",
    }));
  });

  if (containsAny("crude oil", "oil price", "brent", "opec")) {
    const reliance = companyByTicker("RELIANCE");
    const ongc = companyByTicker("ONGC");
    const interglobe = companyByTicker("INTERGLOBE");
    if (reliance) add(companyImpact(reliance, { direction: "Mixed / conditional", confidence: "Medium", directness: "Sector read-through", mechanism: "Upstream realisations, refining margins and petrochemical spreads can move in different directions.", verify: "Check crude direction, refining and product spreads, inventory effects and management commentary.", posture: "Watchlist" }));
    if (ongc) add(companyImpact(ongc, { direction: "Potentially positive", confidence: "Medium", directness: "Sector read-through", mechanism: "Sustained higher crude can support upstream realisations, subject to policy and production variables.", verify: "Check realised prices, production, windfall taxes or subsidy exposure and the duration of the move.", posture: "Watchlist" }));
    if (interglobe) add(companyImpact(interglobe, { direction: "Potentially negative", confidence: "Medium", directness: "Sector read-through", mechanism: "Aviation turbine fuel is a material operating cost, although fares, hedging and demand can offset part of the pressure.", verify: "Check ATF prices, fare environment, capacity, hedging and management guidance.", posture: "Watchlist" }));
  }

  if (containsAny("repo rate", "interest rate", "rate cut", "rate hike", "liquidity", "rbi policy")) {
    ["HDFCBANK", "BAJFINANCE"].forEach((ticker) => { const company = companyByTicker(ticker); if (company) add(companyImpact(company, { direction: "Mixed / conditional", confidence: "Medium", directness: "Sector read-through", mechanism: "Funding costs, loan growth, deposit competition and margins can respond differently to a rate or liquidity change.", verify: "Check the official policy, transmission timing, asset-liability mix and management margin guidance.", posture: "Watchlist" })); });
  }

  if (containsAny("rupee", "dollar", "currency", "us technology spending", "global technology spending", "it spending")) {
    ["TCS", "INFY"].forEach((ticker) => { const company = companyByTicker(ticker); if (company) add(companyImpact(company, { direction: "Mixed / conditional", confidence: "Medium", directness: "Sector read-through", mechanism: "Export revenue translation may benefit from currency moves, while client budgets and hedging determine the operating effect.", verify: "Check constant-currency growth, deal commentary, cross-currency impact and hedging disclosures.", posture: "Watchlist" })); });
  }

  if (containsAny("electric vehicle", "ev sales", "vehicle demand", "auto sales", "emission norms")) {
    ["TATAMOTORS", "M&M"].forEach((ticker) => { const company = companyByTicker(ticker); if (company) add(companyImpact(company, { direction: "Mixed / conditional", confidence: "Medium", directness: "Sector read-through", mechanism: "Demand, product mix, incentives and transition costs may affect volumes and margins differently.", verify: "Check model-level volumes, incentives, battery costs, market share and margin guidance.", posture: "Watchlist" })); });
  }

  if (containsAny("renewable energy", "power demand", "electricity demand", "solar capacity", "power tariff")) {
    ["NTPC", "TATAPOWER"].forEach((ticker) => { const company = companyByTicker(ticker); if (company) add(companyImpact(company, { direction: "Mixed / conditional", confidence: "Medium", directness: "Sector read-through", mechanism: "Capacity additions, utilisation, tariffs and financing costs determine whether the theme becomes an earnings driver.", verify: "Check commissioned capacity, project returns, tariff orders, fuel availability and debt funding.", posture: "Watchlist" })); });
  }

  manualTickers.forEach((ticker) => {
    const company = companyByTicker(ticker);
    if (company && !impacts.some((impact) => impact.ticker === ticker)) add(companyImpact(company, {
      direction: "Uncertain", confidence: "Medium", directness: "Manually attached",
      mechanism: "A distributor attached this company for further research; IntelFlow has not inferred a directional effect.",
      verify: "Document the transmission channel and verify it against an official company or exchange disclosure.", posture: "Wait for proof",
    }));
  });

  return impacts.sort((a, b) => Number(b.confidence === "High") - Number(a.confidence === "High")).slice(0, 4);
}

function impactSummary(impact: CompanyImpact) {
  return `${impact.name} (${impact.ticker}) — ${impact.direction}. ${impact.mechanism}`;
}

type DailyDeskAction = { id: string; title: string; reason: string; newsTriggered?: boolean };

function buildDailyDeskActions(stories: Story[]) {
  const text = stories.map((story) => `${story.title} ${story.summary}`).join(" ").toLowerCase();
  const actions: DailyDeskAction[] = [
    { id: "morning-five", title: "Read the Morning 5", reason: "Start with the five most relevant market, business and regulatory signals." },
    { id: "company-impact", title: "Review Company Impact", reason: "Check the transmission channel and verification requirement before drawing a conclusion." },
    { id: "regulator-watch", title: "Check official regulator updates", reason: "Use the authority’s own circular or notice as the source of truth." },
    { id: "client-update", title: "Prepare one useful client update", reason: "Keep the client action short, neutral and connected to their existing plan." },
  ];
  const add = (action: DailyDeskAction) => { if (!actions.some((item) => item.id === action.id)) actions.push(action); };
  if (stories.some((story) => story.tags.includes("Regulation"))) add({ id: "news-regulation", title: "Verify today’s regulatory headline", reason: "Confirm the official circular, effective date and affected category before communicating it.", newsTriggered: true });
  if (/(crude oil|oil price|brent|opec)/.test(text)) add({ id: "news-oil", title: "Review crude-sensitive company links", reason: "Separate upstream, refining and input-cost effects instead of applying one direction to every company.", newsTriggered: true });
  if (/(repo rate|interest rate|rate cut|rate hike|rbi policy|liquidity)/.test(text)) add({ id: "news-rates", title: "Check rate and liquidity transmission", reason: "Review funding costs, margins, credit demand and the timing of policy transmission.", newsTriggered: true });
  if (stories.some((story) => story.tags.includes("US"))) add({ id: "news-us", title: "Note the India link from US news", reason: "Identify whether the channel is currency, rates, demand, technology spending or sentiment.", newsTriggered: true });
  if (/(usfda|u\.s\. fda|fda approval|drug approval|gets nod)/.test(text)) add({ id: "news-pharma", title: "Confirm the pharma filing", reason: "Verify the product, company entity, launch status, market opportunity and competition.", newsTriggered: true });
  if (stories.some((story) => getCompanyImpacts(story).some((impact) => impact.confidence === "High"))) add({ id: "news-company", title: "Verify direct company events", reason: "Check the exchange filing and identify the first financial line item that could change.", newsTriggered: true });
  return actions.slice(0, 9);
}

const interests = [
  ["AI", "Artificial Intelligence", "✦"],
  ["India", "India", "IN"],
  ["US", "United States", "US"],
  ["Markets", "Markets", "↗"],
  ["Economy", "Economy", "◒"],
  ["Regulation", "Policy & Regulation", "§"],
  ["Personal Finance", "Personal Finance", "₹"],
  ["Technology", "Technology", "◫"],
  ["Business", "Business", "₹"],
  ["Startups", "Startups", "◌"],
  ["World", "World", "◎"],
  ["Science", "Science", "⌁"],
  ["Energy", "Energy", "◉"],
  ["Health", "Health", "+"],
  ["Cricket", "Cricket", "●"],
  ["Sports", "Sports", "◆"],
  ["Entertainment", "Entertainment", "▷"],
] as const;

const demoStories: Story[] = [
  {
    id: 1,
    title: "India's digital economy enters a new phase of practical AI adoption",
    summary:
      "Indian companies are moving artificial intelligence from experiments into everyday operations. Banking, retail and software firms are focusing on smaller, task-specific systems that can show measurable gains while keeping sensitive data under tighter control.",
    source: "Technology briefing",
    sourceUrl: "https://www.meity.gov.in/",
    age: "18 min ago",
    readTime: "1 min brief",
    tags: ["AI", "India", "Business"],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=82",
    accent: "#7756ff",
    coverage: 8,
  },
  {
    id: 2,
    title: "Markets look to earnings quality as investors weigh the next move",
    summary:
      "Investors are looking beyond headline growth and paying closer attention to margins, cash generation and management guidance. Analysts expect company-specific results to matter more than broad market momentum during the coming sessions.",
    source: "Markets desk",
    sourceUrl: "https://www.bseindia.com/",
    age: "42 min ago",
    readTime: "1 min brief",
    tags: ["Markets", "Business", "India"],
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=82",
    accent: "#ef8e32",
    coverage: 12,
  },
  {
    id: 3,
    title: "A new generation of launch systems is reshaping access to space",
    summary:
      "Reusable rockets and smaller launch vehicles are reducing turnaround times for satellite missions. The shift is opening more opportunities for climate monitoring, communications and scientific research while intensifying competition among launch providers.",
    source: "Science briefing",
    sourceUrl: "https://www.nasa.gov/news/",
    age: "1 hr ago",
    readTime: "1 min brief",
    tags: ["Science", "Technology", "World"],
    image: "https://images.unsplash.com/photo-1517976547714-720226b864c1?auto=format&fit=crop&w=1200&q=82",
    accent: "#2876ea",
    coverage: 6,
  },
  {
    id: 4,
    title: "Indian startups focus on sustainable growth after the funding reset",
    summary:
      "Founders are putting profitability, customer retention and disciplined expansion ahead of growth at any cost. Early-stage activity remains healthy, but investors are asking for clearer economics before backing larger rounds.",
    source: "Startup briefing",
    sourceUrl: "https://www.startupindia.gov.in/",
    age: "2 hrs ago",
    readTime: "1 min brief",
    tags: ["Startups", "Business", "India"],
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82",
    accent: "#13a37f",
    coverage: 9,
  },
  {
    id: 5,
    title: "Cricket teams turn to match-up data ahead of a packed season",
    summary:
      "Coaching teams are using ball-by-ball patterns to plan batting orders, bowling changes and field placements. Data is increasingly shaping preparation, though captains still need to adapt quickly when pitch and weather conditions change.",
    source: "Sports briefing",
    sourceUrl: "https://www.bcci.tv/",
    age: "3 hrs ago",
    readTime: "1 min brief",
    tags: ["Cricket", "Sports", "India"],
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=82",
    accent: "#db3153",
    coverage: 5,
  },
  {
    id: 6,
    title: "Preventive healthcare shifts toward simpler everyday signals",
    summary:
      "Health programmes are placing greater emphasis on sleep, movement, nutrition and regular screening rather than isolated interventions. Researchers caution that consumer devices can support awareness but should not replace clinical diagnosis.",
    source: "Health briefing",
    sourceUrl: "https://www.who.int/india",
    age: "4 hrs ago",
    readTime: "1 min brief",
    tags: ["Health", "Science", "India"],
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=82",
    accent: "#02a7b5",
    coverage: 7,
  },
  {
    id: 7,
    title: "Cities rethink mobility around shorter, cleaner daily journeys",
    summary: "Urban planners are connecting public transport, cycling and walkable neighbourhoods to reduce congestion. The strongest projects treat last-mile access as part of the main network rather than leaving commuters to solve it themselves.",
    source: "India briefing", sourceUrl: "https://mohua.gov.in/", age: "5 hrs ago", readTime: "1 min brief",
    tags: ["India", "Technology", "Health"], image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1200&q=82", accent: "#ef5b3d", coverage: 4,
  },
  {
    id: 8,
    title: "Open-source software gains ground in critical digital infrastructure",
    summary: "Organisations are adopting open tools to improve portability and reduce dependence on individual vendors. Security teams say transparent code helps scrutiny, but dependable maintenance and rapid patching remain essential.",
    source: "Technology briefing", sourceUrl: "https://www.meity.gov.in/", age: "6 hrs ago", readTime: "1 min brief",
    tags: ["Technology", "Business", "World"], image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=82", accent: "#1677c8", coverage: 6,
  },
  {
    id: 9,
    title: "Scientists map new ways to protect water during extreme weather",
    summary: "Research teams are combining satellite observations with local measurements to predict floods and droughts earlier. Better forecasts can help authorities manage reservoirs and issue targeted warnings, provided information reaches communities in time.",
    source: "Science briefing", sourceUrl: "https://www.imd.gov.in/", age: "7 hrs ago", readTime: "1 min brief",
    tags: ["Science", "India", "World"], image: "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=1200&q=82", accent: "#0097a7", coverage: 5,
  },
  {
    id: 10,
    title: "Streaming platforms place bigger bets on distinctive local stories",
    summary: "Entertainment services are expanding regional-language catalogues as audiences respond to stories rooted in specific places. Producers are balancing wider distribution with the need to retain the voice and cultural detail that made each project compelling.",
    source: "Culture briefing", sourceUrl: "https://mib.gov.in/", age: "8 hrs ago", readTime: "1 min brief",
    tags: ["Entertainment", "Business", "India"], image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=82", accent: "#a63fb1", coverage: 7,
  },
];

const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

export default function Home() {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [selected, setSelected] = useState<string[]>(["AI", "India", "Technology", "Markets"]);
  const [activeTag, setActiveTag] = useState("For you");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [page, setPage] = useState<AppPage>("pro");
  const [proTab, setProTab] = useState<ProTab>("desk");
  const [studioTool, setStudioTool] = useState<StudioTool>("note");
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedStories, setFeedStories] = useState<Story[]>(demoStories);
  const [trial, setTrial] = useState<TrialState | null>(null);
  const [profile, setProfile] = useState<DistributorProfile>(defaultDistributorProfile);
  const [explainStory, setExplainStory] = useState<Story | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [activeSources, setActiveSources] = useState(0);
  const [sourceCount, setSourceCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(20);
  const [companyWatchlist, setCompanyWatchlist] = useState<string[]>([]);
  const [manualCompanyLinks, setManualCompanyLinks] = useState<ManualCompanyLinks>({});

  useEffect(() => {
    setOnboarded(storage.get("intelflow:onboarded", false));
    setSelected(storage.get("intelflow:interests", ["AI", "India", "Technology", "Markets"]));
    setBookmarks(storage.get("intelflow:bookmarks", []));
    setCompanyWatchlist(storage.get(companyWatchlistStorageKey, []));
    setManualCompanyLinks(storage.get(manualCompanyLinksStorageKey, {}));
    const savedTrial = storage.get<TrialState | null>(trialStorageKey, null);
    if (savedTrial) setTrial(savedTrial);
    else if (storage.get("intelflow:pro-demo", false)) {
      const migratedTrial = { startedAt: Date.now(), actions: 0 };
      storage.set(trialStorageKey, migratedTrial);
      setTrial(migratedTrial);
    }
    setProfile({ ...defaultDistributorProfile, ...storage.get("intelflow:distributor-profile", defaultDistributorProfile) });
    const applyUrlState = () => {
      const parameters = new URLSearchParams(window.location.search);
      const requestedPage = parameters.get("view") as AppPage | null;
      const requestedTab = parameters.get("tab");
      const nextPage = requestedPage && appPages.includes(requestedPage) ? requestedPage : "pro";
      const legacyStudioTab = requestedTab === "social" || requestedTab === "notes";
      const nextTab = legacyStudioTab ? "studio" : requestedTab && proTabs.includes(requestedTab as ProTab) ? requestedTab as ProTab : "desk";
      const requestedTool = parameters.get("tool");
      setPage(nextPage);
      setProTab(nextTab);
      setStudioTool(requestedTool === "image" || requestedTab === "social" ? "image" : "note");
      setActiveTag(parameters.get("topic") || "For you");
      const requestedLimit = Number(parameters.get("limit") || 20);
      setVisibleCount(Number.isFinite(requestedLimit) ? Math.max(20, Math.min(80, requestedLimit)) : 20);
      if (legacyStudioTab) {
        const canonicalUrl = new URL(window.location.href);
        canonicalUrl.searchParams.set("tab", "studio");
        canonicalUrl.searchParams.set("tool", requestedTab === "social" ? "image" : "note");
        window.history.replaceState({}, "", `${canonicalUrl.pathname}${canonicalUrl.search}${canonicalUrl.hash}`);
      }
    };
    applyUrlState();
    window.addEventListener("popstate", applyUrlState);
    setReady(true);
    loadFeed();
    return () => window.removeEventListener("popstate", applyUrlState);
  }, []);

  useEffect(() => {
    const storyId = new URLSearchParams(window.location.search).get("story");
    if (!storyId) {
      setExplainStory(null);
      return;
    }
    const linkedStory = feedStories.find((story) => String(story.id) === storyId);
    if (linkedStory) setExplainStory(linkedStory);
  }, [feedStories, page, proTab]);

  function loadFeed(force = false) {
    setRefreshing(true);
    fetch(`/api/feed${force ? `?refresh=${Date.now()}` : ""}`, { cache: force ? "no-store" : "default" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Feed unavailable")))
      .then((data: { stories?: Story[]; generatedAt?: string; activeSources?: number; sources?: number }) => {
        if (data.stories?.length) setFeedStories(data.stories);
        if (data.generatedAt) setLastUpdated(new Date(data.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        if (typeof data.activeSources === "number") setActiveSources(data.activeSources);
        if (typeof data.sources === "number") setSourceCount(data.sources);
      })
      .catch(() => undefined)
      .finally(() => setRefreshing(false));
  }

  const rankedStories = useMemo(() => {
    const base = activeTag === "For you" ? feedStories : feedStories.filter((story) => story.tags.includes(activeTag));
    return [...base].sort((a, b) => {
      const score = (story: Story) => story.tags.filter((tag) => selected.includes(tag)).length;
      return score(b) - score(a);
    });
  }, [activeTag, selected, feedStories]);

  const visibleStories = page === "saved" ? feedStories.filter((story) => bookmarks.includes(story.id)) : rankedStories;
  function toggleInterest(tag: string) {
    setSelected((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  function finishOnboarding() {
    if (selected.length < 3) return;
    storage.set("intelflow:onboarded", true);
    storage.set("intelflow:interests", selected);
    trackEvent("onboarding_completed", { interest_count: selected.length });
    setOnboarded(true);
    navigatePro("desk");
  }

  function toggleBookmark(id: number) {
    setBookmarks((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      if (!current.includes(id)) trackEvent("story_bookmarked", { item_id: String(id) });
      storage.set("intelflow:bookmarks", next);
      return next;
    });
  }

  function toggleCompanyWatch(ticker: string) {
    setCompanyWatchlist((current) => {
      const next = current.includes(ticker) ? current.filter((item) => item !== ticker) : [...current, ticker];
      storage.set(companyWatchlistStorageKey, next);
      trackEvent("company_watchlist_updated", { ticker, following: next.includes(ticker) });
      return next;
    });
  }

  function attachCompanyToStory(storyId: number, ticker: string) {
    if (!ticker) return;
    setManualCompanyLinks((current) => {
      const key = String(storyId);
      const nextForStory = Array.from(new Set([...(current[key] || []), ticker]));
      const next = { ...current, [key]: nextForStory };
      storage.set(manualCompanyLinksStorageKey, next);
      trackEvent("company_attached_to_story", { item_id: key, ticker });
      return next;
    });
  }

  function writeAppUrl(nextPage: AppPage, options: { tab?: ProTab; story?: Story | null; topic?: string; tool?: StudioTool } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set("view", nextPage);
    url.searchParams.delete("limit");
    if (nextPage === "pro") {
      url.searchParams.set("tab", options.tab || proTab);
      if (options.story) url.searchParams.set("story", String(options.story.id));
      else url.searchParams.delete("story");
      if ((options.tab || proTab) === "studio") url.searchParams.set("tool", options.tool || studioTool);
      else url.searchParams.delete("tool");
      if ((options.tab || proTab) !== "desk") url.searchParams.delete("impact");
      url.searchParams.delete("topic");
    } else {
      url.searchParams.delete("tab");
      url.searchParams.delete("story");
      url.searchParams.delete("tool");
      url.searchParams.delete("impact");
      const topic = options.topic ?? (nextPage === "feed" ? activeTag : "For you");
      if (nextPage === "feed" && topic !== "For you") url.searchParams.set("topic", topic);
      else url.searchParams.delete("topic");
    }
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function navigate(next: AppPage) {
    setPage(next);
    setVisibleCount(20);
    setMenuOpen(false);
    writeAppUrl(next);
  }

  function navigatePro(nextTab: ProTab, story: Story | null = null, tool: StudioTool = studioTool) {
    setProTab(nextTab);
    setStudioTool(tool);
    setPage("pro");
    setMenuOpen(false);
    setExplainStory(story);
    writeAppUrl("pro", { tab: nextTab, story, tool });
  }

  function chooseTopic(topic: string) {
    setActiveTag(topic);
    setPage("feed");
    setVisibleCount(20);
    writeAppUrl("feed", { topic });
  }

  function showMoreStories() {
    const nextCount = Math.min(80, visibleCount + 20);
    setVisibleCount(nextCount);
    const url = new URL(window.location.href);
    url.searchParams.set("view", page);
    url.searchParams.set("limit", String(nextCount));
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    trackEvent("feed_more_loaded", { visible_count: nextCount, topic: activeTag });
  }

  async function shareStory(story: Story) {
    trackEvent("share", { method: navigator.share ? "native" : "clipboard", content_type: "story", item_id: String(story.id) });
    if (navigator.share) {
      await navigator.share({ title: story.title, text: story.summary, url: story.sourceUrl });
      return;
    }
    await navigator.clipboard?.writeText(story.sourceUrl);
  }

  if (!ready) return <main className="loading-shell" aria-label="Loading IntelFlow" />;

  if (!onboarded) {
    return (
      <main className="onboarding-shell">
        <header className="onboarding-brand"><Brand /></header>
        <section className="onboarding-copy">
          <span className="eyebrow">DISTRIBUTOR INTELLIGENCE</span>
          <h1>What should your<br />daily desk watch?</h1>
          <p>Pick at least three interests. We’ll tune your distributor briefing around them.</p>
        </section>
        <section className="interest-grid" aria-label="Choose your interests">
          {interests.map(([tag, label, icon]) => {
            const isSelected = selected.includes(tag);
            return (
              <button
                key={tag}
                className={`interest-card ${isSelected ? "selected" : ""}`}
                onClick={() => toggleInterest(tag)}
                aria-pressed={isSelected}
              >
                <span className="interest-icon">{icon}</span>
                <span>{label}</span>
                <span className="interest-check">{isSelected ? "✓" : "+"}</span>
              </button>
            );
          })}
        </section>
        <footer className="onboarding-footer">
          <span>{selected.length} selected</span>
          <button disabled={selected.length < 3} onClick={finishOnboarding}>Build my briefing <span>→</span></button>
        </footer>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Brand />
        <span className="distributor-badge">BUILT FOR DISTRIBUTORS</span>
        <div className="top-actions">
          <a className="support-link" href="/contact">Contact</a>
          <button className="avatar-button" aria-label="Open account and site menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{profile.name?.trim().charAt(0).toUpperCase() || "IF"}</button>
        </div>
        {menuOpen && (
          <div className="profile-menu">
            <span className="profile-menu-label">YOUR INTELFLOW</span>
            <strong>{profile.name || "Guest distributor"}</strong>
            <span>Your preferences, profile and trial progress stay on this device.</span>
            <button onClick={() => navigatePro("profile")}>Distributor profile</button>
            <button className="profile-menu-secondary" onClick={() => { storage.set("intelflow:onboarded", false); setMenuOpen(false); setOnboarded(false); }}>Edit feed interests</button>
            <div className="profile-menu-links">
              <a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/disclosure">Disclosure</a><a href="/contact">Contact</a>
            </div>
          </div>
        )}
      </header>

      <nav className="primary-nav" aria-label="Primary navigation">
        <button className={page === "pro" && proTab === "desk" ? "active" : ""} onClick={() => navigatePro("desk")}><span>⌂</span><b>Dashboard</b></button>
        <button className={page === "feed" ? "active" : ""} onClick={() => navigate("feed")}><span>▤</span><b>News</b></button>
        <button className={page === "pro" && proTab === "regulators" ? "active" : ""} onClick={() => navigatePro("regulators")}><span>✓</span><b>Compliance</b></button>
        <button className={page === "pro" && proTab === "studio" ? "active" : ""} onClick={() => navigatePro("studio", explainStory, studioTool)}><span>＋</span><b>Create</b></button>
        <button className={page === "saved" ? "active" : ""} onClick={() => navigate("saved")}><span>☆</span><b>Library</b></button>
      </nav>

      <div className="app-main">

      {page === "feed" && (
        <>
          <section className="welcome-row">
            <div>
              <span className="date-label">LIVE · INDIA + UNITED STATES</span>
              <h1>News intelligence.</h1>
              <p>{visibleStories.length} signals selected for your interests{lastUpdated ? ` · Updated ${lastUpdated}` : ""}{sourceCount ? ` · ${activeSources}/${sourceCount} sources live` : ""}.</p>
            </div>
            <button className={`refresh-feed ${refreshing ? "refreshing" : ""}`} onClick={() => loadFeed(true)} disabled={refreshing}><span>↻</span>{refreshing ? "Updating" : "Refresh"}</button>
          </section>

          <aside className="swarnim-credit" aria-label="IntelFlow by Swarnim Capital">
            <span>IntelFlow is a product of Swarnim Capital</span>
            <a href="https://swarnimcapital.com" target="_blank" rel="noreferrer">Visit Swarnim Capital ↗</a>
          </aside>

          <section className="live-pulse" aria-label="Live briefing pulse">
            <div><i /><span>LIVE PULSE</span></div>
            <p><strong>{feedStories.filter((story) => story.tags.includes("India")).length}</strong> India</p>
            <p><strong>{feedStories.filter((story) => story.tags.includes("Markets")).length}</strong> Markets</p>
            <p><strong>{feedStories.filter((story) => story.tags.includes("Regulation")).length}</strong> Regulatory</p>
            <p><strong>{feedStories.filter((story) => story.tags.includes("US")).length}</strong> US</p>
          </section>

          <a className="impact-radar" href="/?view=pro&tab=desk&section=company-impact">
            <span className="impact-radar-icon">↗</span>
            <div><small>NEW · COMPANY IMPACT</small><strong>{feedStories.filter((story) => getCompanyImpacts(story, manualCompanyLinks[String(story.id)]).length).length} stories linked to listed companies</strong><p>See the transmission channel, what to verify and today’s research queue.</p></div>
            <b>{companyWatchlist.length ? `${companyWatchlist.length} watched` : "Open radar"} →</b>
          </a>

          <nav className="tag-strip" aria-label="News filters">
            {["For you", ...selected].map((tag) => (
              <button key={tag} className={activeTag === tag ? "active" : ""} onClick={() => chooseTopic(tag)}>
                {tag}
              </button>
            ))}
          </nav>
        </>
      )}

      {page === "pro" && <DistributorPro stories={feedStories} trial={trial} setTrial={setTrial} profile={profile} setProfile={setProfile} initialStory={explainStory} tab={proTab} tool={studioTool} navigateTab={navigatePro} companyWatchlist={companyWatchlist} manualCompanyLinks={manualCompanyLinks} toggleCompanyWatch={toggleCompanyWatch} attachCompanyToStory={attachCompanyToStory} />}

      {(page === "feed" || page === "saved") && (
        <section className="story-stage">
          {page === "saved" && <div className="section-heading"><span>YOUR LIBRARY</span><h1>Saved intelligence</h1></div>}
          {!visibleStories.length ? (
            <div className="empty-state">
              <span>☆</span><h2>Nothing saved yet</h2><p>Tap the bookmark on any briefing to keep it here.</p>
              <button onClick={() => navigate("feed")}>Return to briefing</button>
            </div>
          ) : (
            <>
            <div className="story-stream">
              {visibleStories.slice(0, visibleCount).map((story, index) => (
                <article className={`story-card ${index === 0 ? "lead-story" : ""}`} key={story.id} style={{ "--story-color": topicColor(story.tags[0]), borderTopColor: topicColor(story.tags[0]) } as CSSProperties}>
                  <div className="story-image-wrap">
                    <img src={story.image} alt="" className="story-image" loading={index > 2 ? "lazy" : "eager"} />
                    <div className="image-shade" />
                    <span className="story-number">{String(index + 1).padStart(2, "0")}</span>
                    <div className="story-tags">
                      {story.tags.map((tag) => <span key={tag} style={{ backgroundColor: topicColor(tag) }}>{tag}</span>)}
                    </div>
                    <button
                      className={`bookmark ${bookmarks.includes(story.id) ? "saved" : ""}`}
                      aria-label={bookmarks.includes(story.id) ? "Remove bookmark" : "Save story"}
                      onClick={() => toggleBookmark(story.id)}
                    >{bookmarks.includes(story.id) ? "★" : "☆"}</button>
                  </div>
                  <div className="story-body">
                    <div className="story-meta"><span>{story.source}</span><i /> <span>{story.age}</span></div>
                    <h2><a className="story-title-link" href={`/reader?url=${encodeURIComponent(story.sourceUrl)}&title=${encodeURIComponent(story.title)}&source=${encodeURIComponent(story.source)}`}>{story.title}</a></h2>
                    <p>{story.summary}</p>
                    <StoryCompanyImpact story={story} manualTickers={manualCompanyLinks[String(story.id)] || []} watchedTickers={companyWatchlist} />
                    <div className="coverage-row">
                      <span className="coverage-stack"><i /><i /><i /></span>
                      <span>{story.coverage > 1 ? `Connected from ${story.coverage} reports` : "Briefed from the original report"}</span>
                    </div>
                    <div className="story-actions">
                      <a href={story.sourceUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("source_opened", { item_id: String(story.id), source: story.source })}>Read full story <span>↗</span></a>
                      {story.tags.some((tag) => ["Markets", "Business", "India", "Regulation", "Personal Finance", "Economy", "US"].includes(tag)) && <button className="explain-button" onClick={() => { trackEvent("client_note_created", { item_id: String(story.id), entry_point: "feed" }); navigatePro("studio", story, "note"); }}>Explain to client</button>}
                      <button className="share-button" onClick={() => void shareStory(story)} aria-label={`Share ${story.title}`}><span>Share</span><i>⤴</i></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {visibleStories.length > visibleCount && <button className="feed-load-more" onClick={showMoreStories}>Load 20 more signals <span>{visibleCount} of {visibleStories.length}</span></button>}
            </>
          )}
          <p className="automated-note">Briefs are automatically condensed from attributed sources. Verify important information with the original publisher.</p>
        </section>
      )}

      </div>
    </main>
  );
}

function Brand() {
  return <a className="brand editorial-brand" href="/" aria-label="IntelFlow home"><span className="brand-seal" aria-hidden="true"><b>I</b><i>F</i></span><span className="brand-lockup"><span className="wordmark">Intel<strong>Flow</strong></span><small>THE INTELLIGENCE BRIEF</small></span></a>;
}

function topicColor(tag: string) {
  return ({ AI: "#6550b8", India: "#bf563d", US: "#244d75", Markets: "#08745c", Economy: "#a16d20", Regulation: "#6e4d85", "Personal Finance": "#207a65", Energy: "#9a6b1f", Technology: "#256b91", Business: "#a66f1b", Startups: "#a94c7e", World: "#354a70", Science: "#277e86", Health: "#b44c65", Cricket: "#43763f", Sports: "#a9612a", Entertainment: "#87528d" } as Record<string, string>)[tag] || "#594b82";
}

function StoryCompanyImpact({ story, manualTickers, watchedTickers }: { story: Story; manualTickers: string[]; watchedTickers: string[] }) {
  const impacts = getCompanyImpacts(story, manualTickers);
  const financeRelevant = story.tags.some((tag) => ["Markets", "Business", "India", "Regulation", "Personal Finance", "Economy", "Energy", "US"].includes(tag));
  if (!impacts.length && !financeRelevant) return null;
  if (!impacts.length) return <details className="story-impact-card empty-impact" aria-label={`Company impact for ${story.title}`}><summary><span>◆ COMPANY IMPACT</span><strong>No reliable listed-company match</strong><i>Details ＋</i></summary><div className="story-impact-detail"><p>IntelFlow will not force a weak connection. Attach a company only if you can explain the transmission channel and verify it from a primary source.</p><a href={`/?view=pro&tab=desk&impact=${story.id}#company-impact`}>Attach a company in Research tools →</a></div></details>;
  const watched = impacts.filter((impact) => watchedTickers.includes(impact.ticker)).length;
  return <details className="story-impact-card" aria-label={`Company impact for ${story.title}`}><summary><span>◆ COMPANY IMPACT</span><strong>{impacts[0].ticker} · {impacts[0].direction}</strong><i>Details ＋</i></summary><div className="story-impact-detail"><small>{impacts[0].confidence} confidence · {impacts[0].directness}</small><p>{impacts[0].mechanism}</p><div><span>{impacts.map((impact) => `${watchedTickers.includes(impact.ticker) ? "★ " : ""}${impact.ticker}`).join(" · ")}</span><a href={`/?view=pro&tab=desk&impact=${story.id}#company-impact`}>{watched ? `${watched} watched · ` : ""}Open research tools →</a></div></div></details>;
}

function selectMorningFive(stories: Story[]) {
  const selected: Story[] = [];
  const used = new Set<number>();
  const lanes = [
    (story: Story) => story.tags.includes("Regulation"),
    (story: Story) => story.tags.includes("Personal Finance"),
    (story: Story) => story.tags.includes("India") && story.tags.some((tag) => ["Markets", "Business", "Economy"].includes(tag)),
    (story: Story) => story.tags.includes("US") && story.tags.some((tag) => ["Markets", "Business", "Economy"].includes(tag)),
    (story: Story) => story.tags.some((tag) => ["Economy", "Business"].includes(tag)),
  ];
  lanes.forEach((matches) => {
    const story = stories.find((candidate) => !used.has(candidate.id) && matches(candidate));
    if (story) { selected.push(story); used.add(story.id); }
  });
  stories.forEach((story) => {
    if (selected.length < 5 && !used.has(story.id) && story.tags.some((tag) => ["Markets", "Regulation", "Personal Finance", "US", "Economy", "Business"].includes(tag))) {
      selected.push(story);
      used.add(story.id);
    }
  });
  return selected.slice(0, 5);
}

function DistributorPro({ stories, trial, setTrial, profile, setProfile, initialStory, tab, tool, navigateTab, companyWatchlist, manualCompanyLinks, toggleCompanyWatch, attachCompanyToStory }: {
  stories: Story[];
  trial: TrialState | null;
  setTrial: (value: TrialState | null | ((current: TrialState | null) => TrialState | null)) => void;
  profile: DistributorProfile;
  setProfile: (value: DistributorProfile) => void;
  initialStory: Story | null;
  tab: ProTab;
  tool: StudioTool;
  navigateTab: (tab: ProTab, story?: Story | null, tool?: StudioTool) => void;
  companyWatchlist: string[];
  manualCompanyLinks: ManualCompanyLinks;
  toggleCompanyWatch: (ticker: string) => void;
  attachCompanyToStory: (storyId: number, ticker: string) => void;
}) {
  const [studioStory, setStudioStory] = useState<Story | null>(initialStory);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState("");
  const [ownedShares, setOwnedShares] = useState<OwnedShare[]>(() => storage.get(ownedSharesStorageKey, []));
  const [shareExpiry, setShareExpiry] = useState(30);
  const [noteShareStatus, setNoteShareStatus] = useState("");
  const [includeCompanyImpact, setIncludeCompanyImpact] = useState(false);
  const [regulatorUpdates, setRegulatorUpdates] = useState<RegulatorUpdate[]>([]);
  const [regulatorHealth, setRegulatorHealth] = useState<RegulatorHealth[]>([]);
  const [regulatorLoading, setRegulatorLoading] = useState(true);
  const [quickDrawer, setQuickDrawer] = useState<{ story: Story; tool: StudioTool } | null>(null);
  const [quickDraft, setQuickDraft] = useState("");
  const [quickStatus, setQuickStatus] = useState("");
  const [attachStoryId, setAttachStoryId] = useState(String(stories[0]?.id || ""));
  const [attachTicker, setAttachTicker] = useState(companyUniverse[0].ticker);
  const todayKey = new Date().toISOString().slice(0, 10);
  const [completedDeskActions, setCompletedDeskActions] = useState<string[]>(() => storage.get(`intelflow:daily-desk:${todayKey}`, []));
  const contextCache = useRef(new Map<string, string>());
  const [articleContext, setArticleContext] = useState<{ storyId: number; text: string; status: "loading" | "article" | "fallback" }>({
    storyId: initialStory?.id || 0,
    text: initialStory ? shortStoryContext(initialStory) : "",
    status: "fallback",
  });
  const morningFive = selectMorningFive(stories);
  const practiceStories = stories.filter((story) => story.tags.some((tag) => ["Markets", "Regulation", "Personal Finance", "US", "Economy"].includes(tag))).slice(0, 6);
  const activeStudioStory = studioStory || stories[0] || demoStories[0];
  const activeCompanyImpact = getCompanyImpacts(activeStudioStory, manualCompanyLinks[String(activeStudioStory.id)])[0] || null;
  const resolvedArticleContext = articleContext.storyId === activeStudioStory.id ? articleContext.text : shortStoryContext(activeStudioStory);
  const articleContextStatus = articleContext.storyId === activeStudioStory.id ? articleContext.status : "loading";
  const studioStoryOptions = [activeStudioStory, ...stories.filter((story) => story.id !== activeStudioStory.id)].slice(0, 40);
  const trialStatus = getTrialStatus(trial);
  const dailyDeskActions = buildDailyDeskActions(stories);
  const requestedImpactId = typeof window !== "undefined" ? Number(new URLSearchParams(window.location.search).get("impact") || 0) : 0;
  const impactQueue = stories
    .map((story) => ({ story, impacts: getCompanyImpacts(story, manualCompanyLinks[String(story.id)]) }))
    .filter((item) => item.impacts.length)
    .sort((a, b) => {
      const requested = Number(b.story.id === requestedImpactId) - Number(a.story.id === requestedImpactId);
      if (requested) return requested;
      const watched = Number(b.impacts.some((impact) => companyWatchlist.includes(impact.ticker))) - Number(a.impacts.some((impact) => companyWatchlist.includes(impact.ticker)));
      if (watched) return watched;
      return Number(b.impacts[0].confidence === "High") - Number(a.impacts[0].confidence === "High");
    })
    .slice(0, 6);
  const trialProgress = trialStatus.locked ? "Trial complete" : [trialStatus.daysRemaining ? `${trialStatus.daysRemaining} day${trialStatus.daysRemaining === 1 ? "" : "s"} left` : "Time requirement complete", trialStatus.actionsRemaining ? `${trialStatus.actionsRemaining} output${trialStatus.actionsRemaining === 1 ? "" : "s"} left` : "Output allowance used"].join(" · ");
  useEffect(() => {
    if (initialStory) setStudioStory(initialStory);
  }, [initialStory]);

  useEffect(() => {
    if (!quickDrawer) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setQuickDrawer(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [quickDrawer]);

  function loadRegulators(force = false) {
    setRegulatorLoading(true);
    void fetch(`/api/regulators${force ? `?refresh=${Date.now()}` : ""}`, { cache: force ? "no-store" : "default" })
      .then((response) => response.ok ? response.json() as Promise<{ updates?: RegulatorUpdate[]; sourceHealth?: RegulatorHealth[] }> : Promise.reject(new Error("Official inbox unavailable")))
      .then((result) => {
        setRegulatorUpdates(result.updates || []);
        setRegulatorHealth(result.sourceHealth || []);
      })
      .catch(() => undefined)
      .finally(() => setRegulatorLoading(false));
  }

  useEffect(() => {
    loadRegulators();
  }, []);

  useEffect(() => {
    if (tab !== "studio") return;
    const fallback = shortStoryContext(activeStudioStory);
    const cached = contextCache.current.get(activeStudioStory.sourceUrl);
    if (cached) {
      setArticleContext({ storyId: activeStudioStory.id, text: cached, status: "article" });
      return;
    }
    setArticleContext({ storyId: activeStudioStory.id, text: fallback, status: "loading" });
    const controller = new AbortController();
    void fetch(`/api/article-context?url=${encodeURIComponent(activeStudioStory.sourceUrl)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<{ context?: string; method?: string }> : { context: "", method: "unavailable" })
      .then((result) => {
        const text = result.context?.trim();
        if (text) {
          contextCache.current.set(activeStudioStory.sourceUrl, text);
          setArticleContext({ storyId: activeStudioStory.id, text, status: "article" });
          trackEvent("article_context_loaded", { item_id: String(activeStudioStory.id), method: result.method || "article" });
        } else {
          setArticleContext({ storyId: activeStudioStory.id, text: fallback, status: "fallback" });
        }
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setArticleContext({ storyId: activeStudioStory.id, text: fallback, status: "fallback" });
      });
    return () => controller.abort();
  }, [tab, activeStudioStory]);

  function startTrial() {
    const nextTrial = trial || { startedAt: Date.now(), actions: 0 };
    storage.set(trialStorageKey, nextTrial);
    storage.set("intelflow:pro-demo", true);
    trackEvent("pro_trial_started", { trial_days: trialDays, included_actions: trialActions });
    setTrial(nextTrial);
  }

  function allowOutput() {
    if (!trialStatus.locked) return true;
    trackEvent("pro_trial_limit_reached", { actions_used: trial?.actions || 0, trial_day: trialStatus.day });
    return false;
  }

  function recordTrialAction(action: string) {
    setTrial((current) => {
      const next = current ? { ...current, actions: current.actions + 1 } : { startedAt: Date.now(), actions: 1 };
      storage.set(trialStorageKey, next);
      storage.set("intelflow:pro-demo", true);
      return next;
    });
    trackEvent("pro_trial_action", { action, action_number: (trial?.actions || 0) + 1 });
  }

  function saveProfile(next: DistributorProfile) {
    setProfile(next);
    storage.set("intelflow:distributor-profile", next);
  }

  function saveOwnedShare(share: OwnedShare) {
    setOwnedShares((current) => {
      const next = [share, ...current.filter((item) => item.id !== share.id)];
      storage.set(ownedSharesStorageKey, next);
      return next;
    });
  }

  function replaceOwnedShares(next: OwnedShare[]) {
    setOwnedShares(next);
    storage.set(ownedSharesStorageKey, next);
  }

  useEffect(() => {
    setDraft(buildClientNote(activeStudioStory, profile, resolvedArticleContext, includeCompanyImpact ? activeCompanyImpact : null));
  }, [activeStudioStory, profile, resolvedArticleContext, includeCompanyImpact, activeCompanyImpact?.ticker]);

  async function copyNote() {
    if (!allowOutput()) return;
    await navigator.clipboard?.writeText(draft);
    trackEvent("client_note_copied", { item_id: String(activeStudioStory.id), format: "written" });
    recordTrialAction("client_note_copied");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function createNoteShare() {
    if (!allowOutput()) return;
    setNoteShareStatus("Creating your branded link…");
    try {
      const canvas = document.createElement("canvas");
      const template: SocialTemplate = activeStudioStory.tags.includes("Regulation") ? "regulatory" : activeStudioStory.tags.includes("Markets") ? "market" : "signal";
      await renderSocialCard(canvas, { story: activeStudioStory, headline: activeStudioStory.title, context: resolvedArticleContext, profile, format: "square", template, impact: includeCompanyImpact ? activeCompanyImpact : null });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Preview image could not be created.");
      const shareContext = includeCompanyImpact && activeCompanyImpact ? `${resolvedArticleContext} Market read-through: ${impactSummary(activeCompanyImpact)}` : resolvedArticleContext;
      const share = await publishHostedShare(activeStudioStory, shareContext, profile, blob, shareExpiry);
      saveOwnedShare(share);
      recordTrialAction("share_link_created");
      trackEvent("share_link_created", { item_id: String(activeStudioStory.id), expires_in_days: shareExpiry, format: "written" });
      setNoteShareStatus("Branded link created. Copy or open it below.");
    } catch (error) {
      setNoteShareStatus(error instanceof Error ? error.message : "The share link could not be created.");
    }
  }

  function openClientNote(story: Story, entryPoint: string) {
    trackEvent("client_note_created", { item_id: String(story.id), entry_point: entryPoint });
    setStudioStory(story);
    navigateTab("studio", story, "note");
  }

  function openSocialCard(story: Story, entryPoint: string) {
    trackEvent("social_studio_opened", { item_id: String(story.id), entry_point: entryPoint });
    setStudioStory(story);
    navigateTab("studio", story, "image");
  }

  function openQuickDrawer(story: Story, nextTool: StudioTool) {
    setStudioStory(story);
    setQuickDrawer({ story, tool: nextTool });
    setQuickDraft(buildClientNote(story, profile, shortStoryContext(story), getCompanyImpacts(story, manualCompanyLinks[String(story.id)])[0] || null));
    setQuickStatus("");
    trackEvent("dashboard_quick_action_opened", { item_id: String(story.id), tool: nextTool });
  }

  async function copyQuickNote() {
    if (!quickDrawer || !allowOutput()) return;
    await navigator.clipboard?.writeText(quickDraft);
    recordTrialAction("dashboard_quick_note");
    setQuickStatus("Client note copied.");
  }

  async function shareQuickImage() {
    if (!quickDrawer || !allowOutput()) return;
    setQuickStatus("Preparing image…");
    try {
      const canvas = document.createElement("canvas");
      const story = quickDrawer.story;
      const template: SocialTemplate = story.tags.includes("Regulation") ? "regulatory" : story.tags.includes("Markets") ? "market" : "signal";
      await renderSocialCard(canvas, { story, headline: story.title, context: shortStoryContext(story), profile, format: "square", template, impact: getCompanyImpacts(story, manualCompanyLinks[String(story.id)])[0] || null });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) { setQuickStatus("Image could not be prepared."); return; }
      const file = new File([blob], `intelflow-${story.id}.png`, { type: "image/png" });
      const canNativeShare = Boolean(navigator.share && navigator.canShare?.({ files: [file] }));
      if (canNativeShare) await navigator.share({ files: [file], title: story.title });
      else downloadSocialCard(blob, file.name);
      recordTrialAction("dashboard_quick_image");
      setQuickStatus(canNativeShare ? "Share sheet opened." : "Image downloaded.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") setQuickStatus("");
      else setQuickStatus("Could not prepare the share image. Please use the full studio.");
    }
  }

  function toggleDeskAction(actionId: string) {
    setCompletedDeskActions((current) => {
      const next = current.includes(actionId) ? current.filter((item) => item !== actionId) : [...current, actionId];
      storage.set(`intelflow:daily-desk:${todayKey}`, next);
      trackEvent("daily_desk_action_updated", { action_id: actionId, completed: next.includes(actionId) });
      return next;
    });
  }

  return (
    <section className="pro-workspace">
      <header className="pro-workspace-head">
        <div><span className="pro-kicker">INTELFLOW DASHBOARD · {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()}</span><h1>{tab === "desk" ? `Good morning${profile.name ? `, ${profile.name.split(" ")[0]}` : ""}.` : tab === "studio" ? "Create client-ready content." : tab === "regulators" ? "Compliance intelligence." : "Distributor settings."}</h1><p>{tab === "desk" ? "Three priorities, five essential stories and your next client action." : tab === "studio" ? "One source-backed workspace for notes, images and share links." : tab === "regulators" ? "Official updates, document briefs and verified reminders." : "Identity and disclaimers stored only on this device."}</p></div>
        <div className="workspace-head-actions">{!trial && <button type="button" onClick={startTrial}>Activate 7-day trial</button>}<span className={`pro-status ${trialStatus.locked ? "locked" : ""}`}>{!trial ? "TRIAL READY" : trialStatus.locked ? "TRIAL COMPLETE" : `TRIAL DAY ${trialStatus.day}`}</span></div>
      </header>
      {trial && <div className={`trial-meter ${trialStatus.locked ? "locked" : ""}`}><div><span>LOCAL TRIAL</span><strong>{trialProgress}</strong></div><p>Usage is stored only on this browser. News and official regulator access remain free.</p></div>}
      {trialStatus.locked && <section className="trial-upgrade-banner"><div><span>CONTINUE WITH INTELFLOW PRO</span><h2>Your trial is complete.</h2><p>Client-content copying, image generation and exports are paused. The briefing and regulator sources remain available.</p></div><div><strong>₹399<small>/month</small></strong><a href="mailto:hello@swarnimcapital.com?subject=IntelFlow%20Pro%20early%20access" onClick={() => trackEvent("pro_upgrade_clicked", { placement: "trial_gate" })}>Request Pro access →</a><small>Early-access request only. No payment is collected here.</small></div></section>}
      {tab === "desk" && <div className="unified-desk dashboard-home">
        <section className="dashboard-pulse" aria-label="Live intelligence pulse">
          <div className="dashboard-pulse-copy"><span><i /> LIVE DISTRIBUTOR DESK</span><h2>Know what matters.<br />Send one clear update.</h2><p>Your finance, market and regulatory workflow—condensed into a single morning sequence.</p></div>
          <div className="dashboard-pulse-stats"><article><strong>{stories.length}</strong><span>signals</span></article><article><strong>{regulatorUpdates.length}</strong><span>official updates</span></article><article><strong>{impactQueue.length}</strong><span>company links</span></article></div>
        </section>

        <div className="dashboard-flow">
          <section className="intelligence-stream">
            <header><div><span className="pro-kicker">YOUR MORNING 5</span><h2>Today’s work queue</h2><p>Read the context, then create only what is useful for clients.</p></div><a href="/?view=feed">All intelligence <span>↗</span></a></header>
            <div>{(morningFive.length ? morningFive : stories.slice(0, 5)).map((story, index) => {
              const impact = getCompanyImpacts(story, manualCompanyLinks[String(story.id)])[0];
              return <article key={story.id} className={index === 0 ? "lead-signal" : ""}>
                <div className="signal-index"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
                <div className="signal-content"><small>{story.tags.slice(0, 2).join(" / ")} · {story.source} · {story.age}</small><h3>{story.title}</h3><p>{shortStoryContext(story)}</p><footer>{impact && <span className="impact-chip">{impact.ticker} · {impact.direction}</span>}<a href={story.sourceUrl} target="_blank" rel="noreferrer">Original source ↗</a></footer></div>
                <button type="button" className="create-update" onClick={() => openQuickDrawer(story, "note")}><span>＋</span><b>Create update</b></button>
              </article>;
            })}</div>
          </section>

          <aside className="action-rail">
            <section className="action-launcher"><span className="pro-kicker">START HERE</span><h2>Create from the lead story</h2><p>Choose an output once. The selected story carries into the editor.</p><div><button type="button" onClick={() => openQuickDrawer(morningFive[0] || stories[0] || demoStories[0], "note")}><i>✎</i><span><strong>Client note</strong><small>Short, sourced and editable</small></span><b>→</b></button><button type="button" onClick={() => openQuickDrawer(morningFive[0] || stories[0] || demoStories[0], "image")}><i>▣</i><span><strong>Social card</strong><small>Branded image for sharing</small></span><b>→</b></button></div></section>

            <DailyClientDigest stories={morningFive.length ? morningFive : stories.slice(0, 5)} updates={regulatorUpdates} profile={profile} locked={trialStatus.locked} onOutput={recordTrialAction} />

            <section className="watch-panel"><header><span className="pro-kicker">WATCH</span><strong>Two desks that need attention</strong></header><a href="/?view=pro&tab=regulators"><span><i className="regulator-orb">✓</i><b>Compliance inbox</b><small>{regulatorUpdates.length} official updates · {regulatorHealth.filter((source) => source.status === "live").length}/5 sources live</small></span><strong>↗</strong></a><a href="#company-impact"><span><i className="impact-orb">↗</i><b>Company Impact</b><small>{impactQueue.length} research connections · {companyWatchlist.length} watched</small></span><strong>↓</strong></a></section>

            <details className="dashboard-checklist"><summary><div><span className="pro-kicker">TODAY’S CHECKLIST</span><strong>{completedDeskActions.filter((id) => dailyDeskActions.some((action) => action.id === id)).length}/{dailyDeskActions.length} complete</strong></div><i>Open ＋</i></summary><div>{dailyDeskActions.map((action) => <button type="button" key={action.id} className={`${completedDeskActions.includes(action.id) ? "done" : ""} ${action.newsTriggered ? "news-triggered" : ""}`} onClick={() => toggleDeskAction(action.id)}><i>{completedDeskActions.includes(action.id) ? "✓" : ""}</i><span><strong>{action.title}</strong><small>{action.reason}</small></span></button>)}</div></details>
          </aside>
        </div>

        <details className="dashboard-deep-dive" id="company-impact" defaultOpen={Boolean(requestedImpactId)}>
          <summary><div><span className="pro-kicker">RESEARCH WORKSPACE</span><strong>Company Impact and manual connections</strong><small>Open only when you need the full transmission analysis.</small></div><i>Open research tools ＋</i></summary>
          <section className="company-impact-hub">
            <header className="impact-hub-hero"><div><span className="pro-kicker">NEWS-TO-COMPANY RESEARCH</span><h2>Company Impact</h2><p>Understand why a headline may matter, what financial variable to inspect and what still needs proof. These are research prompts—not recommendations.</p></div><div><strong>{impactQueue.length}</strong><span>live connections</span><small>{companyWatchlist.length} watched locally</small></div></header>
            <div className="impact-attach-bar"><div><strong>Attach an article manually</strong><span>Add a company only when you can explain the connection.</span></div><select aria-label="Article to attach" value={attachStoryId} onChange={(event) => setAttachStoryId(event.target.value)}>{stories.slice(0, 40).map((story) => <option key={story.id} value={story.id}>{story.title}</option>)}</select><select aria-label="Company to attach" value={attachTicker} onChange={(event) => setAttachTicker(event.target.value)}>{companyUniverse.map((company) => <option key={company.ticker} value={company.ticker}>{company.ticker} · {company.name}</option>)}</select><button type="button" onClick={() => attachCompanyToStory(Number(attachStoryId), attachTicker)}>Attach</button></div>
            <div className="impact-queue"><div className="impact-queue-label"><span>TODAY’S RESEARCH QUEUE</span><small>Direct mention, watchlist relevance and confidence</small></div>{impactQueue.length ? impactQueue.map(({ story, impacts }) => <article key={story.id} className={story.id === requestedImpactId ? "requested" : ""}><div className="impact-story-line"><div><small>{story.source} · {story.age}</small><h3>{story.title}</h3></div><a href={story.sourceUrl} target="_blank" rel="noreferrer">Verify source ↗</a></div><div className="impact-company-grid">{impacts.map((impact) => <div className="impact-company" key={impact.ticker}><div className="impact-company-title"><span>{impact.ticker}</span><i className={impact.direction.includes("positive") ? "positive" : impact.direction.includes("negative") ? "negative" : "mixed"}>{impact.direction}</i><button type="button" className={companyWatchlist.includes(impact.ticker) ? "watched" : ""} onClick={() => toggleCompanyWatch(impact.ticker)}>{companyWatchlist.includes(impact.ticker) ? "★ Watching" : "☆ Watch"}</button></div><strong>{impact.name}</strong><p>{impact.mechanism}</p><dl><div><dt>Connection</dt><dd>{impact.directness} · {impact.confidence}</dd></div><div><dt>What to verify</dt><dd>{impact.verify}</dd></div><div><dt>Posture</dt><dd>{impact.posture}</dd></div></dl><button type="button" className="impact-studio-link" onClick={() => { setStudioStory(story); setIncludeCompanyImpact(true); openQuickDrawer(story, "note"); }}>Add to client content →</button></div>)}</div></article>) : <p className="impact-empty">No reliable company connections are available yet.</p>}</div>
          </section>
        </details>

        <details className="dashboard-secondary-tools"><summary><div><span className="pro-kicker">MORE INTELLIGENCE</span><strong>Conversation cues and verified social sources</strong></div><i>Open ＋</i></summary><div className="pro-tools-grid"><section className="practice-feed"><div className="pro-section-title"><div><span>LIVE RSS · PRACTICE EDGE</span><h2>Conversation cues</h2></div><i className="live-dot">LIVE</i></div>{(practiceStories.length ? practiceStories : stories.slice(0, 6)).map((story) => <article key={story.id}><div><small>{story.source} · {story.age}</small><h3>{story.title}</h3></div><p><strong>Try this:</strong> {conversationCue(story)}</p><div><a href={story.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a><button onClick={() => openQuickDrawer(story, "note")}>Use story →</button></div></article>)}</section><aside className="x-source-watch"><span className="pro-kicker">VERIFIED SOCIAL SOURCES</span><h2>Useful source channels.</h2><p>Fast awareness only. Verify regulatory information on the authority’s website.</p><a href="https://x.com/SEBI_updates" target="_blank" rel="noreferrer"><strong>@SEBI_updates</strong><span>Regulations and circulars ↗</span></a><a href="https://x.com/RBI" target="_blank" rel="noreferrer"><strong>@RBI</strong><span>Reserve Bank updates ↗</span></a><a href="https://x.com/MFSahiHai" target="_blank" rel="noreferrer"><strong>@MFSahiHai</strong><span>Mutual fund education ↗</span></a></aside></div></details>

        {quickDrawer && <div className="quick-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setQuickDrawer(null); }}><aside className="quick-drawer" role="dialog" aria-modal="true" aria-label="Quick create"><header><div><span className="pro-kicker">QUICK CREATE</span><strong>{quickDrawer.story.title}</strong><small>{quickDrawer.story.source} · {quickDrawer.story.age}</small></div><button type="button" onClick={() => setQuickDrawer(null)} aria-label="Close quick create">×</button></header><nav><button type="button" className={quickDrawer.tool === "note" ? "active" : ""} onClick={() => setQuickDrawer({ ...quickDrawer, tool: "note" })}>Written note</button><button type="button" className={quickDrawer.tool === "image" ? "active" : ""} onClick={() => setQuickDrawer({ ...quickDrawer, tool: "image" })}>Social image</button></nav>{quickDrawer.tool === "note" ? <div className="quick-note"><label>Editable client note<textarea value={quickDraft} onChange={(event) => setQuickDraft(event.target.value)} /></label><div><button type="button" className="primary" disabled={trialStatus.locked} onClick={() => void copyQuickNote()}>Copy note</button><button type="button" onClick={() => { setQuickDrawer(null); navigateTab("studio", quickDrawer.story, "note"); }}>Full editor →</button></div></div> : <div className="quick-image"><div><span>{quickDrawer.story.tags.slice(0, 2).join(" · ")}</span><strong>{quickDrawer.story.title}</strong><p>{shortStoryContext(quickDrawer.story)}</p><small>CLIENT ACTION · STAY WITH THE AGREED PLAN</small></div><button type="button" className="primary" disabled={trialStatus.locked} onClick={() => void shareQuickImage()}>Generate and share image</button><button type="button" onClick={() => { setQuickDrawer(null); navigateTab("studio", quickDrawer.story, "image"); }}>Open design studio →</button></div>}{quickStatus && <p className="quick-status" role="status">{quickStatus}</p>}<footer>Source attribution and your local distributor disclaimer remain included. Review before sharing.</footer></aside></div>}
      </div>}

      {tab === "studio" && <section className="client-content-studio">
        <header className="content-studio-hero">
          <div><span className="pro-kicker">ONE HEADLINE · THREE READY OUTPUTS</span><h2>Turn news into client-ready content.</h2><p>Write a neutral note, create a social image, or publish an expiring branded link to the original source. No client data is collected.</p></div>
          <strong>NO PAID AI</strong>
        </header>
        <div className="content-studio-toolbar">
          <label><span>Selected headline</span><select value={activeStudioStory.id} onChange={(event) => { const next = studioStoryOptions.find((story) => String(story.id) === event.target.value); if (next) { setStudioStory(next); navigateTab("studio", next, tool); } }}>{studioStoryOptions.map((story) => <option key={story.id} value={story.id}>{story.title}</option>)}</select></label>
          <div className="content-mode-switch" role="tablist" aria-label="Choose client content format">
            <button role="tab" aria-selected={tool === "note"} className={tool === "note" ? "active" : ""} onClick={() => navigateTab("studio", activeStudioStory, "note")}><span>✎</span><strong>Written note</strong><small>Copy and send</small></button>
            <button role="tab" aria-selected={tool === "image"} className={tool === "image" ? "active" : ""} onClick={() => navigateTab("studio", activeStudioStory, "image")}><span>▣</span><strong>Social image</strong><small>Design and share</small></button>
          </div>
        </div>
        <label className={`impact-inclusion-control ${includeCompanyImpact && activeCompanyImpact ? "active" : ""}`}>
          <input type="checkbox" checked={includeCompanyImpact} disabled={!activeCompanyImpact} onChange={(event) => setIncludeCompanyImpact(event.target.checked)} />
          <span><strong>{activeCompanyImpact ? `Include ${activeCompanyImpact.ticker} Company Impact` : "No high-confidence company connection"}</strong><small>{activeCompanyImpact ? `${activeCompanyImpact.direction} · ${activeCompanyImpact.posture} · added as neutral research context` : "Choose another headline or attach a company in Today’s research queue."}</small></span>
          <i>{includeCompanyImpact && activeCompanyImpact ? "INCLUDED" : "OPTIONAL"}</i>
        </label>

        {tool === "note" ? <div className="content-note-workspace">
          <aside className="content-story-brief">
            <div className="content-story-image"><img src={activeStudioStory.image} alt="" /><span>{activeStudioStory.tags.slice(0, 2).join(" · ")}</span></div>
            <div><small>{activeStudioStory.source} · {activeStudioStory.age}</small><h3>{activeStudioStory.title}</h3><p>{resolvedArticleContext}</p><small className={`context-origin ${articleContextStatus}`}>{articleContextStatus === "loading" ? "Checking original article…" : articleContextStatus === "article" ? "Context checked against original article" : "Using publisher feed excerpt"}</small><a href={activeStudioStory.sourceUrl} target="_blank" rel="noreferrer">Verify original source ↗</a></div>
          </aside>
          <div className="content-note-compose">
            <div className="content-note-head"><div><span className="pro-kicker">SHORT · ATTRIBUTED · NEUTRAL</span><h3>Editable client note</h3></div><button className="copy-note" disabled={trialStatus.locked} onClick={() => void copyNote()}>{trialStatus.locked ? "Trial complete" : copied ? "Copied ✓" : "Copy note"}</button></div>
            <textarea className="editable-note" aria-label="Editable client message" value={draft} onChange={(event) => setDraft(event.target.value)} />
            <div className="hosted-share-creator"><div><span>BRANDED SOURCE LINK</span><strong>Publish this context as an expiring IntelFlow page.</strong><small>Your selected profile details, disclaimer and preview image become public on the link. No client details are collected.</small></div><label>Expires<select value={shareExpiry} onChange={(event) => setShareExpiry(Number(event.target.value))}><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select></label><button type="button" disabled={trialStatus.locked} onClick={() => void createNoteShare()}>{trialStatus.locked ? "Trial complete" : "Create share link"}</button></div>
            {noteShareStatus && <p className="studio-status" role="status">{noteShareStatus}</p>}
            <p className="compliance-note"><strong>Before sending:</strong> review accuracy, suitability, source context and your organisation’s compliance policy. IntelFlow does not approve communications or provide investment advice.</p>
          </div>
        </div> : <SocialPostStudio stories={stories} profile={profile} saveProfile={saveProfile} initialStory={activeStudioStory} initialContext={resolvedArticleContext} impact={includeCompanyImpact ? activeCompanyImpact : null} embedded trialLocked={trialStatus.locked} onTrialAction={recordTrialAction} onShareCreated={saveOwnedShare} onStoryChange={(story) => { setStudioStory(story); navigateTab("studio", story, "image"); }} />}
        <ShareLinkDashboard links={ownedShares} onChange={replaceOwnedShares} />
      </section>}

      {tab === "regulators" && <section className="regulator-page regulator-watch">
        <RegulatorInbox updates={regulatorUpdates} health={regulatorHealth} loading={regulatorLoading} onRefresh={() => loadRegulators(true)} onShare={(story) => openSocialCard(story, "regulator_inbox")} />
      </section>}

      {tab === "profile" && <form className="profile-editor" onSubmit={(event) => event.preventDefault()}>
        <div><span className="pro-kicker">DISTRIBUTOR IDENTITY</span><h2>Your client-note footer.</h2><p>Saved in this browser. The displayed identity is published only when you deliberately create a branded share link. Do not enter client data.</p></div>
        <label>Registered name<input value={profile.name} onChange={(event) => saveProfile({ ...profile, name: event.target.value })} placeholder="Your registered distributor name" /></label>
        <div className="profile-row"><label>ARN<input value={profile.arn} onChange={(event) => saveProfile({ ...profile, arn: event.target.value })} placeholder="ARN-000000" /></label><label>EUIN<input value={profile.euin} onChange={(event) => saveProfile({ ...profile, euin: event.target.value })} placeholder="E000000" /></label></div>
        <label>Business phone<input value={profile.phone} onChange={(event) => saveProfile({ ...profile, phone: event.target.value })} placeholder="Optional" /></label>
        <label>Standard disclaimer<textarea value={profile.disclaimer} onChange={(event) => saveProfile({ ...profile, disclaimer: event.target.value })} rows={4} /></label>
        <p className="saved-locally">✓ Changes save automatically on this device.</p>
      </form>}
    </section>
  );
}

type SocialFormat = "square" | "portrait";
type SocialTemplate = "signal" | "market" | "regulatory" | "festival";

function SocialPostStudio({ stories, profile, saveProfile, initialStory, initialContext, impact, onStoryChange, onTrialAction, onShareCreated, trialLocked = false, embedded = false }: {
  stories: Story[];
  profile: DistributorProfile;
  saveProfile: (next: DistributorProfile) => void;
  initialStory: Story | null;
  initialContext: string;
  impact: CompanyImpact | null;
  onStoryChange: (story: Story) => void;
  onTrialAction: (action: string) => void;
  onShareCreated: (share: OwnedShare) => void;
  trialLocked?: boolean;
  embedded?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firstStory = initialStory || stories[0] || demoStories[0];
  const [story, setStory] = useState<Story>(firstStory);
  const [headline, setHeadline] = useState(firstStory.title);
  const [context, setContext] = useState(shortStoryContext(firstStory));
  const [format, setFormat] = useState<SocialFormat>("square");
  const [template, setTemplate] = useState<SocialTemplate>("signal");
  const [shareExpiry, setShareExpiry] = useState(30);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!initialStory) return;
    setStory(initialStory);
    setHeadline(initialStory.title);
  }, [initialStory]);

  useEffect(() => {
    setContext(initialContext || shortStoryContext(story));
  }, [initialContext, story]);

  useEffect(() => {
    if (!canvasRef.current) return;
    void renderSocialCard(canvasRef.current, { story, headline, context, profile, format, template, impact });
  }, [story, headline, context, profile, format, template, impact]);

  function chooseStory(next: Story) {
    setStory(next);
    setHeadline(next.title);
    setContext(shortStoryContext(next));
    setStatus("");
    onStoryChange(next);
  }

  function applyCommunityPreset(preset: "update" | "festival") {
    if (preset === "festival") {
      setTemplate("festival");
      setHeadline(`Warm wishes from ${profile.name || "IntelFlow"}`);
      setContext("Wishing you and your family happiness, good health and prosperity. Thank you for being part of our community.");
      setStatus("Festive greeting ready—edit the message and branding before sharing.");
      trackEvent("community_pack_preset", { preset: "festival" });
      return;
    }
    setTemplate(story.tags.includes("Regulation") ? "regulatory" : story.tags.includes("Markets") ? "market" : "signal");
    setHeadline(story.title);
    setContext(initialContext || shortStoryContext(story));
    setStatus("News update restored from the selected headline.");
    trackEvent("community_pack_preset", { preset: "news_update" });
  }

  function uploadLogo(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_000_000) {
      setStatus("Use a PNG or JPG logo smaller than 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      saveProfile({ ...profile, logo: String(reader.result || "") });
      setStatus("Logo saved on this device.");
    };
    reader.readAsDataURL(file);
  }

  function buildCaption() {
    const identity = [profile.name, profile.arn, profile.euin].filter(Boolean).join(" · ");
    if (template === "festival") return `${headline}\n\n${context}${identity ? `\n\n${identity}` : ""}\n\n${profile.disclaimer}`;
    const guidance = clientActionGuidance(story);
    const marketReadThrough = impact ? `\n\nCompany Impact: ${impactSummary(impact)}\nResearch posture: ${impact.posture}. Verify: ${impact.verify}` : "";
    return `${headline}\n\n${context}${marketReadThrough}\n\nWhat you can do: ${guidance.do}\nWhat to avoid: ${guidance.dont}\n\nSource: ${story.source}\n${story.sourceUrl}\n\nFor information only. No buy/sell view or research recommendation. One headline alone does not call for an immediate portfolio change.${identity ? `\n\n${identity}` : ""}\n\n${profile.disclaimer}`;
  }

  async function makeBlob() {
    if (!canvasRef.current) return null;
    await renderSocialCard(canvasRef.current, { story, headline, context, profile, format, template, impact });
    return new Promise<Blob | null>((resolve) => canvasRef.current?.toBlob(resolve, "image/png"));
  }

  async function generateCard() {
    if (trialLocked) return;
    const blob = await makeBlob();
    if (!blob) return;
    trackEvent("social_card_generated", { item_id: String(story.id), format, template });
    setStatus("Card ready to share or download.");
  }

  async function shareCard() {
    if (trialLocked) return;
    const blob = await makeBlob();
    if (!blob) return;
    const file = new File([blob], `intelflow-${story.id}-${format}.png`, { type: "image/png" });
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: headline, text: buildCaption() });
        trackEvent("social_card_shared", { item_id: String(story.id), format, template });
        onTrialAction("social_card_shared");
        setStatus("Share sheet opened—choose WhatsApp or another app.");
        return;
      }
      downloadSocialCard(blob, file.name);
      trackEvent("social_card_downloaded", { item_id: String(story.id), format, fallback: true });
      onTrialAction("social_card_downloaded");
      setStatus("Image downloaded. Attach it in WhatsApp with the copied caption.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("Sharing is unavailable here. Use Download PNG instead.");
    }
  }

  async function downloadCard() {
    if (trialLocked) return;
    const blob = await makeBlob();
    if (!blob) return;
    downloadSocialCard(blob, `intelflow-${story.id}-${format}.png`);
    trackEvent("social_card_downloaded", { item_id: String(story.id), format, fallback: false });
    onTrialAction("social_card_downloaded");
    setStatus("PNG downloaded.");
  }

  async function copyCaption() {
    if (trialLocked) return;
    await navigator.clipboard?.writeText(buildCaption());
    trackEvent("social_caption_copied", { item_id: String(story.id) });
    onTrialAction("social_caption_copied");
    setStatus("Caption copied.");
  }

  async function createHostedLink() {
    if (trialLocked) return;
    setStatus("Creating your branded link…");
    try {
      const blob = await makeBlob();
      if (!blob) throw new Error("Preview image could not be created.");
      const shareContext = impact && template !== "festival" ? `${context} Market read-through: ${impactSummary(impact)}` : context;
      const publishedStory = template === "festival" ? { ...story, title: headline, source: "IntelFlow Community Pack", sourceUrl: "https://intelflow.in", tags: ["Community"] } : { ...story, title: headline };
      const share = await publishHostedShare(publishedStory, shareContext, profile, blob, shareExpiry);
      onShareCreated(share);
      onTrialAction("share_link_created");
      trackEvent("share_link_created", { item_id: String(story.id), expires_in_days: shareExpiry, format: "social" });
      setStatus("Branded link created. Copy or open it in Recent share links below.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The share link could not be created.");
    }
  }

  return <section className="social-studio">
    {!embedded && <header className="studio-intro"><div><span className="pro-kicker">NO-AI · LOCAL CREATION</span><h2>Social Post Studio</h2><p>Create a branded, attributed card on this device. Review every post before sharing.</p></div><strong>PRO TOOL</strong></header>}
    <div className="studio-layout">
      <div className="studio-controls">
        {!embedded && <label>Story<select value={story.id} onChange={(event) => { const next = stories.find((item) => String(item.id) === event.target.value); if (next) chooseStory(next); }}>{stories.slice(0, 20).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}
        <div className="community-pack"><span>COMMUNITY PACK</span><strong>Post something useful in two clicks.</strong><p>Use today’s selected update or create an editable festive greeting with your local branding.</p><div><button type="button" onClick={() => applyCommunityPreset("update")}>News update</button><button type="button" onClick={() => applyCommunityPreset("festival")}>Festive greeting</button></div></div>
        <fieldset><legend>Template</legend><div className="studio-options">{(["signal", "market", "regulatory", "festival"] as SocialTemplate[]).map((item) => <button type="button" key={item} className={template === item ? "active" : ""} onClick={() => setTemplate(item)}>{item === "signal" ? "Daily signal" : item === "market" ? "Market brief" : item === "regulatory" ? "Regulatory" : "Greeting"}</button>)}</div></fieldset>
        <fieldset><legend>Format</legend><div className="studio-options"><button type="button" className={format === "square" ? "active" : ""} onClick={() => setFormat("square")}>Square · 1080</button><button type="button" className={format === "portrait" ? "active" : ""} onClick={() => setFormat("portrait")}>Portrait · 1350</button></div></fieldset>
        <label>Headline<textarea value={headline} maxLength={130} rows={3} onChange={(event) => setHeadline(event.target.value)} /></label>
        <label>Short context<textarea value={context} maxLength={220} rows={4} onChange={(event) => setContext(event.target.value)} /></label>
        <div className="studio-branding"><span className="pro-kicker">YOUR BRANDING</span><label>Brand colour<input type="color" value={profile.brandColor || "#d0aa65"} onChange={(event) => saveProfile({ ...profile, brandColor: event.target.value })} /></label><label className="logo-upload">Logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadLogo(event.target.files?.[0])} /><span>{profile.logo ? "Replace logo" : "Upload logo"}</span></label>{profile.logo && <button type="button" onClick={() => saveProfile({ ...profile, logo: "" })}>Remove logo</button>}<small>Name, ARN and EUIN come from your local Distributor Profile.</small></div>
      </div>
      <div className="studio-preview">
        <div className={`canvas-frame ${format}`}><canvas ref={canvasRef} aria-label="Generated social post preview" /></div>
        <div className="studio-actions"><button type="button" disabled={trialLocked} onClick={() => void generateCard()}>{trialLocked ? "Trial complete" : "Generate card"}</button><button type="button" className="primary" disabled={trialLocked} onClick={() => void shareCard()}>Share image</button><button type="button" disabled={trialLocked} onClick={() => void downloadCard()}>Download PNG</button><button type="button" disabled={trialLocked} onClick={() => void copyCaption()}>Copy caption</button></div>
        <div className="social-link-publisher"><label>Link expires<select value={shareExpiry} onChange={(event) => setShareExpiry(Number(event.target.value))}><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select></label><button type="button" disabled={trialLocked} onClick={() => void createHostedLink()}>{trialLocked ? "Trial complete" : "Create short share link →"}</button></div>
        {status && <p className="studio-status" role="status">{status}</p>}
        <p className="studio-disclaimer">Image sharing stays on this device. Creating a branded source link publishes the displayed profile identity, disclaimer and preview image until it expires or you revoke it.</p>
      </div>
    </div>
  </section>;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Preview image could not be prepared."));
    reader.readAsDataURL(blob);
  });
}

async function publishHostedShare(story: Story, context: string, profile: DistributorProfile, image: Blob, expiresInDays: number) {
  const guidance = clientActionGuidance(story);
  const response = await fetch("/api/shares", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      story: { title: story.title, context, actionDo: guidance.do, actionDont: guidance.dont, sourceName: story.source, sourceUrl: story.sourceUrl },
      profile: { name: profile.name, arn: profile.arn, euin: profile.euin, phone: profile.phone, disclaimer: profile.disclaimer, brandColor: profile.brandColor },
      expiresInDays,
      previewImageData: await blobToDataUrl(image),
    }),
  });
  const result = await response.json() as { share?: OwnedShare; error?: string };
  if (!response.ok || !result.share) throw new Error(result.error || "The share link could not be created.");
  return result.share;
}

function ShareLinkDashboard({ links, onChange }: { links: OwnedShare[]; onChange: (next: OwnedShare[]) => void }) {
  const [confirmId, setConfirmId] = useState("");
  const [status, setStatus] = useState("");
  const linkIds = links.map((link) => link.id).join(",");

  async function refreshStats() {
    if (!links.length) return;
    const next = await Promise.all(links.map(async (link) => {
      try {
        const response = await fetch(`/api/shares/${link.id}/stats`, { headers: { Authorization: `Bearer ${link.ownerToken}` }, cache: "no-store" });
        if (!response.ok) return link;
        const result = await response.json() as { stats?: ShareStats };
        return result.stats ? { ...link, stats: result.stats } : link;
      } catch {
        return link;
      }
    }));
    onChange(next);
  }

  useEffect(() => {
    void refreshStats();
  }, [linkIds]);

  async function revokeLink(link: OwnedShare) {
    if (confirmId !== link.id) {
      setConfirmId(link.id);
      setStatus("Press Confirm revoke to withdraw this public link.");
      return;
    }
    const response = await fetch(`/api/shares/${link.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${link.ownerToken}` } });
    if (!response.ok) {
      setStatus("The link could not be revoked from this device.");
      return;
    }
    onChange(links.map((item) => item.id === link.id ? { ...item, stats: { views: item.stats?.views || 0, sourceClicks: item.stats?.sourceClicks || 0, contactClicks: item.stats?.contactClicks || 0, expiresAt: item.expiresAt, revokedAt: Date.now() } } : item));
    setConfirmId("");
    setStatus("Share link revoked. Its public page and preview image are no longer available.");
    trackEvent("share_link_revoked", { share_id: link.id });
  }

  async function shareLink(link: OwnedShare) {
    if (navigator.share) {
      try {
        await navigator.share({ title: link.title, url: link.url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard?.writeText(link.url);
    setStatus("Share link copied.");
  }

  const activeLinks = links.filter((link) => !link.stats?.revokedAt && link.expiresAt > Date.now());
  const totals = activeLinks.reduce((sum, link) => ({ views: sum.views + (link.stats?.views || 0), clicks: sum.clicks + (link.stats?.sourceClicks || 0), contacts: sum.contacts + (link.stats?.contactClicks || 0) }), { views: 0, clicks: 0, contacts: 0 });
  return <section className="share-link-dashboard">
    <div className="share-dashboard-head"><div><span className="pro-kicker">PUBLIC · EXPIRING · REVOCABLE</span><h3>Recent share links</h3><p>Only aggregate actions are counted. IntelFlow does not store visitor identities, messages or client details.</p></div><button type="button" onClick={() => void refreshStats()}>Refresh activity</button></div>
    <div className="share-metrics"><div><strong>{activeLinks.length}</strong><span>Active links</span></div><div><strong>{totals.views}</strong><span>Page views</span></div><div><strong>{totals.clicks}</strong><span>Source opens</span></div><div><strong>{totals.contacts}</strong><span>Discuss clicks</span></div></div>
    {!links.length ? <p className="share-empty">Create a branded source link from the written-note or social-image workspace. Its private owner key stays only in this browser.</p> : <div className="owned-share-list">{links.slice(0, 8).map((link) => {
      const revoked = Boolean(link.stats?.revokedAt);
      const expired = link.expiresAt <= Date.now();
      return <article key={link.id} className={revoked || expired ? "inactive" : ""}><div><span>{revoked ? "REVOKED" : expired ? "EXPIRED" : `ACTIVE · ${new Date(link.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}</span><strong>{link.title}</strong><small>{link.stats?.views || 0} views · {link.stats?.sourceClicks || 0} source opens · {link.stats?.contactClicks || 0} discuss clicks</small></div><div>{!revoked && !expired && <><a href={link.url} target="_blank" rel="noreferrer">Open</a><button type="button" onClick={() => void shareLink(link)}>Share</button><button type="button" className={confirmId === link.id ? "confirm" : "revoke"} onClick={() => void revokeLink(link)}>{confirmId === link.id ? "Confirm revoke" : "Revoke"}</button></>}</div></article>;
    })}</div>}
    {status && <p className="studio-status" role="status">{status}</p>}
  </section>;
}

function shortStoryContext(story: Story) {
  const sentence = story.summary.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || story.summary;
  return sentence.length > 210 ? `${sentence.slice(0, 207).trimEnd()}…` : sentence;
}

function downloadSocialCard(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !line) line = candidate;
    else { lines.push(line); line = word; }
  });
  if (line) lines.push(line);
  const clipped = lines.length > maxLines;
  const visible = lines.slice(0, maxLines);
  if (clipped && visible.length) {
    while (context.measureText(`${visible[visible.length - 1]}…`).width > maxWidth) visible[visible.length - 1] = visible[visible.length - 1].split(" ").slice(0, -1).join(" ");
    visible[visible.length - 1] += "…";
  }
  visible.forEach((item, index) => context.fillText(item, x, y + index * lineHeight));
  return y + visible.length * lineHeight;
}

function loadCanvasImage(source: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!source) { resolve(null); return; }
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

async function renderSocialCard(canvas: HTMLCanvasElement, options: { story: Story; headline: string; context: string; profile: DistributorProfile; format: SocialFormat; template: SocialTemplate; impact?: CompanyImpact | null }) {
  const { story, headline, context: summary, profile, format, template, impact } = options;
  const width = 1080;
  const height = format === "portrait" ? 1350 : 1080;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;
  const accent = profile.brandColor || "#d0aa65";
  const guidance = clientActionGuidance(story);
  const backgrounds: Record<SocialTemplate, [string, string]> = { signal: ["#08121a", "#112839"], market: ["#071a18", "#12352e"], regulatory: ["#15101b", "#302037"], festival: ["#201512", "#58331f"] };
  const [start, end] = backgrounds[template];
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, start);
  gradient.addColorStop(1, end);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.save();
  context.globalAlpha = .12;
  context.strokeStyle = "#9fc4d5";
  context.lineWidth = 1;
  for (let x = 0; x < width; x += 90) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke(); }
  for (let y = 0; y < height; y += 90) { context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke(); }
  context.globalAlpha = .36;
  context.strokeStyle = accent;
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(width * .58, height * .82);
  context.bezierCurveTo(width * .72, height * .68, width * .74, height * .9, width * .88, height * .61);
  context.bezierCurveTo(width * .94, height * .5, width * .94, height * .63, width * 1.04, height * .4);
  context.stroke();
  context.restore();

  const margin = 76;
  const logo = await loadCanvasImage(profile.logo);
  if (logo) {
    context.save();
    context.beginPath();
    context.roundRect(margin, 62, 88, 88, 18);
    context.clip();
    const scale = Math.max(88 / logo.width, 88 / logo.height);
    context.drawImage(logo, margin + (88 - logo.width * scale) / 2, 62 + (88 - logo.height * scale) / 2, logo.width * scale, logo.height * scale);
    context.restore();
  } else {
    context.strokeStyle = accent;
    context.lineWidth = 3;
    context.beginPath();
    context.arc(margin + 44, 106, 43, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = accent;
    context.font = "600 32px Georgia, serif";
    context.textAlign = "center";
    context.fillText("IF", margin + 44, 117);
    context.textAlign = "left";
  }
  context.fillStyle = "#f1f5f6";
  context.font = "600 32px Georgia, serif";
  context.fillText(profile.name || "IntelFlow Pro", margin + 112, 99);
  context.fillStyle = accent;
  context.font = "700 15px Arial, sans-serif";
  context.fillText("DISTRIBUTOR INTELLIGENCE", margin + 112, 128);

  const category = template === "regulatory" ? "REGULATORY WATCH" : template === "market" ? "MARKET CONTEXT" : template === "festival" ? "COMMUNITY GREETING" : "DAILY SIGNAL";
  context.fillStyle = accent;
  context.font = "700 18px Arial, sans-serif";
  context.fillText(template === "festival" ? category : `${category}  ·  ${story.tags.slice(0, 2).join(" + ").toUpperCase()}`, margin, 235);
  context.fillStyle = "#f5f6f3";
  context.font = `600 ${format === "portrait" ? 72 : 68}px Georgia, serif`;
  const headlineLines = impact ? (format === "portrait" ? 4 : 3) : (format === "portrait" ? 5 : 4);
  let cursor = wrapCanvasText(context, headline, margin, 320, width - margin * 2, format === "portrait" ? 82 : 78, headlineLines);
  cursor += 28;
  context.fillStyle = "#aebbc1";
  context.font = "400 29px Arial, sans-serif";
  wrapCanvasText(context, summary, margin, cursor, width - margin * 2, 42, impact ? 1 : format === "portrait" ? 4 : 2);

  const sourceY = height - 390;
  context.fillStyle = "rgba(7,15,20,.72)";
  context.roundRect(margin, sourceY, width - margin * 2, 265, 18);
  context.fill();
  let panelY = sourceY + 34;
  if (impact && template !== "festival") {
    context.fillStyle = accent;
    context.font = "700 16px Arial, sans-serif";
    context.fillText("COMPANY IMPACT · RESEARCH CONTEXT", margin + 24, panelY);
    context.fillStyle = "#f2f4f4";
    context.font = "700 18px Arial, sans-serif";
    context.fillText(`${impact.ticker} · ${impact.direction.toUpperCase()} · ${impact.posture.toUpperCase()}`, margin + 24, panelY + 32);
    context.fillStyle = "#aab6bb";
    context.font = "400 15px Arial, sans-serif";
    wrapCanvasText(context, impact.mechanism, margin + 24, panelY + 57, width - margin * 2 - 48, 19, 2);
    panelY += 92;
  }
  context.fillStyle = accent;
  context.font = "700 16px Arial, sans-serif";
  if (template === "festival") {
    context.fillText("A NOTE FOR OUR COMMUNITY", margin + 24, panelY);
    context.fillStyle = "#eef2f3";
    context.font = "400 21px Georgia, serif";
    wrapCanvasText(context, "Relationships grow through useful updates, steady guidance and thoughtful conversations.", margin + 24, panelY + 42, width - margin * 2 - 48, 28, 3);
    context.fillStyle = "#9ba8ae";
    context.font = "600 14px Arial, sans-serif";
    context.fillText("Created locally with IntelFlow Community Pack", margin + 24, sourceY + 221);
  } else {
    context.fillText("CLIENT ACTION PLAN", margin + 24, panelY);
    context.font = "700 15px Arial, sans-serif";
    context.fillText("DO", margin + 24, panelY + 34);
    context.fillStyle = "#eef2f3";
    context.font = "400 16px Arial, sans-serif";
    wrapCanvasText(context, guidance.do, margin + 70, panelY + 34, width - margin * 2 - 100, 20, 1);
    context.fillStyle = "#d8a879";
    context.font = "700 15px Arial, sans-serif";
    context.fillText("AVOID", margin + 24, panelY + 67);
    context.fillStyle = "#eef2f3";
    context.font = "400 16px Arial, sans-serif";
    wrapCanvasText(context, guidance.dont, margin + 90, panelY + 67, width - margin * 2 - 120, 20, 1);
    context.fillStyle = "#9ba8ae";
    context.font = "600 14px Arial, sans-serif";
    context.fillText(`Source: ${story.source.slice(0, 62)}`, margin + 24, sourceY + 221);
  }
  const disclaimer = profile.disclaimer.length > 112 ? `${profile.disclaimer.slice(0, 109).trimEnd()}…` : profile.disclaimer;
  context.fillStyle = "#788990";
  context.font = "400 13px Arial, sans-serif";
  context.fillText(disclaimer, margin + 24, sourceY + 247);

  context.strokeStyle = accent;
  context.globalAlpha = .65;
  context.beginPath(); context.moveTo(margin, height - 92); context.lineTo(width - margin, height - 92); context.stroke();
  context.globalAlpha = 1;
  const identity = [profile.arn, profile.euin].filter(Boolean).join("  ·  ");
  context.fillStyle = "#f1f4f5";
  context.font = "600 17px Arial, sans-serif";
  context.fillText(identity || "IntelFlow · Distributor Pro", margin, height - 55);
  context.textAlign = "right";
  context.fillStyle = "#91a0a8";
  context.font = "400 14px Arial, sans-serif";
  context.fillText(template === "festival" ? "Created for community sharing" : "For information only · Verify the original source", width - margin, height - 55);
  context.textAlign = "left";
}

function clientActionGuidance(story: Story) {
  if (story.tags.includes("Regulation")) return { do: "Continue with your current plan while we confirm whether the official change applies to you.", dont: "Stop, switch or add an investment only because of this headline." };
  if (story.tags.includes("Personal Finance")) return { do: "Check whether your goal, time horizon or liquidity need has actually changed.", dont: "Choose a product or make a portfolio change from one news update." };
  if (story.tags.includes("US")) return { do: "Treat this as global context and stay aligned with your agreed goals and time horizon.", dont: "Assume every US headline requires an immediate change to your India investments." };
  if (story.tags.includes("Markets") || story.tags.includes("Economy")) return { do: "Stay with your agreed plan and tell us if your goals, horizon or cash needs have changed.", dont: "React to a single market session or headline by buying, selling or switching." };
  return { do: "Use this update as context and continue with the plan built around your goals.", dont: "Make an immediate financial decision from this headline alone." };
}

function buildClientNote(story: Story, profile: DistributorProfile, context: string, impact: CompanyImpact | null = null) {
  const identity = [profile.name, profile.arn, profile.euin].filter(Boolean).join(" · ");
  const guidance = clientActionGuidance(story);
  const marketReadThrough = impact ? `\n\nCompany Impact — ${impact.ticker}: ${impact.direction}. ${impact.mechanism}\nResearch posture: ${impact.posture}. What to verify: ${impact.verify}` : "";
  return `Hello,\n\n${story.title}\n\nIn short: ${context}${marketReadThrough}\n\nWhat you can do: ${guidance.do}\nWhat to avoid: ${guidance.dont}\n\nSource: ${story.source}\n${story.sourceUrl}\n\nFor information only. This is not a research recommendation or a buy/sell view. One headline alone does not call for an immediate portfolio change.${identity ? `\n\n${identity}` : ""}${profile.phone ? `\n${profile.phone}` : ""}\n\nDisclaimer: ${profile.disclaimer}`;
}

function conversationCue(story: Story) {
  if (story.tags.includes("Regulation")) return "Check the official circular, effective date and who is affected before discussing it.";
  if (story.tags.includes("US")) return "Explain the possible India link through rates, currency or sentiment—without assuming a direct portfolio impact.";
  if (story.tags.includes("Personal Finance")) return "Connect the topic to goals, time horizon and liquidity needs instead of presenting a product answer.";
  if (story.tags.includes("Economy")) return "Separate the economic signal from the client decision; explain what changed and what has not.";
  return "Use this as context for a calm check-in, not as a reason to recommend an immediate change.";
}

function readableDate(value: string, fallback = "Date not extracted") {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : fallback;
}

function regulatorStory(update: RegulatorUpdate): Story {
  const numericId = Math.abs([...update.id].reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0));
  return {
    id: numericId,
    title: update.title,
    summary: update.brief,
    source: `${update.authority} — Official update`,
    sourceUrl: update.url,
    age: readableDate(update.publishedAt, "Latest official listing"),
    readTime: "1 min brief",
    tags: ["Regulation", "India", update.category],
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=82",
    accent: "#d0aa65",
    coverage: 1,
  };
}

function RegulatorInbox({ updates, health, loading, onRefresh, onShare }: { updates: RegulatorUpdate[]; health: RegulatorHealth[]; loading: boolean; onRefresh: () => void; onShare: (story: Story) => void }) {
  const [filter, setFilter] = useState("All");
  const [briefs, setBriefs] = useState<Record<string, DocumentBrief>>({});
  const [briefLoading, setBriefLoading] = useState("");
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminders, setReminders] = useState<Array<{ id: string; title: string; date: string }>>(() => storage.get("intelflow:compliance-reminders", []));
  const filters = ["All", "SEBI", "AMFI", "RBI", "IRDAI", "PFRDA", "Expense ratio / TER"];
  const visible = updates.filter((update) => filter === "All" || update.authority === filter || update.category === filter).slice(0, 18);
  const liveSources = health.filter((source) => source.status === "live").length;

  async function scanDocument(update: RegulatorUpdate) {
    if (briefs[update.id]) return setBriefs((current) => { const next = { ...current }; delete next[update.id]; return next; });
    setBriefLoading(update.id);
    try {
      const response = await fetch(`/api/regulator-document?url=${encodeURIComponent(update.url)}&title=${encodeURIComponent(update.title)}`);
      const result = await response.json() as DocumentBrief;
      setBriefs((current) => ({ ...current, [update.id]: result }));
      trackEvent("regulator_document_scanned", { authority: update.authority, method: result.method || "error", category: update.category });
    } catch {
      setBriefs((current) => ({ ...current, [update.id]: { method: "unavailable", extractionStatus: "Scan unavailable", category: update.category, affectedAudience: [], effectiveDate: "Not extracted", keyPoints: [], action: "Open and verify the official document.", disclaimer: "The document could not be scanned.", error: "The document could not be scanned." } }));
    } finally {
      setBriefLoading("");
    }
  }

  function addReminder(event: FormEvent) {
    event.preventDefault();
    if (!reminderTitle.trim() || !reminderDate) return;
    const next = [...reminders, { id: `${Date.now()}`, title: reminderTitle.trim(), date: reminderDate }].sort((a, b) => a.date.localeCompare(b.date));
    setReminders(next);
    storage.set("intelflow:compliance-reminders", next);
    setReminderTitle("");
    setReminderDate("");
    trackEvent("compliance_reminder_added", { reminder_date: reminderDate });
  }

  function removeReminder(id: string) {
    const next = reminders.filter((reminder) => reminder.id !== id);
    setReminders(next);
    storage.set("intelflow:compliance-reminders", next);
  }

  return <>
    <header className="regulator-inbox-hero"><div><span className="pro-kicker">LIVE OFFICIAL INBOX</span><h2>Regulator Watch</h2><p>Latest machine-readable updates from official SEBI, AMFI, RBI, IRDAI and PFRDA sources, with transparent document scans.</p></div><div><strong>{updates.length}</strong><span>updates found</span><small>{liveSources}/{health.length || 5} sources live</small><button type="button" onClick={onRefresh} disabled={loading}>{loading ? "Checking…" : "Refresh inbox"}</button></div></header>
    <p className="watch-disclaimer"><strong>Verify before acting.</strong> Briefs are automated text extraction, not legal or compliance advice. Tables, annexures and scanned PDF pages may be missed.</p>
    <nav className="regulator-filters" aria-label="Filter regulator updates">{filters.map((item) => <button type="button" key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</nav>
    <div className="regulator-source-health">{health.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.authority} className={source.status === "live" ? "live" : "limited"}><i />{source.authority}<span>{source.status === "live" ? `${source.count} live` : source.status}</span></a>)}</div>
    <div className="regulator-update-list">
      {loading && !updates.length ? <p className="regulator-empty">Checking official sources…</p> : visible.length ? visible.map((update) => {
        const brief = briefs[update.id];
        return <article key={update.id} className={update.category === "Expense ratio / TER" ? "expense-ratio" : ""}>
          <div className="regulator-card-head"><span>{update.authority}</span><small>{update.documentType} · {readableDate(update.publishedAt, "Latest listing")}</small><i>{update.category}</i></div>
          <h3>{update.title}</h3><p>{update.brief}</p>
          <div className="regulator-card-actions"><a href={update.url} target="_blank" rel="noreferrer" onClick={() => trackEvent("regulator_source_opened", { authority: update.authority, category: update.category })}>Official source ↗</a><button type="button" onClick={() => void scanDocument(update)}>{briefLoading === update.id ? "Scanning…" : brief ? "Hide brief" : "Simplify document"}</button><button type="button" className="share-update" onClick={() => onShare(regulatorStory(update))}>Share with community →</button></div>
          {brief && <div className={`document-brief ${brief.error ? "error" : ""}`}>
            <header><div><span>{brief.category}</span><strong>{brief.extractionStatus}</strong></div><i>{brief.method}</i></header>
            {brief.error ? <p>{brief.error} Open the official source to review it manually.</p> : <><dl><div><dt>Affected</dt><dd>{brief.affectedAudience.join(" · ")}</dd></div><div><dt>Effective date</dt><dd>{brief.effectiveDate}</dd></div></dl><strong>What to know</strong><ul>{brief.keyPoints.map((point, index) => <li key={index}>{point}</li>)}</ul><p><b>Next check:</b> {brief.action}</p></>}
            <small>{brief.disclaimer}</small>
          </div>}
        </article>;
      }) : <p className="regulator-empty">No machine-readable items matched this filter. Use the official links below.</p>}
    </div>
    <section className="compliance-calendar">
      <header><div><span className="pro-kicker">LOCAL WORKFLOW CALENDAR</span><h3>Compliance calendar</h3><p>Add your organisation’s verified dates. IntelFlow does not invent statutory deadlines.</p></div><strong>{reminders.length}</strong></header>
      <div className="compliance-radar"><article><span>DAILY</span><strong>Official circular scan</strong><small>SEBI · AMFI · RBI · IRDAI · PFRDA</small></article><article><span>MONTHLY</span><strong>Expense-ratio radar</strong><small>{updates.filter((update) => update.category === "Expense ratio / TER").length} current item(s) detected</small></article><article><span>VERIFY</span><strong>ARN, EUIN, DSC and disclosure checks</strong><small>Set dates from your official records and policy.</small></article></div>
      {reminders.length > 0 && <div className="compliance-reminders">{reminders.map((reminder) => <article key={reminder.id}><time dateTime={reminder.date}>{readableDate(reminder.date)}</time><strong>{reminder.title}</strong><button type="button" onClick={() => removeReminder(reminder.id)} aria-label={`Remove ${reminder.title}`}>×</button></article>)}</div>}
      <details><summary>Add a verified reminder</summary><form onSubmit={addReminder}><input aria-label="Reminder title" value={reminderTitle} onChange={(event) => setReminderTitle(event.target.value)} placeholder="e.g. Annual DSC submission" /><input aria-label="Reminder date" type="date" value={reminderDate} onChange={(event) => setReminderDate(event.target.value)} /><button type="submit">Save locally</button></form></details>
    </section>
    <OfficialRegulatorLinks />
  </>;
}

function buildDailyDigest(stories: Story[], updates: RegulatorUpdate[], profile: DistributorProfile) {
  const date = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const storyLines = stories.slice(0, 5).flatMap((story, index) => [`${index + 1}. ${story.title}`, `   ${shortStoryContext(story)}`, `   Source: ${story.source} - ${story.sourceUrl}`, ""]);
  const regulatorLines = updates.slice(0, 3).flatMap((update) => [`- ${update.authority}: ${update.title}`, `  ${update.url}`]);
  const identity = [profile.name, profile.arn, profile.euin].filter(Boolean).join(" | ");
  return [
    "INTELFLOW DAILY CLIENT DIGEST", date, "",
    "TODAY IN FIVE", ...storyLines,
    "REGULATOR WATCH", ...(regulatorLines.length ? regulatorLines : ["No machine-readable official item was available when this digest was created. Verify the regulator websites directly."]), "",
    "CLIENT ACTION", "What you can do: Stay aligned with your agreed goals and raise any change in time horizon, cash needs or risk comfort.", "What to avoid: Do not buy, sell or switch only because of one headline.", "",
    "IMPORTANT", "This digest is for information only. It is not investment advice, a research recommendation or a buy/sell view. One headline does not require an immediate portfolio change. Verify each original source before relying on it.",
    profile.disclaimer ? `Disclaimer: ${profile.disclaimer}` : "", identity ? `Shared by: ${identity}` : "", profile.phone ? `Contact: ${profile.phone}` : "",
  ].filter((line) => line !== "").join("\n");
}

function pdfSafe(value: string) {
  return value.normalize("NFKD").replace(/₹/g, "Rs ").replace(/[–—]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^\x20-\x7E\n]/g, "");
}

function wrapDigestLines(value: string, width = 86) {
  return pdfSafe(value).split("\n").flatMap((paragraph) => {
    if (!paragraph.trim()) return [""];
    const words = paragraph.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    words.forEach((word) => {
      if (!line || `${line} ${word}`.length <= width) line = line ? `${line} ${word}` : word;
      else { lines.push(line); line = word; }
    });
    if (line) lines.push(line);
    return lines;
  });
}

function createDigestPdf(value: string) {
  const lines = wrapDigestLines(value);
  const pages = Array.from({ length: Math.max(1, Math.ceil(lines.length / 46)) }, (_, index) => lines.slice(index * 46, (index + 1) * 46));
  const pageIds = pages.map((_, index) => 3 + index);
  const contentIds = pages.map((_, index) => 3 + pages.length + index);
  const fontId = 3 + pages.length * 2;
  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  pages.forEach((page, index) => {
    objects[pageIds[index]] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`;
    const commands = page.map((line, lineIndex) => {
      const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
      const size = lineIndex === 0 && index === 0 ? 16 : /^[A-Z][A-Z ]+$/.test(line) ? 12 : 9;
      return `/F1 ${size} Tf (${escaped}) Tj T*`;
    }).join("\n");
    const stream = `BT\n50 798 Td\n14 TL\n${commands}\nET`;
    objects[contentIds[index]] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  let output = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id <= fontId; id += 1) { offsets[id] = output.length; output += `${id} 0 obj\n${objects[id]}\nendobj\n`; }
  const xref = output.length;
  output += `xref\n0 ${fontId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= fontId; id += 1) output += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  output += `trailer\n<< /Size ${fontId + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([output], { type: "application/pdf" });
}

function downloadBlob(blob: Blob, name: string) {
  const anchor = document.createElement("a");
  const url = URL.createObjectURL(blob);
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function DailyClientDigest({ stories, updates, profile, locked, onOutput }: { stories: Story[]; updates: RegulatorUpdate[]; profile: DistributorProfile; locked: boolean; onOutput: (action: string) => void }) {
  const [status, setStatus] = useState("");
  const digest = buildDailyDigest(stories, updates, profile);
  const dateKey = new Date().toISOString().slice(0, 10);
  function record(action: string, message: string) { onOutput(action); setStatus(message); trackEvent("daily_digest_exported", { format: action.replace("daily_digest_", "") }); }
  async function copyDigest() { if (locked) return; await navigator.clipboard?.writeText(digest); record("daily_digest_copy", "Client digest copied."); }
  function downloadText() { if (locked) return; downloadBlob(new Blob([digest], { type: "text/plain;charset=utf-8" }), `intelflow-client-digest-${dateKey}.txt`); record("daily_digest_text", "Text digest downloaded."); }
  function downloadPdf() { if (locked) return; downloadBlob(createDigestPdf(digest), `intelflow-client-digest-${dateKey}.pdf`); record("daily_digest_pdf", "PDF digest downloaded."); }
  return <section className="daily-client-digest"><div><span className="pro-kicker">DAILY CLIENT DIGEST</span><h2>Five stories. One calm brief.</h2><p>Source-backed news, regulator watch and a neutral client action.</p></div><div className="digest-preview"><span>{stories.length} STORIES</span><strong>{updates.slice(0, 3).length} official updates</strong><small>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</small></div><button type="button" className="digest-primary" disabled={locked} onClick={downloadPdf}>Download PDF <span>↓</span></button><details className="digest-more"><summary>Other formats</summary><div><button type="button" disabled={locked} onClick={() => void copyDigest()}>Copy text</button><button type="button" disabled={locked} onClick={downloadText}>Download .txt</button></div></details>{status && <p role="status">{status}</p>}</section>;
}

function OfficialRegulatorLinks() {
  const regulators = [
    ["SEBI circulars", "https://www.sebi.gov.in/legal/circulars.html"],
    ["AMFI", "https://www.amfiindia.com/"],
    ["RBI", "https://www.rbi.org.in/"],
    ["IRDAI", "https://irdai.gov.in/circulars"],
    ["PFRDA", "https://www.pfrda.org.in/"],
  ];
  return <div className="official-links">{regulators.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer" onClick={() => trackEvent("regulator_link_opened", { regulator: name })}>{name} ↗</a>)}</div>;
}
