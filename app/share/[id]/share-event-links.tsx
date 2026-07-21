"use client";

import { useEffect } from "react";

function recordEvent(id: string, event: "view" | "source_click" | "contact_click") {
  void fetch(`/api/shares/${id}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
    keepalive: true,
  }).catch(() => undefined);
}

export default function ShareEventLinks({ id, sourceUrl, contactUrl }: { id: string; sourceUrl: string; contactUrl: string }) {
  useEffect(() => {
    const key = `intelflow:share-viewed:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // The aggregate view can still be counted when private browsing blocks storage.
    }
    recordEvent(id, "view");
  }, [id]);

  return <div className="public-share-actions">
    <a className="public-share-source" href={sourceUrl} target="_blank" rel="noreferrer" onClick={() => recordEvent(id, "source_click")}>Read the original article <span>↗</span></a>
    {contactUrl && <a className="public-share-contact" href={contactUrl} target="_blank" rel="noreferrer" onClick={() => recordEvent(id, "contact_click")}>Discuss this with me <span>→</span></a>}
  </div>;
}
