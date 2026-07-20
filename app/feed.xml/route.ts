export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>IntelFlow Daily Signal</title><link>${origin}/daily</link><description>Short, attributed India-first daily briefings.</description><language>en-IN</language><item><title>IntelFlow Daily Signal — ${date}</title><link>${origin}/daily/${date}</link><guid>${origin}/daily/${date}</guid><pubDate>${new Date().toUTCString()}</pubDate><description>Five things worth knowing today.</description></item></channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
