import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

const PUBLIC_PAGES = ["/", "/register", "/login", "/mentorship", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map((path) => ({
    url: new URL(path, siteUrl()).toString(),
  }));
}
