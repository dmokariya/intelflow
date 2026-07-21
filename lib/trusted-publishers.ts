const trustedPublisherDomains = [
  "indiatimes.com",
  "sebi.gov.in",
  "rbi.org.in",
  "amfiindia.com",
  "irdai.gov.in",
  "pfrda.org.in",
  "bbc.com",
  "bbc.co.uk",
  "thehindu.com",
  "indianexpress.com",
  "nytimes.com",
  "federalreserve.gov",
  "sec.gov",
  "npr.org",
  "cnbc.com",
  "nasa.gov",
  "bseindia.com",
  "meity.gov.in",
  "startupindia.gov.in",
  "bcci.tv",
  "who.int",
  "mohua.gov.in",
  "imd.gov.in",
  "mib.gov.in",
];

export function trustedPublisherUrl(value: string | URL) {
  try {
    const url = value instanceof URL ? value : new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && !url.username && !url.password && (!url.port || url.port === "443")
      && trustedPublisherDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}
