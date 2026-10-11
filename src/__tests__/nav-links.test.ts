import { describe, it, expect } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ACADEMIC_LEVELS } from "@gireapp/shared";
import { getNavGroups } from "@/features/dashboard/nav-items";
import { ADMIN_NAV_GROUPS } from "@/features/admin/admin-nav-items";

const APP_DIR = join(process.cwd(), "src", "app");

/** Every route with a page, with route groups like "(admin)" stripped. */
function existingRoutes(dir = APP_DIR, route = ""): string[] {
  const routes = existsSync(join(dir, "page.tsx")) ? [route || "/"] : [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const isGroup = entry.name.startsWith("(");
    routes.push(
      ...existingRoutes(
        join(dir, entry.name),
        isGroup ? route : `${route}/${entry.name}`,
      ),
    );
  }
  return routes;
}

const ROUTES = new Set(existingRoutes());

/*
 * Both sidebars once linked to pages that did not exist — Progress, Mentors,
 * Settings — and every one of them was a 404 in front of a user. A nav entry
 * may only be added together with its page.
 */
describe("navigation links", () => {
  it.each(ACADEMIC_LEVELS)(
    "every learner nav link for %s opens a real page",
    (level) => {
      const hrefs = getNavGroups(level)
        .flat()
        .map((item) => item.href);

      expect(hrefs.filter((href) => !ROUTES.has(href))).toEqual([]);
    },
  );

  it("every admin nav link opens a real page", () => {
    const hrefs = ADMIN_NAV_GROUPS.flat().map((item) => item.href);

    expect(hrefs.filter((href) => !ROUTES.has(href))).toEqual([]);
  });

  it("finds the routes it is checking against", () => {
    // Guards the guard: an empty route list would make every check above fail
    // loudly, but a wrong directory could also make them pass for no reason.
    expect(ROUTES.has("/admin/courses")).toBe(true);
    expect(ROUTES.has("/dashboard/settings")).toBe(true);
    expect(ROUTES.has("/dashboard/mentors")).toBe(false);
  });
});
