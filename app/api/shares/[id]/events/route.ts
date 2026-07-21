import { NextRequest, NextResponse } from "next/server";
import { getShareRecord, incrementShareMetric, shareIsActive, type ShareMetric } from "../../../../../lib/share-store";

export const dynamic = "force-dynamic";

const eventMetrics: Record<string, ShareMetric> = { view: "views", source_click: "sourceClicks", contact_click: "contactClicks" };

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{12}$/.test(id)) return new NextResponse(null, { status: 404 });
  try {
    const payload = await request.json() as { event?: string };
    const metric = eventMetrics[payload.event || ""];
    if (!metric) return NextResponse.json({ error: "Unknown event." }, { status: 400 });
    const record = await getShareRecord(id);
    if (!shareIsActive(record)) return new NextResponse(null, { status: 410 });
    await incrementShareMetric(id, metric);
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Event was not recorded." }, { status: 400 });
  }
}
