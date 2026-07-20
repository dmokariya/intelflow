import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/reader"] }], sitemap: "https://intelflow.in/sitemap.xml", host: "https://intelflow.in" };
}
