import type { Metadata } from "next";

export const metadata: Metadata = { title: "Daily Signals", description: "IntelFlow’s short, attributed daily India briefing.", alternates: { canonical: "/daily" } };

export default function DailyIndex() {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  return <main className="daily-index"><span>INTELFLOW DAILY</span><h1>Today’s signal is ready.</h1><p>A short, attributed briefing generated from IntelFlow’s live RSS sources—without paid AI.</p><a href={`/daily/${date}`}>Read the {date} briefing →</a><small>New date-based briefing available each day.</small></main>;
}
