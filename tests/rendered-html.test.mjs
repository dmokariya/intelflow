import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function builtWorker() {
  return readFile(new URL("../dist/server/index.js", import.meta.url), "utf8");
}

test("builds the IntelFlow product shell into the Worker", async () => {
  const worker = await builtWorker();
  assert.match(worker, /IntelFlow — India’s Intelligent Daily Briefing/i);
  assert.match(worker, /IntelFlow/);
  assert.doesNotMatch(worker, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("includes the required legal and grievance surfaces in the Worker", async () => {
  const worker = await builtWorker();
  for (const expected of ["Privacy policy", "Terms of use", "News & summary disclosure", "Support & grievance"]) {
    assert.match(worker, new RegExp(expected, "i"));
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
