import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://intelflow.in"),
  title: { default: "IntelFlow — India’s Intelligent Daily Briefing", template: "%s · IntelFlow" },
  description: "A calmer, more useful daily briefing for people who want to understand what is happening — from big news to culture, technology and conversation.",
  manifest: "/site.webmanifest",
  applicationName: "IntelFlow",
  alternates: { canonical: "/" },
  keywords: ["India news", "daily news", "news explainers", "technology", "culture", "daily briefing", "IntelFlow"],
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
    description: "Know what people are talking about — and why it matters — in five calmer minutes.",
    url: "/",
    images: [{ url: "https://raw.githubusercontent.com/dmokariya/intelflow/main/public/og-intelflow.jpg", width: 1200, height: 630, alt: "IntelFlow — Know what matters" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IntelFlow — India’s Intelligent Daily Briefing",
    description: "Know what people are talking about — and why it matters — in five calmer minutes.",
    images: ["https://raw.githubusercontent.com/dmokariya/intelflow/main/public/og-intelflow.jpg"],
  },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], shortcut: "/favicon.svg", apple: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#071012" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = { "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: "IntelFlow", url: "https://intelflow.in", logo: "https://intelflow.in/favicon.svg", parentOrganization: { "@type": "Organization", name: "Swarnim Capital" }, contactPoint: { "@type": "ContactPoint", email: "hello@swarnimcapital.com", contactType: "customer support", areaServed: "IN" } };
  const googleTagManager = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MFCTF4LX');`;
  const googleAnalytics = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-9JP9G1RWRY');`;
  return <html lang="en-IN"><head><script async src="https://www.googletagmanager.com/gtag/js?id=G-9JP9G1RWRY" /><script dangerouslySetInnerHTML={{ __html: googleAnalytics }} /><script dangerouslySetInnerHTML={{ __html: googleTagManager }} /></head><body><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MFCTF4LX" height="0" width="0" style={{ display: "none", visibility: "hidden" }} /></noscript><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />{children}</body></html>;
}
