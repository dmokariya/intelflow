"use client";

import { useEffect, useState } from "react";

type DailyStory = { id: number; title: string; summary: string; source: string; sourceUrl: string; tags: string[] };

export default function DailyBriefing({ date }: { date: string }) {
  const [stories, setStories] = useState<DailyStory[]>([]);
  useEffect(() => { fetch("/api/feed").then((response) => response.json()).then((data: { stories?: DailyStory[] }) => setStories((data.stories || []).filter((story) => story.tags.some((tag) => ["India", "Markets", "Business", "Technology", "World"].includes(tag))).slice(0, 5))).catch(() => setStories([])); }, []);
  const url = typeof window === "undefined" ? "" : window.location.href;
  const title = `IntelFlow Daily Signal — ${date}`;
  return <main className="daily-post">
    <header><a className="daily-logo" href="/"><span>IF</span><strong>IntelFlow</strong></a><a href="/daily">Daily archive</a></header>
    <article>
      <div className="daily-mast"><span>THE DAILY SIGNAL · INDIA</span><h1>Five things worth knowing today.</h1><p>{date} · A concise briefing drawn from attributed public news feeds.</p></div>
      <div className="daily-share"><span>Share this briefing</span><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">LinkedIn</a><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">X</a><a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}>Email</a></div>
      {!stories.length ? <div className="daily-loading">Preparing today’s live briefing…</div> : <ol>{stories.map((story) => <li key={story.id}><small>{story.tags.slice(0, 2).join(" · ")}</small><h2>{story.title}</h2><p>{story.summary}</p><a href={story.sourceUrl} target="_blank" rel="noreferrer">Source: {story.source} ↗</a></li>)}</ol>}
      <footer><strong>Context, not advice.</strong><p>IntelFlow automatically condenses attributed source material. It does not provide investment recommendations. Verify important information with the original publisher.</p><a href="/">Personalise your IntelFlow briefing →</a></footer>
    </article>
  </main>;
}
