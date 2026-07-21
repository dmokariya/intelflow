"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

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

type AppPage = "feed" | "saved" | "discover" | "pro" | "settings";
type ProTab = "desk" | "studio" | "regulators" | "profile";
type StudioTool = "note" | "image";

const appPages: AppPage[] = ["feed", "saved", "discover", "pro", "settings"];
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
const trialDays = 7;
const trialActions = 10;
const trialStorageKey = "intelflow:pro-trial";
const ownedSharesStorageKey = "intelflow:owned-shares";

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
  const [page, setPage] = useState<AppPage>("feed");
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

  useEffect(() => {
    setOnboarded(storage.get("intelflow:onboarded", false));
    setSelected(storage.get("intelflow:interests", ["AI", "India", "Technology", "Markets"]));
    setBookmarks(storage.get("intelflow:bookmarks", []));
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
      const nextPage = requestedPage && appPages.includes(requestedPage) ? requestedPage : "feed";
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
    writeAppUrl("feed");
  }

  function toggleBookmark(id: number) {
    setBookmarks((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      if (!current.includes(id)) trackEvent("story_bookmarked", { item_id: String(id) });
      storage.set("intelflow:bookmarks", next);
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
      url.searchParams.delete("topic");
    } else {
      url.searchParams.delete("tab");
      url.searchParams.delete("story");
      url.searchParams.delete("tool");
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
          <button className="icon-button" aria-label="Search" onClick={() => navigate("discover")}>⌕</button>
          <button className="avatar-button" aria-label="Open menu" onClick={() => setMenuOpen((value) => !value)}>G</button>
        </div>
        {menuOpen && (
          <div className="profile-menu">
            <strong>Guest distributor</strong>
            <span>Your interests and trial progress stay on this device.</span>
            <button onClick={() => navigate("settings")}>Settings</button>
          </div>
        )}
      </header>

      {page === "feed" && (
        <>
          <section className="welcome-row">
            <div>
              <span className="date-label">LIVE · INDIA + UNITED STATES</span>
              <h1>Your daily desk.</h1>
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

          <nav className="tag-strip" aria-label="News filters">
            {["For you", ...selected].map((tag) => (
              <button key={tag} className={activeTag === tag ? "active" : ""} onClick={() => chooseTopic(tag)}>
                {tag}
              </button>
            ))}
          </nav>
        </>
      )}

      {page === "discover" && <Discover selected={selected} setSelected={setSelected} />}
      {page === "pro" && <DistributorPro stories={feedStories} trial={trial} setTrial={setTrial} profile={profile} setProfile={setProfile} initialStory={explainStory} tab={proTab} tool={studioTool} navigateTab={navigatePro} />}
      {page === "settings" && <Settings selected={selected} trial={trial} reset={() => { storage.set("intelflow:onboarded", false); setOnboarded(false); }} />}

      {(page === "feed" || page === "saved") && (
        <section className="story-stage">
          {page === "saved" && <div className="section-heading"><span>SAVED BRIEFING</span><h1>Your reading list</h1></div>}
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

      <nav className="bottom-nav pro-nav" aria-label="Primary navigation">
        <button className={page === "feed" ? "active" : ""} onClick={() => navigate("feed")}><span>⌂</span>Briefing</button>
        <button className={page === "discover" ? "active" : ""} onClick={() => navigate("discover")}><span>⌕</span>Discover</button>
        <button className={page === "saved" ? "active" : ""} onClick={() => navigate("saved")}><span>☆</span>Saved</button>
        <button className={page === "pro" ? "active" : ""} onClick={() => navigate("pro")}><span>◆</span>Distributor</button>
        <button className={page === "settings" ? "active" : ""} onClick={() => navigate("settings")}><span>☷</span>Settings</button>
      </nav>
    </main>
  );
}

function Brand() {
  return <a className="brand editorial-brand" href="/" aria-label="IntelFlow home"><span className="brand-seal" aria-hidden="true"><b>I</b><i>F</i></span><span className="brand-lockup"><span className="wordmark">Intel<strong>Flow</strong></span><small>THE INTELLIGENCE BRIEF</small></span></a>;
}

function topicColor(tag: string) {
  return ({ AI: "#6550b8", India: "#bf563d", US: "#244d75", Markets: "#08745c", Economy: "#a16d20", Regulation: "#6e4d85", "Personal Finance": "#207a65", Energy: "#9a6b1f", Technology: "#256b91", Business: "#a66f1b", Startups: "#a94c7e", World: "#354a70", Science: "#277e86", Health: "#b44c65", Cricket: "#43763f", Sports: "#a9612a", Entertainment: "#87528d" } as Record<string, string>)[tag] || "#594b82";
}

function Discover({ selected, setSelected }: { selected: string[]; setSelected: (next: string[]) => void }) {
  const [query, setQuery] = useState("");
  const options = interests.filter(([tag, label]) => `${tag} ${label}`.toLowerCase().includes(query.toLowerCase()));
  function toggle(tag: string) {
    const next = selected.includes(tag) ? selected.filter((item) => item !== tag) : [...selected, tag];
    setSelected(next);
    storage.set("intelflow:interests", next);
  }
  return (
    <section className="utility-page">
      <span className="eyebrow">DISCOVER</span><h1>Shape your signal.</h1><p>Follow topics to tune what appears in your daily briefing.</p>
      <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search interests" /></label>
      <div className="discover-grid">
        {options.map(([tag, label, icon]) => <button key={tag} className={selected.includes(tag) ? "followed" : ""} onClick={() => toggle(tag)}><span>{icon}</span><strong>{label}</strong><i>{selected.includes(tag) ? "Following" : "Follow"}</i></button>)}
      </div>
    </section>
  );
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

function DistributorPro({ stories, trial, setTrial, profile, setProfile, initialStory, tab, tool, navigateTab }: {
  stories: Story[];
  trial: TrialState | null;
  setTrial: (value: TrialState | null | ((current: TrialState | null) => TrialState | null)) => void;
  profile: DistributorProfile;
  setProfile: (value: DistributorProfile) => void;
  initialStory: Story | null;
  tab: ProTab;
  tool: StudioTool;
  navigateTab: (tab: ProTab, story?: Story | null, tool?: StudioTool) => void;
}) {
  const [studioStory, setStudioStory] = useState<Story | null>(initialStory);
  const [copied, setCopied] = useState(false);
  const [copiedTool, setCopiedTool] = useState("");
  const [draft, setDraft] = useState("");
  const [ownedShares, setOwnedShares] = useState<OwnedShare[]>(() => storage.get(ownedSharesStorageKey, []));
  const [shareExpiry, setShareExpiry] = useState(30);
  const [noteShareStatus, setNoteShareStatus] = useState("");
  const contextCache = useRef(new Map<string, string>());
  const [articleContext, setArticleContext] = useState<{ storyId: number; text: string; status: "loading" | "article" | "fallback" }>({
    storyId: initialStory?.id || 0,
    text: initialStory ? shortStoryContext(initialStory) : "",
    status: "fallback",
  });
  const todayKey = new Date().toISOString().slice(0, 10);
  const [completedActions, setCompletedActions] = useState<string[]>(() => storage.get(`intelflow:pro-actions:${todayKey}`, []));
  const morningFive = selectMorningFive(stories);
  const practiceStories = stories.filter((story) => story.tags.some((tag) => ["Markets", "Regulation", "Personal Finance", "US", "Economy"].includes(tag))).slice(0, 6);
  const activeStudioStory = studioStory || stories[0] || demoStories[0];
  const resolvedArticleContext = articleContext.storyId === activeStudioStory.id ? articleContext.text : shortStoryContext(activeStudioStory);
  const articleContextStatus = articleContext.storyId === activeStudioStory.id ? articleContext.status : "loading";
  const studioStoryOptions = [activeStudioStory, ...stories.filter((story) => story.id !== activeStudioStory.id)].slice(0, 40);
  const trialStatus = getTrialStatus(trial);
  const trialProgress = trialStatus.locked ? "Trial complete" : [trialStatus.daysRemaining ? `${trialStatus.daysRemaining} day${trialStatus.daysRemaining === 1 ? "" : "s"} left` : "Time requirement complete", trialStatus.actionsRemaining ? `${trialStatus.actionsRemaining} output${trialStatus.actionsRemaining === 1 ? "" : "s"} left` : "Output allowance used"].join(" · ");
  const dailyActions = ["Read the Morning 5", "Check official regulator updates", "Prepare one neutral client note", "Review pending follow-ups"];
  const quickMessages = [
    { title: "Market check-in", text: "Hello. Markets are moving today, but one session alone does not require an immediate portfolio change. Let me know if your goals, time horizon or liquidity needs have changed." },
    { title: "Review reminder", text: "Hello. A periodic review helps us reconnect your investments with your goals and time horizon. Please share a convenient time; no action is implied by this message." },
    { title: "Headline response", text: "This headline is useful context, not a buy or sell signal. I am reviewing the original source and the wider picture before drawing any conclusion." },
  ];
  const regulatorAlerts = [
    { authority: "SEBI", title: "Review new circulars before client communication", time: "Watchlist · Today", level: "Action" },
    { authority: "AMFI", title: "Distributor guidance and operational updates", time: "Watchlist · Daily", level: "Monitor" },
    { authority: "RBI", title: "Policy and liquidity announcements", time: "Watchlist · This week", level: "Context" },
    { authority: "IRDAI", title: "Insurance regulations and consumer-protection updates", time: "Watchlist · Daily", level: "Monitor" },
    { authority: "PFRDA", title: "Pension and NPS circulars and notices", time: "Watchlist · Daily", level: "Monitor" },
  ];

  useEffect(() => {
    if (initialStory) setStudioStory(initialStory);
  }, [initialStory]);

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
      if (!current) return current;
      const next = { ...current, actions: current.actions + 1 };
      storage.set(trialStorageKey, next);
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
    setDraft(buildClientNote(activeStudioStory, profile, resolvedArticleContext));
  }, [activeStudioStory, profile, resolvedArticleContext]);

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
      await renderSocialCard(canvas, { story: activeStudioStory, headline: activeStudioStory.title, context: resolvedArticleContext, profile, format: "square", template });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Preview image could not be created.");
      const share = await publishHostedShare(activeStudioStory, resolvedArticleContext, profile, blob, shareExpiry);
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

  function toggleAction(action: string) {
    setCompletedActions((current) => {
      const next = current.includes(action) ? current.filter((item) => item !== action) : [...current, action];
      storage.set(`intelflow:pro-actions:${todayKey}`, next);
      return next;
    });
  }

  async function copyTool(title: string, text: string) {
    if (!allowOutput()) return;
    await navigator.clipboard?.writeText(text);
    trackEvent("client_template_copied", { template_name: title });
    recordTrialAction("quick_message_copied");
    setCopiedTool(title);
    window.setTimeout(() => setCopiedTool(""), 1600);
  }

  if (!trial && tab !== "regulators") {
    return (
      <section className="pro-landing">
        <div className="pro-hero">
          <span className="pro-kicker">INTELFLOW DISTRIBUTOR PRO</span>
          <h1>Your morning intelligence desk.</h1>
          <p>Save time every working day with a focused briefing, action checklist, official-source watch, practical conversation cues and ready-to-edit client messages.</p>
          <div className="pro-price"><strong>₹399</strong><span>/ month<br />or ₹3,999 yearly</span></div>
          <button onClick={startTrial}>Start free local trial <span>→</span></button>
          <a className="trial-regulator-link" href="/?view=pro&tab=regulators">Browse free Regulator Watch ↗</a>
          <small>7 days and 10 client-content actions, whichever gives you longer. Trial controls stay on this device; branded links are hosted only when you choose to publish one. No payment or subscription.</small>
        </div>
        <div className="pro-feature-grid">
          <article><span>01</span><strong>Action desk</strong><p>Morning 5 plus a daily checklist that keeps the working day moving.</p></article>
          <article><span>02</span><strong>Practice feed</strong><p>Live stories converted into concise client-conversation angles.</p></article>
          <article><span>03</span><strong>Client content studio</strong><p>Turn one headline into a concise note or an attention-grabbing branded image.</p></article>
          <article><span>04</span><strong>Source + compliance kit</strong><p>Neutral starters, regulator links, attribution and review reminders in one workflow.</p></article>
        </div>
      </section>
    );
  }

  return (
    <section className="pro-workspace">
      <header className="pro-workspace-head">
        <div><span className="pro-kicker">DISTRIBUTOR PLATFORM · {trial ? "LOCAL TRIAL" : "FREE ACCESS"}</span><h1>Good morning{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}.</h1><p>Your market, business and regulatory desk in one calm view.</p></div>
        <span className={`pro-status ${trialStatus.locked ? "locked" : ""}`}>{!trial ? "FREE ACCESS" : trialStatus.locked ? "TRIAL COMPLETE" : `TRIAL DAY ${trialStatus.day}`}</span>
      </header>
      {trial && <div className={`trial-meter ${trialStatus.locked ? "locked" : ""}`}><div><span>LOCAL TRIAL</span><strong>{trialProgress}</strong></div><p>Usage is stored only on this browser. News and official regulator access remain free.</p></div>}
      {trialStatus.locked && <section className="trial-upgrade-banner"><div><span>CONTINUE WITH INTELFLOW PRO</span><h2>Your trial is complete.</h2><p>Client-content copying, image generation and exports are paused. The briefing and regulator sources remain available.</p></div><div><strong>₹399<small>/month</small></strong><a href="mailto:hello@swarnimcapital.com?subject=IntelFlow%20Pro%20early%20access" onClick={() => trackEvent("pro_upgrade_clicked", { placement: "trial_gate" })}>Request Pro access →</a><small>Early-access request only. No payment is collected here.</small></div></section>}
      <div className="pro-value-strip"><span>YOUR DAILY VALUE</span><strong>5 signals</strong><i /> <strong>4 actions</strong><i /> <strong>3 ready messages</strong></div>
      <nav className="pro-tabs" aria-label="Distributor Pro sections">
        <button className={tab === "desk" ? "active" : ""} onClick={() => navigateTab("desk")}>Daily workspace</button>
        <button className={tab === "studio" ? "active" : ""} onClick={() => navigateTab("studio", activeStudioStory, tool)}>Client studio</button>
        <button className={tab === "regulators" ? "active" : ""} onClick={() => navigateTab("regulators")}>Regulator watch</button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => navigateTab("profile")}>Profile</button>
      </nav>

      {tab === "desk" && <div className="unified-desk">
        <div className="desk-action-grid">
          <section className="daily-checklist">
            <div className="pro-section-title"><div><span>TODAY’S ROUTINE</span><h2>Action checklist</h2></div><i>{completedActions.length}/{dailyActions.length}</i></div>
            {dailyActions.map((action) => <button key={action} className={completedActions.includes(action) ? "done" : ""} onClick={() => toggleAction(action)}><span>{completedActions.includes(action) ? "✓" : ""}</span><strong>{action}</strong></button>)}
            <p>Only checklist completion is stored locally. Do not enter client information.</p>
          </section>
          <section className="quick-message-kit">
            <div className="pro-section-title"><div><span>ONE-TAP STARTERS</span><h2>Quick message kit</h2></div></div>
            {quickMessages.map((message) => <article key={message.title}><strong>{message.title}</strong><p>{message.text}</p><button disabled={trialStatus.locked} onClick={() => void copyTool(message.title, message.text)}>{trialStatus.locked ? "Trial complete" : copiedTool === message.title ? "Copied ✓" : "Copy message"}</button></article>)}
            <small>Edit and review every message before sending. These templates are neutral starting points, not investment advice.</small>
          </section>
        </div>
        <div className="pro-desk-grid">
          <section className="morning-five">
            <div className="pro-section-title"><div><span>6-MINUTE READ</span><h2>Morning 5</h2></div><i>{morningFive.length || 5}</i></div>
            {(morningFive.length ? morningFive : stories.slice(0, 5)).map((story, index) => <article key={story.id}>
              <span>{String(index + 1).padStart(2, "0")}</span><div><small>{story.tags.slice(0, 2).join(" · ")}</small><h3>{story.title}</h3><p>{story.summary}</p><div className="morning-actions"><button onClick={() => openClientNote(story, "morning_five")}>Write note →</button><button onClick={() => openSocialCard(story, "morning_five")}>Create image →</button></div></div>
            </article>)}
          </section>
          <aside className="regulator-watch">
            <div className="pro-section-title"><div><span>OFFICIAL-SOURCE WATCHLIST</span><h2>Regulator watch</h2></div></div>
            <p className="watch-disclaimer">A monitoring workspace—not a substitute for checking the regulator’s official website or professional compliance advice.</p>
            {regulatorAlerts.map((alert) => <article key={alert.authority}><span>{alert.authority}</span><strong>{alert.title}</strong><small>{alert.time}</small><i>{alert.level}</i></article>)}
            <OfficialRegulatorLinks />
          </aside>
        </div>
        <div className="pro-tools-grid">
          <section className="practice-feed">
            <div className="pro-section-title"><div><span>LIVE RSS · PRACTICE EDGE</span><h2>Conversation cues</h2></div><i className="live-dot">LIVE</i></div>
            {(practiceStories.length ? practiceStories : stories.slice(0, 6)).map((story) => <article key={story.id}><div><small>{story.source} · {story.age}</small><h3>{story.title}</h3></div><p><strong>Try this:</strong> {conversationCue(story)}</p><div><a href={story.sourceUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("source_opened", { item_id: String(story.id), source: story.source, entry_point: "practice_feed" })}>Open source ↗</a><button onClick={() => openClientNote(story, "practice_feed")}>Make note →</button></div></article>)}
          </section>
          <aside className="x-source-watch">
            <span className="pro-kicker">OFFICIAL X WATCH</span><h2>Useful source channels.</h2><p>Fast awareness only. Verify regulatory information on the authority’s official website before using it.</p>
            <a href="https://x.com/SEBI_updates" target="_blank" rel="noreferrer" onClick={() => trackEvent("official_social_opened", { channel: "SEBI_updates" })}><strong>@SEBI_updates</strong><span>Regulations and circulars ↗</span></a>
            <a href="https://x.com/sebi_india" target="_blank" rel="noreferrer" onClick={() => trackEvent("official_social_opened", { channel: "sebi_india" })}><strong>@sebi_india</strong><span>Investor education ↗</span></a>
            <a href="https://x.com/RBI" target="_blank" rel="noreferrer" onClick={() => trackEvent("official_social_opened", { channel: "RBI" })}><strong>@RBI</strong><span>Reserve Bank updates ↗</span></a>
            <a href="https://x.com/RBIsays" target="_blank" rel="noreferrer" onClick={() => trackEvent("official_social_opened", { channel: "RBIsays" })}><strong>@RBIsays</strong><span>Public awareness ↗</span></a>
            <a href="https://x.com/MFSahiHai" target="_blank" rel="noreferrer" onClick={() => trackEvent("official_social_opened", { channel: "MFSahiHai" })}><strong>@MFSahiHai</strong><span>Mutual fund education ↗</span></a>
          </aside>
        </div>
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
        </div> : <SocialPostStudio stories={stories} profile={profile} saveProfile={saveProfile} initialStory={activeStudioStory} initialContext={resolvedArticleContext} embedded trialLocked={trialStatus.locked} onTrialAction={recordTrialAction} onShareCreated={saveOwnedShare} onStoryChange={(story) => { setStudioStory(story); navigateTab("studio", story, "image"); }} />}
        <ShareLinkDashboard links={ownedShares} onChange={replaceOwnedShares} />
      </section>}

      {tab === "regulators" && <section className="regulator-page regulator-watch">
        <div className="pro-section-title"><div><span>OFFICIAL UPDATES</span><h2>Regulator Watch</h2></div></div>
        <p className="watch-disclaimer">Use these links to verify current circulars and notices directly with each official body. IntelFlow does not interpret these updates as legal or compliance advice.</p>
        {regulatorAlerts.map((alert) => <article key={alert.authority}><span>{alert.authority}</span><strong>{alert.title}</strong><small>{alert.time}</small><i>{alert.level}</i></article>)}
        <OfficialRegulatorLinks />
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
type SocialTemplate = "signal" | "market" | "regulatory";

function SocialPostStudio({ stories, profile, saveProfile, initialStory, initialContext, onStoryChange, onTrialAction, onShareCreated, trialLocked = false, embedded = false }: {
  stories: Story[];
  profile: DistributorProfile;
  saveProfile: (next: DistributorProfile) => void;
  initialStory: Story | null;
  initialContext: string;
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
    void renderSocialCard(canvasRef.current, { story, headline, context, profile, format, template });
  }, [story, headline, context, profile, format, template]);

  function chooseStory(next: Story) {
    setStory(next);
    setHeadline(next.title);
    setContext(shortStoryContext(next));
    setStatus("");
    onStoryChange(next);
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
    const guidance = clientActionGuidance(story);
    return `${headline}\n\n${context}\n\nDo: ${guidance.do}\nDon't: ${guidance.dont}\n\nSource: ${story.source}\n${story.sourceUrl}\n\nFor information only. No buy/sell view. One headline alone does not call for an immediate portfolio change.${identity ? `\n\n${identity}` : ""}\n\n${profile.disclaimer}`;
  }

  async function makeBlob() {
    if (!canvasRef.current) return null;
    await renderSocialCard(canvasRef.current, { story, headline, context, profile, format, template });
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
      const share = await publishHostedShare({ ...story, title: headline }, context, profile, blob, shareExpiry);
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
        <fieldset><legend>Template</legend><div className="studio-options">{(["signal", "market", "regulatory"] as SocialTemplate[]).map((item) => <button type="button" key={item} className={template === item ? "active" : ""} onClick={() => setTemplate(item)}>{item === "signal" ? "Daily signal" : item === "market" ? "Market brief" : "Regulatory"}</button>)}</div></fieldset>
        <fieldset><legend>Format</legend><div className="studio-options"><button type="button" className={format === "square" ? "active" : ""} onClick={() => setFormat("square")}>Square · 1080</button><button type="button" className={format === "portrait" ? "active" : ""} onClick={() => setFormat("portrait")}>Portrait · 1350</button></div></fieldset>
        <label>Headline<textarea value={headline} maxLength={130} rows={3} onChange={(event) => setHeadline(event.target.value)} /></label>
        <label>Short context<textarea value={context} maxLength={220} rows={4} onChange={(event) => setContext(event.target.value)} /></label>
        <div className="studio-branding"><span className="pro-kicker">YOUR BRANDING</span><label>Brand colour<input type="color" value={profile.brandColor || "#d0aa65"} onChange={(event) => saveProfile({ ...profile, brandColor: event.target.value })} /></label><label className="logo-upload">Logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadLogo(event.target.files?.[0])} /><span>{profile.logo ? "Replace logo" : "Upload logo"}</span></label>{profile.logo && <button type="button" onClick={() => saveProfile({ ...profile, logo: "" })}>Remove logo</button>}<small>Name, ARN and EUIN come from your local Distributor Profile.</small></div>
      </div>
      <div className="studio-preview">
        <div className={`canvas-frame ${format}`}><canvas ref={canvasRef} aria-label="Generated social post preview" /></div>
        <div className="studio-actions"><button type="button" disabled={trialLocked} onClick={() => void generateCard()}>{trialLocked ? "Trial complete" : "Generate card"}</button><button type="button" className="primary" disabled={trialLocked} onClick={() => void shareCard()}>Share image</button><button type="button" disabled={trialLocked} onClick={() => void downloadCard()}>Download PNG</button><button type="button" disabled={trialLocked} onClick={() => void copyCaption()}>Copy caption</button></div>
        <div className="social-link-publisher"><label>Link expires<select value={shareExpiry} onChange={(event) => setShareExpiry(Number(event.target.value))}><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select></label><button type="button" disabled={trialLocked} onClick={() => void createHostedLink()}>{trialLocked ? "Trial complete" : "Create branded source link →"}</button></div>
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

async function renderSocialCard(canvas: HTMLCanvasElement, options: { story: Story; headline: string; context: string; profile: DistributorProfile; format: SocialFormat; template: SocialTemplate }) {
  const { story, headline, context: summary, profile, format, template } = options;
  const width = 1080;
  const height = format === "portrait" ? 1350 : 1080;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;
  const accent = profile.brandColor || "#d0aa65";
  const guidance = clientActionGuidance(story);
  const backgrounds: Record<SocialTemplate, [string, string]> = { signal: ["#08121a", "#112839"], market: ["#071a18", "#12352e"], regulatory: ["#15101b", "#302037"] };
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

  const category = template === "regulatory" ? "REGULATORY WATCH" : template === "market" ? "MARKET CONTEXT" : "DAILY SIGNAL";
  context.fillStyle = accent;
  context.font = "700 18px Arial, sans-serif";
  context.fillText(`${category}  ·  ${story.tags.slice(0, 2).join(" + ").toUpperCase()}`, margin, 235);
  context.fillStyle = "#f5f6f3";
  context.font = `600 ${format === "portrait" ? 72 : 68}px Georgia, serif`;
  let cursor = wrapCanvasText(context, headline, margin, 320, width - margin * 2, format === "portrait" ? 82 : 78, format === "portrait" ? 5 : 4);
  cursor += 28;
  context.fillStyle = "#aebbc1";
  context.font = "400 29px Arial, sans-serif";
  wrapCanvasText(context, summary, margin, cursor, width - margin * 2, 42, format === "portrait" ? 4 : 2);

  const sourceY = height - 340;
  context.fillStyle = "rgba(7,15,20,.72)";
  context.roundRect(margin, sourceY, width - margin * 2, 215, 18);
  context.fill();
  context.fillStyle = accent;
  context.font = "700 16px Arial, sans-serif";
  context.fillText("CLIENT TAKEAWAY", margin + 24, sourceY + 34);
  context.font = "700 15px Arial, sans-serif";
  context.fillText("DO", margin + 24, sourceY + 70);
  context.fillStyle = "#eef2f3";
  context.font = "400 16px Arial, sans-serif";
  wrapCanvasText(context, guidance.do, margin + 70, sourceY + 70, width - margin * 2 - 100, 20, 1);
  context.fillStyle = "#d8a879";
  context.font = "700 15px Arial, sans-serif";
  context.fillText("DON'T", margin + 24, sourceY + 105);
  context.fillStyle = "#eef2f3";
  context.font = "400 16px Arial, sans-serif";
  wrapCanvasText(context, guidance.dont, margin + 90, sourceY + 105, width - margin * 2 - 120, 20, 1);
  context.fillStyle = "#9ba8ae";
  context.font = "600 14px Arial, sans-serif";
  context.fillText(`Source: ${story.source.slice(0, 62)}`, margin + 24, sourceY + 144);
  const disclaimer = profile.disclaimer.length > 112 ? `${profile.disclaimer.slice(0, 109).trimEnd()}…` : profile.disclaimer;
  context.fillStyle = "#788990";
  context.font = "400 13px Arial, sans-serif";
  context.fillText(disclaimer, margin + 24, sourceY + 181);

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
  context.fillText("For information only · Verify the original source", width - margin, height - 55);
  context.textAlign = "left";
}

function clientActionGuidance(story: Story) {
  if (story.tags.includes("Regulation")) return { do: "Verify the official circular, effective date and who is affected.", dont: "Treat the headline as final compliance guidance." };
  if (story.tags.includes("Personal Finance")) return { do: "Relate the update to the client's goals, horizon and liquidity needs.", dont: "Turn the headline into a product recommendation." };
  if (story.tags.includes("US")) return { do: "Explain the possible India link through rates, currency or sentiment.", dont: "Assume the headline has a direct portfolio impact." };
  if (story.tags.includes("Markets") || story.tags.includes("Economy")) return { do: "Use this as context and review it against the client's existing plan.", dont: "Suggest an immediate portfolio change from one headline." };
  return { do: "Verify the source and explain the wider context calmly.", dont: "Present one headline as a reason for immediate action." };
}

function buildClientNote(story: Story, profile: DistributorProfile, context: string) {
  const identity = [profile.name, profile.arn, profile.euin].filter(Boolean).join(" · ");
  const guidance = clientActionGuidance(story);
  return `Hello,\n\n${story.title}\n\nIn short: ${context}\n\nWhat to do: ${guidance.do}\nWhat not to do: ${guidance.dont}\n\nSource: ${story.source}\n${story.sourceUrl}\n\nNo buy/sell view. One headline alone does not call for an immediate portfolio change.${identity ? `\n\n${identity}` : ""}${profile.phone ? `\n${profile.phone}` : ""}\n\nDisclaimer: ${profile.disclaimer}`;
}

function conversationCue(story: Story) {
  if (story.tags.includes("Regulation")) return "Check the official circular, effective date and who is affected before discussing it.";
  if (story.tags.includes("US")) return "Explain the possible India link through rates, currency or sentiment—without assuming a direct portfolio impact.";
  if (story.tags.includes("Personal Finance")) return "Connect the topic to goals, time horizon and liquidity needs instead of presenting a product answer.";
  if (story.tags.includes("Economy")) return "Separate the economic signal from the client decision; explain what changed and what has not.";
  return "Use this as context for a calm check-in, not as a reason to recommend an immediate change.";
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

function Settings({ selected, trial, reset }: { selected: string[]; trial: TrialState | null; reset: () => void }) {
  const status = getTrialStatus(trial);
  const trialLabel = !trial ? "Trial not started" : status.locked ? "Local trial complete" : `Local trial · day ${status.day} · ${trial.actions}/${trialActions} outputs`;
  return (
    <section className="utility-page settings-page">
      <span className="eyebrow">SETTINGS</span><h1>Your IntelFlow.</h1><p>You’re browsing as a guest. Preferences and bookmarks are stored only on this device.</p>
      <div className="settings-card">
        <div><span>Current interests</span><strong>{selected.length} topics</strong></div>
        <div><span>Language</span><strong>English</strong></div>
        <div><span>Region</span><strong>India</strong></div>
        <div><span>Account sync</span><strong>Coming later</strong></div>
        <div><span>Distributor access</span><strong>{trialLabel}</strong></div>
      </div>
      <button className="reset-button" onClick={reset}>Choose interests again</button>
      <div className="legal-links">
        <a href="/daily">Daily signals</a><a href="/feed.xml">RSS feed</a><a href="/privacy">Privacy policy</a><a href="/terms">Terms of use</a><a href="/disclosure">News & summary disclosure</a><a href="/contact">Contact & grievance</a>
      </div>
      <p className="operator">IntelFlow is a product of Swarnim Capital.</p>
    </section>
  );
}
