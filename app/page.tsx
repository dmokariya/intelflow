"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

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

type DistributorProfile = {
  name: string;
  arn: string;
  euin: string;
  phone: string;
  disclaimer: string;
};

const defaultDistributorProfile: DistributorProfile = {
  name: "",
  arn: "",
  euin: "",
  phone: "",
  disclaimer: "Mutual fund investments are subject to market risks. Read all scheme-related documents carefully.",
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
  const [page, setPage] = useState<"feed" | "saved" | "discover" | "pro" | "settings">("feed");
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedStories, setFeedStories] = useState<Story[]>(demoStories);
  const [isPro, setIsPro] = useState(false);
  const [profile, setProfile] = useState<DistributorProfile>(defaultDistributorProfile);
  const [mode, setMode] = useState<"reader" | "distributor">("reader");
  const [explainStory, setExplainStory] = useState<Story | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setOnboarded(storage.get("intelflow:onboarded", false));
    setSelected(storage.get("intelflow:interests", ["AI", "India", "Technology", "Markets"]));
    setBookmarks(storage.get("intelflow:bookmarks", []));
    setIsPro(storage.get("intelflow:pro-demo", false));
    setProfile(storage.get("intelflow:distributor-profile", defaultDistributorProfile));
    setMode(storage.get("intelflow:mode", "reader"));
    setReady(true);
    loadFeed();
  }, []);

  function loadFeed(force = false) {
    setRefreshing(true);
    fetch(`/api/feed${force ? `?refresh=${Date.now()}` : ""}`, { cache: force ? "no-store" : "default" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Feed unavailable")))
      .then((data: { stories?: Story[]; generatedAt?: string }) => {
        if (data.stories?.length) setFeedStories(data.stories);
        if (data.generatedAt) setLastUpdated(new Date(data.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
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
    setOnboarded(true);
  }

  function toggleBookmark(id: number) {
    setBookmarks((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      storage.set("intelflow:bookmarks", next);
      return next;
    });
  }

  function navigate(next: typeof page) {
    setPage(next);
    setMenuOpen(false);
  }

  function switchMode(next: "reader" | "distributor") {
    setMode(next);
    storage.set("intelflow:mode", next);
    navigate(next === "reader" ? "feed" : "pro");
  }

  async function shareStory(story: Story) {
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
          <span className="eyebrow">YOUR DAILY SIGNAL</span>
          <h1>What do you want<br />to know more about?</h1>
          <p>Pick at least three interests. We’ll shape a calmer, sharper briefing around you.</p>
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
        <div className="mode-switch" role="group" aria-label="IntelFlow mode">
          <button className={mode === "reader" ? "active" : ""} onClick={() => switchMode("reader")}>Reader</button>
          <button className={mode === "distributor" ? "active" : ""} onClick={() => switchMode("distributor")}>Distributor</button>
        </div>
        <div className="top-actions">
          <button className="icon-button" aria-label="Search" onClick={() => navigate("discover")}>⌕</button>
          <button className="avatar-button" aria-label="Open menu" onClick={() => setMenuOpen((value) => !value)}>G</button>
        </div>
        {menuOpen && (
          <div className="profile-menu">
            <strong>Guest reader</strong>
            <span>Your interests stay on this device.</span>
            <button onClick={() => navigate("settings")}>Settings</button>
          </div>
        )}
      </header>

      {page === "feed" && (
        <>
          <section className="welcome-row">
            <div>
              <span className="date-label">LIVE · INDIA + UNITED STATES</span>
              <h1>Good afternoon.</h1>
              <p>{visibleStories.length} signals selected for your interests{lastUpdated ? ` · Updated ${lastUpdated}` : ""}.</p>
            </div>
            <button className={`refresh-feed ${refreshing ? "refreshing" : ""}`} onClick={() => loadFeed(true)} disabled={refreshing}><span>↻</span>{refreshing ? "Updating" : "Refresh"}</button>
          </section>

          <nav className="tag-strip" aria-label="News filters">
            {["For you", ...selected].map((tag) => (
              <button key={tag} className={activeTag === tag ? "active" : ""} onClick={() => setActiveTag(tag)}>
                {tag}
              </button>
            ))}
          </nav>
        </>
      )}

      {page === "discover" && <Discover selected={selected} setSelected={setSelected} />}
      {page === "pro" && <DistributorPro stories={feedStories} isPro={isPro} setIsPro={setIsPro} profile={profile} setProfile={setProfile} initialStory={explainStory} />}
      {page === "settings" && <Settings selected={selected} isPro={isPro} reset={() => { storage.set("intelflow:onboarded", false); setOnboarded(false); }} />}

      {(page === "feed" || page === "saved") && (
        <section className="story-stage">
          {page === "saved" && <div className="section-heading"><span>SAVED BRIEFING</span><h1>Your reading list</h1></div>}
          {!visibleStories.length ? (
            <div className="empty-state">
              <span>☆</span><h2>Nothing saved yet</h2><p>Tap the bookmark on any briefing to keep it here.</p>
              <button onClick={() => navigate("feed")}>Return to briefing</button>
            </div>
          ) : (
            <div className="story-stream">
              {visibleStories.slice(0, 20).map((story, index) => (
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
                      <a href={story.sourceUrl} target="_blank" rel="noreferrer">Read full story <span>↗</span></a>
                      {story.tags.some((tag) => ["Markets", "Business", "India"].includes(tag)) && <button className="explain-button" onClick={() => { setExplainStory(story); switchMode("distributor"); }}>Explain to client</button>}
                      <button className="share-button" onClick={() => void shareStory(story)} aria-label={`Share ${story.title}`}><span>Share</span><i>⤴</i></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          <p className="automated-note">Briefs are automatically condensed from attributed sources. Verify important information with the original publisher.</p>
        </section>
      )}

      {page === "feed" && (
        <aside className="swarnim-credit" aria-label="IntelFlow by Swarnim Capital">
          <div>
            <span>BUILT BY SWARNIM CAPITAL</span>
            <h2>Focused intelligence for informed financial conversations.</h2>
            <p>IntelFlow is a product of Swarnim Capital.</p>
          </div>
          <a href="https://swarnimcapital.com" target="_blank" rel="noreferrer">Visit Swarnim Capital <span>↗</span></a>
        </aside>
      )}

      <nav className="bottom-nav pro-nav" aria-label="Primary navigation">
        <button className={page === "feed" ? "active" : ""} onClick={() => navigate("feed")}><span>⌂</span>Briefing</button>
        <button className={page === "discover" ? "active" : ""} onClick={() => navigate("discover")}><span>⌕</span>Discover</button>
        <button className={page === "saved" ? "active" : ""} onClick={() => navigate("saved")}><span>☆</span>Saved</button>
        <button className={page === "pro" ? "active" : ""} onClick={() => navigate("pro")}><span>◆</span>Pro</button>
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

function DistributorPro({ stories, isPro, setIsPro, profile, setProfile, initialStory }: {
  stories: Story[];
  isPro: boolean;
  setIsPro: (value: boolean) => void;
  profile: DistributorProfile;
  setProfile: (value: DistributorProfile) => void;
  initialStory: Story | null;
}) {
  const [tab, setTab] = useState<"desk" | "regulators" | "notes" | "profile">(initialStory ? "notes" : "desk");
  const [noteStory, setNoteStory] = useState<Story | null>(initialStory);
  const [noteTone, setNoteTone] = useState<"client" | "whatsapp">("client");
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState("");
  const morningFive = stories.filter((story) => story.tags.some((tag) => ["Markets", "Business", "India"].includes(tag))).slice(0, 5);
  const regulatorAlerts = [
    { authority: "SEBI", title: "Review new circulars before client communication", time: "Watchlist · Today", level: "Action" },
    { authority: "AMFI", title: "Distributor guidance and operational updates", time: "Watchlist · Daily", level: "Monitor" },
    { authority: "RBI", title: "Policy and liquidity announcements", time: "Watchlist · This week", level: "Context" },
    { authority: "IRDAI", title: "Insurance regulations and consumer-protection updates", time: "Watchlist · Daily", level: "Monitor" },
    { authority: "PFRDA", title: "Pension and NPS circulars and notices", time: "Watchlist · Daily", level: "Monitor" },
  ];

  useEffect(() => {
    if (initialStory) {
      setNoteStory(initialStory);
      setTab("notes");
    }
  }, [initialStory]);

  function activateDemo() {
    storage.set("intelflow:pro-demo", true);
    setIsPro(true);
  }

  function saveProfile(next: DistributorProfile) {
    setProfile(next);
    storage.set("intelflow:distributor-profile", next);
  }

  useEffect(() => {
    setDraft(noteStory ? buildClientNote(noteStory, profile, noteTone) : "");
  }, [noteStory, noteTone, profile]);

  async function copyNote() {
    await navigator.clipboard?.writeText(draft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (!isPro) {
    return (
      <section className="pro-landing">
        <div className="pro-hero">
          <span className="pro-kicker">INTELFLOW DISTRIBUTOR PRO</span>
          <h1>Your morning intelligence desk.</h1>
          <p>Turn the day’s market and regulatory signals into clear, client-ready communication—without losing your compliance guardrails.</p>
          <div className="pro-price"><strong>₹399</strong><span>/ month<br />or ₹3,999 yearly</span></div>
          <button onClick={activateDemo}>Preview Pro on this device <span>→</span></button>
          <small>Local product preview only. No account is created and no payment is taken.</small>
        </div>
        <div className="pro-feature-grid">
          <article><span>01</span><strong>Morning 5</strong><p>Five concise signals selected for an Indian distributor’s working day.</p></article>
          <article><span>02</span><strong>Regulator watch</strong><p>A focused place for SEBI, AMFI and RBI updates that need attention.</p></article>
          <article><span>03</span><strong>Client notes</strong><p>Turn attributed briefs into editable messages with a standard disclaimer.</p></article>
          <article><span>04</span><strong>Distributor identity</strong><p>Keep your ARN, EUIN and client-facing details ready on this device.</p></article>
        </div>
      </section>
    );
  }

  return (
    <section className="pro-workspace">
      <header className="pro-workspace-head">
        <div><span className="pro-kicker">DISTRIBUTOR MODE · LOCAL PREVIEW</span><h1>Good morning{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}.</h1><p>Your market, business and regulatory desk in one calm view.</p></div>
        <span className="pro-status">PRO PREVIEW</span>
      </header>
      <nav className="pro-tabs" aria-label="Distributor Pro sections">
        <button className={tab === "desk" ? "active" : ""} onClick={() => setTab("desk")}>Today’s desk</button>
        <button className={tab === "regulators" ? "active" : ""} onClick={() => setTab("regulators")}>Regulator watch</button>
        <button className={tab === "notes" ? "active" : ""} onClick={() => setTab("notes")}>Client notes</button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>Profile</button>
      </nav>

      {tab === "desk" && <div className="pro-desk-grid">
        <section className="morning-five">
          <div className="pro-section-title"><div><span>6-MINUTE READ</span><h2>Morning 5</h2></div><i>{morningFive.length || 5}</i></div>
          {(morningFive.length ? morningFive : stories.slice(0, 5)).map((story, index) => <article key={story.id}>
            <span>{String(index + 1).padStart(2, "0")}</span><div><small>{story.tags.slice(0, 2).join(" · ")}</small><h3>{story.title}</h3><p>{story.summary}</p><button onClick={() => { setNoteStory(story); setTab("notes"); }}>Create client note →</button></div>
          </article>)}
        </section>
        <aside className="regulator-watch">
          <div className="pro-section-title"><div><span>OFFICIAL-SOURCE WATCHLIST</span><h2>Regulator watch</h2></div></div>
          <p className="watch-disclaimer">A monitoring workspace—not a substitute for checking the regulator’s official website or professional compliance advice.</p>
          {regulatorAlerts.map((alert) => <article key={alert.authority}><span>{alert.authority}</span><strong>{alert.title}</strong><small>{alert.time}</small><i>{alert.level}</i></article>)}
          <OfficialRegulatorLinks />
        </aside>
      </div>}

      {tab === "regulators" && <section className="regulator-page regulator-watch">
        <div className="pro-section-title"><div><span>OFFICIAL UPDATES</span><h2>Regulator Watch</h2></div></div>
        <p className="watch-disclaimer">Use these links to verify current circulars and notices directly with each official body. IntelFlow does not interpret these updates as legal or compliance advice.</p>
        {regulatorAlerts.map((alert) => <article key={alert.authority}><span>{alert.authority}</span><strong>{alert.title}</strong><small>{alert.time}</small><i>{alert.level}</i></article>)}
        <OfficialRegulatorLinks />
      </section>}

      {tab === "notes" && <div className="note-builder">
        <div className="note-source-list"><span className="pro-kicker">CHOOSE A SIGNAL</span><h2>Start with today’s briefing.</h2>{stories.slice(0, 8).map((story) => <button className={noteStory?.id === story.id ? "active" : ""} key={story.id} onClick={() => setNoteStory(story)}><small>{story.tags[0]}</small><strong>{story.title}</strong></button>)}</div>
        <div className="note-preview">
          <div className="note-toolbar"><div><button className={noteTone === "client" ? "active" : ""} onClick={() => setNoteTone("client")}>Client update</button><button className={noteTone === "whatsapp" ? "active" : ""} onClick={() => setNoteTone("whatsapp")}>WhatsApp</button></div>{noteStory && <button className="copy-note" onClick={() => void copyNote()}>{copied ? "Copied ✓" : "Copy note"}</button>}</div>
          {noteStory ? <><textarea className="editable-note" aria-label="Editable client message" value={draft} onChange={(event) => setDraft(event.target.value)} /><p className="compliance-note"><strong>Before sending:</strong> review accuracy, suitability, source context and your organisation’s compliance policy. IntelFlow does not approve communications or provide investment advice.</p></> : <div className="note-empty"><span>✦</span><h3>Select a story</h3><p>We’ll structure an editable, attributed client update for your review.</p></div>}
        </div>
      </div>}

      {tab === "profile" && <form className="profile-editor" onSubmit={(event) => event.preventDefault()}>
        <div><span className="pro-kicker">DISTRIBUTOR IDENTITY</span><h2>Your client-note footer.</h2><p>Saved only in this browser during the preview. Do not enter client data.</p></div>
        <label>Registered name<input value={profile.name} onChange={(event) => saveProfile({ ...profile, name: event.target.value })} placeholder="Your registered distributor name" /></label>
        <div className="profile-row"><label>ARN<input value={profile.arn} onChange={(event) => saveProfile({ ...profile, arn: event.target.value })} placeholder="ARN-000000" /></label><label>EUIN<input value={profile.euin} onChange={(event) => saveProfile({ ...profile, euin: event.target.value })} placeholder="E000000" /></label></div>
        <label>Business phone<input value={profile.phone} onChange={(event) => saveProfile({ ...profile, phone: event.target.value })} placeholder="Optional" /></label>
        <label>Standard disclaimer<textarea value={profile.disclaimer} onChange={(event) => saveProfile({ ...profile, disclaimer: event.target.value })} rows={4} /></label>
        <p className="saved-locally">✓ Changes save automatically on this device.</p>
      </form>}
    </section>
  );
}

function buildClientNote(story: Story, profile: DistributorProfile, tone: "client" | "whatsapp") {
  const greeting = tone === "whatsapp" ? "Good morning 👋\n\n" : "Client update\n\n";
  const identity = [profile.name, profile.arn, profile.euin].filter(Boolean).join(" · ");
  return `${greeting}${story.title}\n\n${story.summary}\n\nContext: This is a neutral information update, not a buy or sell recommendation. One headline alone does not require an immediate portfolio change. Please consider your goals, time horizon and the wider context, and review the original report before making any decision.\n\nSource: ${story.source}\n${story.sourceUrl}${identity ? `\n\n${identity}` : ""}${profile.phone ? `\n${profile.phone}` : ""}\n\nCompliance disclaimer: ${profile.disclaimer}`;
}

function OfficialRegulatorLinks() {
  return <div className="official-links"><a href="https://www.sebi.gov.in/legal/circulars.html" target="_blank" rel="noreferrer">SEBI circulars ↗</a><a href="https://www.amfiindia.com/" target="_blank" rel="noreferrer">AMFI ↗</a><a href="https://www.rbi.org.in/" target="_blank" rel="noreferrer">RBI ↗</a><a href="https://irdai.gov.in/circulars" target="_blank" rel="noreferrer">IRDAI ↗</a><a href="https://www.pfrda.org.in/" target="_blank" rel="noreferrer">PFRDA ↗</a></div>;
}

function Settings({ selected, isPro, reset }: { selected: string[]; isPro: boolean; reset: () => void }) {
  return (
    <section className="utility-page settings-page">
      <span className="eyebrow">SETTINGS</span><h1>Your IntelFlow.</h1><p>You’re browsing as a guest. Preferences and bookmarks are stored only on this device.</p>
      <div className="settings-card">
        <div><span>Current interests</span><strong>{selected.length} topics</strong></div>
        <div><span>Language</span><strong>English</strong></div>
        <div><span>Region</span><strong>India</strong></div>
        <div><span>Account sync</span><strong>Coming later</strong></div>
        <div><span>Distributor Pro</span><strong>{isPro ? "Local preview active" : "Not active"}</strong></div>
      </div>
      <button className="reset-button" onClick={reset}>Choose interests again</button>
      <div className="legal-links">
        <a href="/daily">Daily signals</a><a href="/feed.xml">RSS feed</a><a href="/privacy">Privacy policy</a><a href="/terms">Terms of use</a><a href="/disclosure">News & summary disclosure</a><a href="/contact">Contact & grievance</a>
      </div>
      <p className="operator">IntelFlow is a product of Swarnim Capital.</p>
    </section>
  );
}
