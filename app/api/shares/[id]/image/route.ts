import { NextResponse } from "next/server";
import { getShareImageBucket, getShareRecord, shareIsActive } from "../../../../../lib/share-store";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{12}$/.test(id)) return new NextResponse(null, { status: 404 });
  const record = await getShareRecord(id);
  if (!shareIsActive(record)) return new NextResponse(null, { status: 410 });
  const image = await getShareImageBucket().get(record!.imageKey);
  if (!image) return new NextResponse(null, { status: 404 });
  return new NextResponse(image.body, {
    headers: {
      "Content-Type": image.httpMetadata?.contentType || "image/png",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
