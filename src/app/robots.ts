import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in areas only ever show a crawler the login page.
      disallow: ["/dashboard", "/admin", "/onboarding"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl()).toString(),
  };
}
