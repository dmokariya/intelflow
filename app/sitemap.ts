import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://intelflow.in";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  return ["", "/daily", `/daily/${today}`, "/privacy", "/terms", "/disclosure", "/contact"].map((path, index) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: index < 3 ? "daily" as const : "monthly" as const, priority: index === 0 ? 1 : index < 3 ? .8 : .3 }));
}
