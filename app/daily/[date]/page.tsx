import type { Metadata } from "next";
import DailyBriefing from "./daily-briefing";

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  return { title: `Daily Signal — ${date}`, description: `A short India-first news and markets briefing for ${date}, attributed to original publishers.`, alternates: { canonical: `/daily/${date}` }, openGraph: { type: "article", title: `IntelFlow Daily Signal — ${date}`, description: "Five short signals. Original sources. No noise.", url: `/daily/${date}` }, twitter: { card: "summary", title: `IntelFlow Daily Signal — ${date}`, description: "Five short signals. Original sources. No noise." } };
}

export default async function DailyPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return <DailyBriefing date={date} />;
}
