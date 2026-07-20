import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the IntelFlow product shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>IntelFlow — India’s Intelligent Daily Briefing<\/title>/i);
  assert.match(html, /IntelFlow/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("publishes the required legal and grievance surfaces", async () => {
  for (const [path, expected] of [["/privacy", "Privacy policy"], ["/terms", "Terms of use"], ["/disclosure", "News &amp; summary disclosure"], ["/contact", "Support &amp; grievance"]]) {
    const response = await render(path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), new RegExp(expected, "i"));
  }
});

test("uses bounded RSS processing and no paid AI service", async () => {
  const feed = await readFile(new URL("../app/api/feed/route.ts", import.meta.url), "utf8");
  assert.match(feed, /readBounded/);
  assert.match(feed, /reader\.cancel/);
  assert.match(feed, /assignTags/);
  assert.match(feed, /summarise/);
  assert.doesNotMatch(feed, /api\.openai|anthropic\.com|generativelanguage|apiKey/i);
});
