# IntelFlow — A daily briefing that credits its sources instead of rewriting them

> Thirty public feeds clustered into one daily briefing where every story keeps its publisher, its date and a working link.

**Status:** Maintained — live at [intelflow.in](https://intelflow.in); consumer direction released through 2026-08-17.

## The problem

News aggregation is cheap to build and expensive to trust. The standard product wins attention by rewriting other people's reporting into a house voice, which hides where a claim came from and sends the reader's click nowhere near the publisher who paid for the reporting.

For a business, that is the wrong trade. An unattributed summary becomes a liability the moment someone quotes it, and a feed that shows a regulator's circular at the same weight as a market rumour teaches the reader nothing about which is which. The reader needs the source, the tier and the extraction method; the publisher needs the click.

The first version answered a different question: whether mutual fund distributors would pay for client-ready content. Three weeks of distributor tooling ended in a rebuild loop and then a pivot to consumer reading.

## What it is

IntelFlow reads thirty public RSS and Atom sources — regulators, business press, world news, science and sport — clusters near-duplicate stories, tags them by interest, and writes a short extractive brief for each. The brief is the publisher's own description cut at 68 words. Nothing is rewritten, there is no model call, and every card links out.

Readers browse as a guest, then optionally sign in with Google to keep saves and interests across devices. Saves, shares and topic choices write to a Cloudflare D1 database; the same database feeds a private admin dashboard with retention and share-conversion numbers.

The distributor surfaces remain in the codebase — share records still carry ARN, EUIN and disclaimer fields — but they are out of the navigation, recorded in `PRODUCT_NOTES.md` rather than left to be discovered.

Thirty feeds resolve to one page, and a dead publisher costs one card, not the briefing.

## How it works

Next.js App Router compiled by `vinext` and deployed to a Cloudflare Worker, with D1 for records and KV for share images.

```text
browser
  |
  +--> Worker entry (worker/index.ts)
  |      +-- HTTPS + apex canonicalisation for intelflow.in (308)
  |      +-- /_vinext/image optimisation with an allow-list of widths
  |      +-- vinext app router
  |
  +--> /api/feed          30 RSS sources -> tag -> dedupe cluster -> rank -> balance -> JSON
  +--> /api/article-context publisher allow-list -> JSON-LD -> meta -> paragraphs -> 280 chars
  +--> /api/regulators     official regulator index; /api/regulator-document extracts PDF/XML text
  +--> /api/auth/google    verify Google ID token server-side -> D1 user -> HttpOnly cookie
  +--> /api/shares         PNG to KV, record to D1, hashed owner token, expiring link
  +--> /api/events         allow-listed event names -> user_events
  +--> /api/admin/metrics  SQL aggregates, admin email allow-list only
```

- `app/api/feed/route.ts` — source table with tiers and per-source item caps, keyword tag rules, impact scoring, near-duplicate clustering, and a category-balancing pass so the top of the feed is not five market stories.
- `app/api/article-context/route.ts` + `lib/trusted-publishers.ts` — the only place the product fetches a news publisher page. Regulator documents use a tighter, separate allow-list of official domains.
- `lib/share-store.ts` + `db/schema.ts` — share records, counters, revocation and expiry; owner tokens are stored as SHA-256 hashes.
- `app/admin/page.tsx` + `app/api/admin/metrics/route.ts` — DAU/WAU/MAU, day-1 and day-7 retention, share conversion, topic affinity and per-user activity.
- `app/robots.ts`, `app/sitemap.ts`, `app/feed.xml/route.ts`, `public/llms.txt`, `public/.well-known/security.txt` — discovery surfaces; `/admin`, `/api/` and `/reader` are excluded from crawling.

## Engineering log

**2026-07-20 — From local build to a production domain**
- Created the project, configured the Cloudflare bindings, attached the apex and `www` domains, and added a Worker-level 308 to force HTTPS and the apex host.
- Replaced a webfont dependency with a deployment-safe font stack after production font loading failed.
- Added analytics with a matching privacy disclosure, a dark theme, social preview metadata and a product credit.

**2026-07-20 → 2026-07-21 — Distributor workspace, client content studio, share links**
- Built the Distributor Pro workspace: client notes, a social post studio, a daily productivity view and trial/upgrade states.
- Added branded share links, then moved their preview images onto Cloudflare KV so a card could be served without a database read.
- Added URL-addressable navigation and progressive feed loading, then unified client notes and the content studio into one surface.

**2026-07-21 — Feed quality and the article-context endpoint**
- Expanded to thirty sources across regulation, markets, personal finance, world, science and sport, with tiers and per-source caps.
- Added the safe article-context endpoint, a regulator desk with a client digest, and a Company Impact research workflow.
- Labelled the original article context source in the UI so a reader can see whether a brief came from structured data, metadata or the first paragraphs.

**2026-07-23 — Four dashboard rebuilds in one day**
- Rebuilt the distributor dashboard around the MFD workflow, restructured it three more times, then reverted to the previously approved version.
- That sequence is the clearest evidence in the repo that the premise was not working; the design was not the problem.

**2026-08-12 → 2026-08-17 — Consumer pivot: accounts, sharing and measurement**
- Rebuilt discovery around a consumer daily briefing, added Google sign-in, consumer accounts and product analytics in D1.
- Overhauled the news interface, unified reading and sharing, added a personalised feed with an interest editor, and expanded audience analytics.
- Added the admin dashboard with retention, share conversion and per-user activity, hardened indexing, and repaired navigation and the Cloudflare test validation.

## Hard problems and how I solved them

- **Reading other people's articles without becoming an open proxy.** The context endpoint accepts only HTTPS URLs on a 24-domain allow-list of publishers and regulators, rejects credentials and non-443 ports, follows redirects manually for at most three hops with the same check on each hop, reads at most 1.5 MB with a 4.5-second timeout, and reports which extraction method worked (`article`, `metadata`, `paragraphs` or `unavailable`). Anything else returns an empty context, not a scrape. Result: briefs can be enriched without the server being usable to fetch arbitrary URLs.
- **A share card is a claim about a source, so it cannot be client-authored.** The create endpoint re-checks the source URL against the allow-list, caps every text field, accepts only a base64 PNG under 900 KB inside a 1.5 MB body, and rejects cross-site requests by `Origin`. The image goes to KV with an expiry matching the link; the D1 insert carries the SHA-256 of a random owner token rather than the token. If the database write fails, the KV object is deleted. Links expire in 7, 30 or 90 days and can be revoked. Result: a shared card either points at an approved publisher or does not exist.
- **Sign-in without running an auth server.** The client receives a Google ID token; the server verifies it against the token endpoint and checks the audience, subject, verified email and expiry before touching the database, then issues an `HttpOnly; Secure; SameSite=Lax` cookie clamped to the remaining token lifetime. Admin access is a separate server-side email allow-list. Account deletion removes saves, blanks the user row and anonymises events instead of deleting them, so metric history stays valid without keeping an identity. Result: no password storage, no long-lived session, and a delete that means something.
- **Thirty feeds on every request.** The feed is fetched live on a cache-miss. Each fetch has a 5-second abort, reads at most 4 MB and returns a per-source health record (`live`, `empty`, `timeout`, `unavailable`) instead of failing the page. Stories older than seven days or dated more than a day ahead are dropped, duplicates are clustered by normalised title and token overlap inside a 72-hour window, the cluster count becomes a coverage badge, and a fixed category sequence fills the opening screen. Result: one dead publisher degrades one card, and the response reports how many sources were actually live.

## What it cost and what it returned

- **Time:** 57 commits between 2026-07-20 and 2026-08-17 — four weeks, of which three went to the distributor workspace that the pivot then abandoned.
- **Money:** the Worker, D1 and KV bindings are configured in this repo, but billing is not. Actual hosting spend is unknown from the code.
- **Revenue:** none. The trial gate states ₹399 a month and says in the same box that no payment is collected there; Pro access is an email request. No customer, subscription or payout exists in the repo, and what the product could earn is not projected here.
- **Return:** one dead commercial hypothesis closed in three weeks, a working public reference for the rest of this portfolio, and a measurement layer that can answer day-1 and day-7 retention and share conversion from its own database.

Four rebuilds of one dashboard is a fast way to find out who the customer is not.

## What I would do differently

- I built three weeks of distributor tooling before asking a distributor to open it. The rebuild sequence on 2026-07-23 was evidence arriving late, not a design problem to be solved with another layout.
- Attribution-first was the only durable idea in the first version and it was treated as a detail of the workspace. It should have been the pitch, and the workspace should have been the feature.
- The distributor code is still in a public repository, half-hidden. Either the audience returns or the ARN/EUIN fields, client notes and content studio should be deleted; carrying them is a maintenance cost and a confusing read.
- Ingestion still runs on the request path, so the product's freshness depends on a user's page load, and the OAuth client ID sits in source instead of Worker configuration. Both are shortcuts the first deploy took and the second deploy inherited.

## Stack

Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, Drizzle ORM and Drizzle Kit, Cloudflare Workers with D1 and KV, Vite 8 via `vinext`, Wrangler 4, `node:test`, ESLint 9.

## Running it

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm test           # builds the Worker, then runs the rendered-HTML checks
npm run lint
npm run db:generate  # Drizzle migration from db/schema.ts
```

The app expects a D1 binding named `DB` and a KV binding named `SHARE_IMAGES`; `ADMIN_EMAILS` (comma-separated) controls who can open `/admin`. Migration SQL lives in `drizzle/`, and the Worker routes for `intelflow.in` are declared in `vite.config.ts`. No secret values belong in the repository; local environment lives in ignored `.env*` files.

Built with AI-assisted development under my direction.
