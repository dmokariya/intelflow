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
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "IntelFlow",
    title: "IntelFlow — India’s Intelligent Daily Briefing",
    description: "Know what matters. India, markets, business and regulation in one focused briefing.",
    url: "/",
    images: [{ url: "/og-intelflow.jpg", width: 1200, height: 630, alt: "IntelFlow — Know what matters" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IntelFlow — India’s Intelligent Daily Briefing",
    description: "Know what matters. India, markets, business and regulation in one focused briefing.",
    images: ["/og-intelflow.jpg"],
  },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], shortcut: "/favicon.svg", apple: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#091117" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = { "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: "IntelFlow", url: "https://intelflow.in", logo: "https://intelflow.in/favicon.svg", parentOrganization: { "@type": "Organization", name: "Swarnim Capital" }, contactPoint: { "@type": "ContactPoint", email: "hello@swarnimcapital.com", contactType: "customer support", areaServed: "IN" } };
  const googleTag = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-9JP9G1RWRY');`;
  return <html lang="en-IN"><head><script async src="https://www.googletagmanager.com/gtag/js?id=G-9JP9G1RWRY" /><script dangerouslySetInnerHTML={{ __html: googleTag }} /></head><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />{children}</body></html>;
}
