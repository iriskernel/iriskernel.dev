import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.handle}: ${site.bio}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Colors match the dark theme tokens in globals.css
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 96, background: "#0f0d16", color: "#ece9f5" }}>
        <div style={{ display: "flex", fontSize: 40, color: "#9e98b0" }}>~/iriskernel.dev</div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 112, fontWeight: 500, color: "#b69cff" }}>
          {site.name}
          <span style={{ color: "#7fa8ff" }}>_</span>
        </div>
        <div style={{ display: "flex", marginTop: 32, fontSize: 44, lineHeight: 1.3, maxWidth: 960 }}>{site.bio}</div>
      </div>
    ),
    size
  );
}
