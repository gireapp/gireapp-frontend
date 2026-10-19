import { ImageResponse } from "next/og";
import { markOnIndigoDataUri } from "@/lib/brand-assets";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The home-screen icon iOS uses when someone saves the site. */
export default async function AppleIcon() {
  const mark = await markOnIndigoDataUri();

  return new ImageResponse(
    <img src={mark} width={180} height={180} alt="" />,
    size,
  );
}
