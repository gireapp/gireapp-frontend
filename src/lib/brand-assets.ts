import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Files for images generated at build time (link previews, app icons), which
 * cannot fetch from the site they are part of. Paths are from the project root.
 */
function projectFile(...segments: string[]): Promise<Buffer> {
  return readFile(join(process.cwd(), ...segments));
}

async function svgDataUri(...segments: string[]): Promise<string> {
  const svg = await projectFile(...segments);
  return `data:image/svg+xml;base64,${svg.toString("base64")}`;
}

/** The "G" mark, light on dark, for images drawn on the brand indigo. */
export function markOnDarkDataUri(): Promise<string> {
  return svgDataUri("src", "assets", "brand", "mark-on-dark.svg");
}

/** The "G" mark on its own indigo tile; also the browser tab icon. */
export function markOnIndigoDataUri(): Promise<string> {
  return svgDataUri("src", "app", "icon.svg");
}

/** Plus Jakarta Sans, the heading face. */
export function headingFont(weight: 500 | 700): Promise<Buffer> {
  return projectFile(
    "src",
    "assets",
    "fonts",
    `plus-jakarta-sans-latin-${weight}-normal.woff`,
  );
}
