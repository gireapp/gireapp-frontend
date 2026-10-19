import { ImageResponse } from "next/og";
import { headingFont, markOnDarkDataUri } from "@/lib/brand-assets";

export const alt = "GIREAPP — Get It Right, The First Time.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INDIGO_800 = "#3730A3";
const INDIGO_950 = "#1E1B4B";
const INDIGO_50 = "#EEF2FF";
const INDIGO_300 = "#A5B4FC";
const CORAL_500 = "#F97316";
const TRACKS = ["Secondary", "Tertiary", "Professional"];

/** The card shown when a GIREAPP link is shared on WhatsApp, X or LinkedIn. */
export default async function OpenGraphImage() {
  const [mark, bold, medium] = await Promise.all([
    markOnDarkDataUri(),
    headingFont(700),
    headingFont(500),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: `linear-gradient(135deg, ${INDIGO_800} 0%, ${INDIGO_950} 100%)`,
        fontFamily: "Plus Jakarta Sans",
        color: INDIGO_50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img src={mark} width={72} height={72} alt="" />
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: 1 }}>
          GIREAPP
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          <div style={{ display: "flex" }}>
            Get It&nbsp;<span style={{ color: CORAL_500 }}>Right</span>,
          </div>
          <div style={{ display: "flex" }}>The First Time.</div>
        </div>
        <div style={{ fontSize: 34, fontWeight: 500, color: INDIGO_300 }}>
          Enabling Academic Excellence Across Africa
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {TRACKS.map((track) => (
          <div
            key={track}
            style={{
              display: "flex",
              padding: "10px 24px",
              borderRadius: 999,
              border: `2px solid ${INDIGO_300}`,
              fontSize: 26,
              fontWeight: 500,
            }}
          >
            {track}
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Plus Jakarta Sans", data: bold, weight: 700, style: "normal" },
        {
          name: "Plus Jakarta Sans",
          data: medium,
          weight: 500,
          style: "normal",
        },
      ],
    },
  );
}
