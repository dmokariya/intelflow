import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://intelflow.in"),
  title: { default: "IntelFlow — India’s Intelligent Daily Briefing", template: "%s · IntelFlow" },
  description: "A calm, personalised India-first briefing for readers and financial product distributors, with attributed news signals and regulator watch.",
  manifest: "/site.webmanifest",
  applicationName: "IntelFlow",
  alternates: { canonical: "/" },
  keywords: ["India news", "market news", "financial distributor", "SEBI updates", "AMFI updates", "daily briefing", "IntelFlow"],
  authors: [{ name: "IntelFlow" }],
  creator: "IntelFlow",
  publisher: "Swarnim Capital",
  category: "news",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", locale: "en_IN", siteName: "IntelFlow", title: "IntelFlow — India’s Intelligent Daily Briefing", description: "Know what matters. A calmer daily signal for India.", url: "/" },
  twitter: { card: "summary", title: "IntelFlow — India’s Intelligent Daily Briefing", description: "Know what matters. A calmer daily signal for India." },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], shortcut: "/favicon.svg", apple: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f6f5ef" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = { "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: "IntelFlow", url: "https://intelflow.in", logo: "https://intelflow.in/favicon.svg", parentOrganization: { "@type": "Organization", name: "Swarnim Capital" }, contactPoint: { "@type": "ContactPoint", email: "hello@swarnimcapital.com", contactType: "customer support", areaServed: "IN" } };
  return <html lang="en-IN"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />{children}</body></html>;
}
