import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getShareRecord, shareIsActive } from "../../../lib/share-store";
import ShareEventLinks from "./share-event-links";

export const dynamic = "force-dynamic";

function phoneForWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits.length >= 11 && digits.length <= 15 ? digits : "";
}

function whatsappUrl(phone: string, title: string) {
  const number = phoneForWhatsApp(phone);
  if (!number) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(`Hello. I read your IntelFlow update about “${title}”. I would like to understand the context.`)}`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const record = /^[A-Za-z0-9_-]{12}$/.test(id) ? await getShareRecord(id) : null;
  if (!shareIsActive(record)) return { title: "Share unavailable", robots: { index: false, follow: false } };
  const image = `/api/shares/${id}/image`;
  return {
    title: record!.storyTitle,
    description: record!.storyContext,
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    openGraph: {
      type: "article",
      siteName: "IntelFlow",
      title: record!.storyTitle,
      description: record!.storyContext,
      url: `/share/${id}`,
      images: [{ url: image, width: 1080, height: 1080, alt: `Client update: ${record!.storyTitle}` }],
    },
    twitter: { card: "summary_large_image", title: record!.storyTitle, description: record!.storyContext, images: [image] },
  };
}

export default async function PublicSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = /^[A-Za-z0-9_-]{12}$/.test(id) ? await getShareRecord(id) : null;
  if (!shareIsActive(record)) return <main className="public-share-shell"><section className="public-share-unavailable"><a className="public-share-brand" href="/"><span>IF</span><strong>IntelFlow</strong></a><span>SHARE UNAVAILABLE</span><h1>This update has expired or was withdrawn.</h1><p>Return to IntelFlow for the latest attributed financial and regulatory briefing.</p><a href="/">Open IntelFlow →</a></section></main>;

  const share = record!;
  const identity = [share.arn, share.euin].filter(Boolean).join(" · ");
  const contactUrl = whatsappUrl(share.phone, share.storyTitle);
  const style = { "--share-accent": share.brandColor } as CSSProperties;
  return <main className="public-share-shell" style={style}>
    <article className="public-share-card">
      <header className="public-share-header">
        <a className="public-share-brand" href="/"><span>IF</span><strong>IntelFlow</strong></a>
        <div><small>SHARED BY</small><strong>{share.distributorName || "Financial product distributor"}</strong>{identity && <span>{identity}</span>}</div>
      </header>
      <div className="public-share-image"><img src={`/api/shares/${id}/image`} alt="" /></div>
      <section className="public-share-content">
        <span className="public-share-kicker">CLIENT CONTEXT · {share.sourceName}</span>
        <h1>{share.storyTitle}</h1>
        <p className="public-share-summary">{share.storyContext}</p>
        <div className="public-share-guidance"><p><strong>DO</strong><span>{share.actionDo}</span></p><p><strong>DON’T</strong><span>{share.actionDont}</span></p></div>
        <ShareEventLinks id={id} sourceUrl={share.sourceUrl} contactUrl={contactUrl} />
        <p className="public-share-source-note">IntelFlow does not reproduce the publisher’s article. The source button opens the original publication for full context.</p>
      </section>
      <footer className="public-share-footer"><p><strong>Important:</strong> One headline alone does not require an immediate portfolio change. This update contains no buy or sell recommendation.</p><p>{share.disclaimer}</p><div><span>Shared via <a href="/">IntelFlow</a>, a product of Swarnim Capital.</span><time dateTime={new Date(share.createdAt).toISOString()}>{new Date(share.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time></div></footer>
    </article>
  </main>;
}
