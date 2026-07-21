export const dynamic = "force-dynamic";

const officialDomains = ["sebi.gov.in", "rbi.org.in", "amfiindia.com", "irdai.gov.in", "pfrda.org.in"];

function isOfficialUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && officialDomains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

async function readBytesBounded(response: Response, limit = 6_000_000) {
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > limit) throw new Error("This document is larger than the 6 MB lightweight scan limit.");
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel("Document exceeded scan limit");
      throw new Error("This document is larger than the 6 MB lightweight scan limit.");
    }
    chunks.push(value);
  }
  const output = new Uint8Array(size);
  let offset = 0;
  chunks.forEach((chunk) => { output.set(chunk, offset); offset += chunk.byteLength; });
  return output;
}

function decodePdfLiteral(value: string) {
  return value
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, " ").replace(/\\r/g, " ").replace(/\\t/g, " ")
    .replace(/\\[0-7]{1,3}/g, " ");
}

function textOperators(value: string) {
  const parts: string[] = [];
  for (const match of value.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g)) parts.push(decodePdfLiteral(match[1]));
  for (const block of value.matchAll(/\[([\s\S]*?)\]\s*TJ/g)) {
    const line = [...block[1].matchAll(/\(((?:\\.|[^\\)])*)\)/g)].map((match) => decodePdfLiteral(match[1])).join("");
    if (line) parts.push(line);
  }
  return parts.join(" ");
}

async function extractPdfText(bytes: Uint8Array) {
  const binary = new TextDecoder("latin1").decode(bytes);
  const pieces = [textOperators(binary)];
  let cursor = 0;
  let scannedStreams = 0;
  while (scannedStreams < 80) {
    const marker = binary.indexOf("stream", cursor);
    if (marker < 0) break;
    const lineEnd = binary.indexOf("\n", marker);
    const end = binary.indexOf("endstream", lineEnd);
    if (lineEnd < 0 || end < 0) break;
    const dictionary = binary.slice(Math.max(0, marker - 700), marker);
    if (/FlateDecode/.test(dictionary) && end - lineEnd < 1_500_000) {
      let start = lineEnd + 1;
      if (bytes[start] === 13) start += 1;
      try {
        const stream = new Blob([bytes.slice(start, end)]).stream().pipeThrough(new DecompressionStream("deflate"));
        const inflated = await new Response(stream).arrayBuffer();
        pieces.push(textOperators(new TextDecoder("latin1").decode(inflated)));
      } catch {
        // Some PDF streams use unsupported filters or custom predictors. Metadata fallback remains available.
      }
    }
    cursor = end + 9;
    scannedStreams += 1;
  }
  return pieces.join(" ").replace(/[^\x20-\x7E\u00A0-\u024F]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 24_000);
}

function htmlText(value: string) {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/\s+/g, " ").trim().slice(0, 24_000);
}

function sentenceCandidates(text: string) {
  return text.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter((sentence) => sentence.length >= 45 && sentence.length <= 360);
}

function simplify(text: string, title: string, method: string) {
  const combined = `${title}. ${text}`;
  const sentences = sentenceCandidates(text);
  const priority = /\b(shall|must|required|effective|within|deadline|compliance|expense ratio|\bter\b|disclosure|report|submit|prohibited|permitted)\b/i;
  const keyPoints = [...sentences.filter((sentence) => priority.test(sentence)), ...sentences]
    .filter((sentence, index, all) => all.findIndex((candidate) => candidate.toLowerCase() === sentence.toLowerCase()) === index)
    .slice(0, 3);
  const dateMatch = combined.match(/\b(?:effective\s+(?:from|on)|with effect from|on or before|by)\s+([^.;]{4,45})/i)?.[1]?.trim() || "Not reliably extracted";
  const audiences = [
    [/mutual fund distributor|\bmfd\b|\barn\b|\beuin\b/i, "Mutual fund distributors"],
    [/asset management compan|\bamc\b/i, "Asset management companies"],
    [/investor|unit.?holder|client/i, "Investors / clients"],
    [/insurer|insurance agent|policyholder/i, "Insurance participants"],
    [/pension|\bnps\b|subscriber/i, "Pension / NPS participants"],
    [/bank|regulated entit|intermediar/i, "Regulated entities / intermediaries"],
  ].filter(([pattern]) => (pattern as RegExp).test(combined)).map(([, label]) => label as string).slice(0, 3);
  const category = /expense ratio|\bter\b|total expense/i.test(combined) ? "Expense ratio / TER" : /kyc|money laundering|\baml\b/i.test(combined) ? "KYC / AML" : /advertis|social media|communication|disclosure/i.test(combined) ? "Communication / disclosure" : "Regulatory / operational";
  const readable = text.length >= 180;
  return {
    method: readable ? method : "metadata-only",
    extractionStatus: readable ? "Machine-readable text found" : "Document text was not reliably machine-readable",
    category,
    affectedAudience: audiences.length ? audiences : ["Confirm applicability in the official document"],
    effectiveDate: dateMatch,
    keyPoints: readable && keyPoints.length ? keyPoints : [title ? `Official document: ${title}.` : "Open the official document and confirm its scope, effective date and obligations."],
    action: "Verify the original document, confirm who is affected and record the effective date before changing a process or sharing a compliance conclusion.",
  };
}

export async function GET(request: Request) {
  const parameters = new URL(request.url).searchParams;
  const url = parameters.get("url") || "";
  const title = (parameters.get("title") || "").slice(0, 240);
  if (!isOfficialUrl(url)) return Response.json({ error: "Only official SEBI, AMFI, RBI, IRDAI and PFRDA documents can be scanned." }, { status: 400 });
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/pdf,text/html,application/xhtml+xml", "User-Agent": "IntelFlow-Document-Brief/1.0 (+https://intelflow.in)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok || !isOfficialUrl(response.url)) throw new Error(`Official source returned HTTP ${response.status}.`);
    const bytes = await readBytesBounded(response);
    const contentType = response.headers.get("content-type") || "";
    const isPdf = /pdf/i.test(contentType) || /\.pdf(?:$|\?)/i.test(response.url);
    const text = isPdf ? await extractPdfText(bytes) : htmlText(new TextDecoder().decode(bytes));
    return Response.json({
      sourceUrl: response.url,
      documentType: isPdf ? "PDF" : "Official page",
      ...simplify(text, title, isPdf ? "lightweight-pdf-text-scan" : "official-page-text"),
      generatedAt: new Date().toISOString(),
      disclaimer: "Automated extraction can miss tables, annexures, scanned pages and legal nuance. Verify the complete official document.",
    }, { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "The official document could not be scanned.", sourceUrl: url }, { status: 422 });
  }
}
