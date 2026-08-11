import { NextResponse } from "next/server";
import { getDb } from "../../../db";
import { stories as storiesTable } from "../../../db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();

  try {
    const records = await db.select().from(storiesTable).orderBy(desc(storiesTable.importance)).limit(80);

    // Formatting the age since createdAt timestamp
    const now = Date.now();

    const stories = records.map((story) => {
      // Re-calculate the relative age
      const hours = Math.max(0, Math.round((now - story.createdAt) / 3_600_000));
      return {
        ...story,
        age: hours < 1 ? "Just now" : hours < 24 ? `${hours} hr ago` : `${Math.round(hours / 24)}d ago`,
      };
    });

    return NextResponse.json({
      stories,
      sources: 25, // Mock static source count since it's decoupled now
      activeSources: 25,
      sourceHealth: [],
      generatedAt: new Date().toISOString(),
    }, { headers: { "Cache-Control": "public, max-age=20, s-maxage=60, stale-while-revalidate=120" } });
  } catch (error) {
    console.error("Failed to fetch stories", error);
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
  }
}
