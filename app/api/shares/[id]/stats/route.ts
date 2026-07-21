import { NextRequest, NextResponse } from "next/server";
import { getShareRecord, hashOwnerToken } from "../../../../../lib/share-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!/^[A-Za-z0-9_-]{12}$/.test(id) || token.length < 20) return NextResponse.json({ error: "Owner access is required." }, { status: 401 });
  const record = await getShareRecord(id);
  if (!record || await hashOwnerToken(token) !== record.ownerTokenHash) return NextResponse.json({ error: "Owner access is required." }, { status: 401 });
  return NextResponse.json({ stats: { views: record.views, sourceClicks: record.sourceClicks, contactClicks: record.contactClicks, expiresAt: record.expiresAt, revokedAt: record.revokedAt } }, { headers: { "Cache-Control": "no-store" } });
}
