import { NextRequest, NextResponse } from "next/server";
import { getShareImageBucket, getShareRecord, hashOwnerToken, publicShare, revokeShareRecord, shareIsActive } from "../../../../lib/share-store";

export const dynamic = "force-dynamic";

function validId(id: string) {
  return /^[A-Za-z0-9_-]{12}$/.test(id);
}

function ownerToken(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validId(id)) return NextResponse.json({ error: "Share link not found." }, { status: 404 });
  const record = await getShareRecord(id);
  if (!record) return NextResponse.json({ error: "Share link not found." }, { status: 404 });
  if (!shareIsActive(record)) return NextResponse.json({ error: "This share link has expired or been revoked." }, { status: 410 });
  return NextResponse.json({ share: publicShare(record) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = ownerToken(request);
  if (!validId(id) || token.length < 20) return NextResponse.json({ error: "Owner access is required." }, { status: 401 });
  const record = await getShareRecord(id);
  if (!record || await hashOwnerToken(token) !== record.ownerTokenHash) return NextResponse.json({ error: "Owner access is required." }, { status: 401 });
  if (!record.revokedAt) {
    await revokeShareRecord(id);
    await getShareImageBucket().delete(record.imageKey);
  }
  return NextResponse.json({ revoked: true }, { headers: { "Cache-Control": "no-store" } });
}
