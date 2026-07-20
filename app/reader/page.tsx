"use client";

import { useEffect, useState } from "react";

type ReaderState = { url: string; title: string; source: string };

export default function ReaderPage() {
  const [article, setArticle] = useState<ReaderState | null>(null);
  const [loaded, setLoaded] = useState(false);

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
  }, []);

  return (
    <main className="reader-shell">
      <header className="reader-header">
        <a className="reader-back" href="/" aria-label="Back to IntelFlow">←</a>
        <a className="reader-logo" href="/"><span>Intel</span><strong>Flow</strong></a>
        {article ? <a className="reader-external" href={article.url} target="_blank" rel="noreferrer">Open original ↗</a> : <span />}
      </header>
      {article ? (
        <>
          <section className="reader-context">
            <span>{article.source}</span><h1>{article.title}</h1>
            <p>Publisher page shown inside IntelFlow. Content and privacy practices belong to the original publisher.</p>
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
        <section className="reader-error"><h1>We couldn’t open this article.</h1><p>The source address is missing or invalid.</p><a href="/">Return to IntelFlow</a></section>
      )}
    </main>
  );
}
