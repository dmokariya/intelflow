# IntelFlow

IntelFlow is a mobile-first, installable news briefing product operated by Swarnim Capital. It aggregates RSS sources, assigns multiple interest tags, produces short extractive briefs without paid AI APIs, and links readers to the original publisher.

## Local development

IntelFlow requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Current local release

- Guest-first interest onboarding
- Multi-tag personalised feed
- Live RSS refresh with bundled-story fallback
- Extractive summaries without external AI services
- Device-local bookmarks and preferences
- Discover and settings screens
- Privacy, terms, automated-summary disclosure, and grievance pages
- PWA manifest

## Before production

- Review every configured publisher feed and image usage term
- Add D1 persistence and scheduled ingestion
- Add production authentication only after provider selection
- Configure consent, analytics and advertising disclosures before enabling SDKs
- Complete professional legal review and Google Play declarations

© 2026 IntelFlow. A product of Swarnim Capital.
