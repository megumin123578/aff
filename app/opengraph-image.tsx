import { ImageResponse } from "next/og";

export const alt = "Neroviax — Practical VPS Infrastructure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, color: "white", background: "linear-gradient(135deg,#070b12,#12233f)" }}>
    <div style={{ fontSize: 28, color: "#71a7ff", letterSpacing: 4 }}>NEROVIAX</div>
    <div style={{ marginTop: 28, maxWidth: 950, fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>Practical VPS infrastructure, without the guesswork.</div>
    <div style={{ marginTop: 30, fontSize: 28, color: "#a8b3c7" }}>Sizing tools · normalized pricing · field-tested guides</div>
  </div>, size);
}
