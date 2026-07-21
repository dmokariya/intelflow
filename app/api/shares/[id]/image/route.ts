import { NextResponse } from "next/server";
import { getShareImageStore, getShareRecord, shareIsActive } from "../../../../../lib/share-store";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{12}$/.test(id)) return new NextResponse(null, { status: 404 });
  const record = await getShareRecord(id);
  if (!shareIsActive(record)) return new NextResponse(null, { status: 410 });
  const image = await getShareImageStore().get(record!.imageKey, "arrayBuffer");
  if (!image) return new NextResponse(null, { status: 404 });
  return new NextResponse(image, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
