"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ReaderState = { url: string; title: string; source: string };

export default function ReaderPage() {
  const [article, setArticle] = useState<ReaderState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawUrl = params.get("url") || "";
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return;
      setArticle({ url: parsed.toString(), title: params.get("title") || "Original article", source: params.get("source") || parsed.hostname });
    } catch {
      setArticle(null);
    }
    try { setDarkMode(JSON.parse(localStorage.getItem("intelflow:dark-mode") || "false")); } catch { setDarkMode(false); }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("intelflow:dark-mode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <main className="reader-shell">
      <header className="reader-header">
        <Link className="reader-back" href="/" aria-label="Back to IntelFlow">←</Link>
        <Link className="reader-logo" href="/"><img src="/brand/intelflow-mark.svg" alt="" /><span>Intel<strong>Flow</strong></span></Link>
        <div className="reader-actions"><button className="theme-toggle" aria-label={darkMode ? "Use light mode" : "Use dark mode"} aria-pressed={darkMode} onClick={() => setDarkMode((value) => !value)}>{darkMode ? "☀" : "☾"}</button>{article ? <a className="reader-external" href={article.url} target="_blank" rel="noreferrer">Open original ↗</a> : <span />}</div>
      </header>
      {article ? (
        <>
          <section className="reader-context">
            <span>READING FROM {article.source}</span><h1>{article.title}</h1>
            <p>The original publisher’s page appears below. Reporting and privacy practices belong to that publisher.</p>
          </section>
          <div className="reader-frame-wrap">
            {!loaded && <div className="reader-loading"><i /><span>Opening original report…</span></div>}
            <iframe
              className="reader-frame"
              src={article.url}
              title={article.title}
              onLoad={() => setLoaded(true)}
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            />
          </div>
          <aside className="reader-fallback"><strong>Article not visible?</strong><span>Some publishers prevent their pages from appearing inside other apps.</span><a href={article.url} target="_blank" rel="noreferrer">Open on {article.source} ↗</a></aside>
        </>
      ) : (
        <section className="reader-error"><h1>We couldn’t open this article.</h1><p>The source address is missing or invalid.</p><Link href="/">Return to IntelFlow</Link></section>
      )}
    </main>
  );
}
