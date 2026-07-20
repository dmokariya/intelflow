import type { ReactNode } from "react";
import "./legal.css";

export function LegalLayout({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <main className="legal-shell">
      <header className="legal-header"><a className="legal-brand" href="/">Intel<strong>Flow</strong></a><a href="/">← Back to briefing</a></header>
      <article className="legal-content"><span className="kicker">{kicker}</span><h1>{title}</h1><p className="updated">Effective 17 July 2026 · Draft for pre-launch review</p>{children}</article>
      <footer className="legal-footer"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/disclosure">Disclosure</a><a href="/contact">Contact</a><span>© 2026 IntelFlow · A product of Swarnim Capital</span></footer>
    </main>
  );
}
