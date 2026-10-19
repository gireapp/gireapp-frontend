const LOCAL_SITE_URL = "http://localhost:3000";

/**
 * The site's public origin, for absolute URLs in link previews, robots.txt and
 * the sitemap. A relative URL there is useless to a crawler, and a
 * localhost one shows every shared link without its image.
 *
 * NEXT_PUBLIC_APP_URL wins. On Vercel, the production domain Vercel exposes is
 * the fallback, so previews still work if the variable was never set.
 */
export function siteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return new URL(configured);

  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionHost) return new URL(`https://${vercelProductionHost}`);

  return new URL(LOCAL_SITE_URL);
}
