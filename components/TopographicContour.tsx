"use client";

// Decorative topographic contour overlay: provides ambient wavy contour lines with customizable color tinting.

export type ContourTint = "violet" | "cyan" | "slate" | "amber" | "sage" | "rose";

const TINT_COLORS: Record<ContourTint, { stroke: string; glow: string }> = {
  violet: { stroke: "rgba(182, 156, 255, 0.45)", glow: "rgba(109, 40, 217, 0.20)" },
  cyan: { stroke: "rgba(127, 168, 255, 0.45)", glow: "rgba(29, 78, 216, 0.20)" },
  slate: { stroke: "rgba(148, 163, 184, 0.35)", glow: "rgba(148, 163, 184, 0.15)" },
  amber: { stroke: "rgba(245, 158, 11, 0.55)", glow: "rgba(245, 158, 11, 0.20)" },
  sage: { stroke: "rgba(16, 185, 129, 0.55)", glow: "rgba(16, 185, 129, 0.20)" },
  rose: { stroke: "rgba(244, 63, 94, 0.55)", glow: "rgba(244, 63, 94, 0.20)" },
};

export function TopographicContour({
  tint = "violet",
  className = "",
}: {
  tint?: ContourTint | null;
  className?: string;
}) {
  const chosen = TINT_COLORS[tint || "violet"] || TINT_COLORS.violet;

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
    >
      <svg
        className="w-full h-full object-cover opacity-80"
        viewBox="0 0 900 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="contour-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient background glow */}
        <ellipse cx="450" cy="150" rx="400" ry="120" fill={chosen.glow} filter="url(#contour-glow)" />

        {/* Topographic Contour Lines */}
        <g stroke={chosen.stroke} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-50,220 C100,260 220,170 380,210 C540,250 680,160 950,230" />
          <path d="M-50,180 C120,230 250,140 420,170 C590,200 710,130 950,190" />
          <path d="M-50,140 C140,190 280,100 460,130 C640,160 740,90 950,150" />
          <path d="M-50,100 C160,150 310,70 500,90 C690,110 780,60 950,110" />
          <path d="M-50,60 C180,110 340,40 540,60 C740,80 810,30 950,70" />

          {/* Iso-elevation loop contours */}
          <path d="M220,140 C280,110 360,110 400,150 C430,180 390,220 310,210 C240,200 180,160 220,140 Z" />
          <path d="M260,150 C300,130 350,130 370,160 C380,180 350,195 305,190 C270,185 240,165 260,150 Z" />

          <path d="M580,110 C650,80 730,90 770,130 C800,160 760,200 680,190 C610,180 540,130 580,110 Z" />
          <path d="M620,120 C660,100 720,105 745,135 C765,155 735,175 685,170 C640,165 595,135 620,120 Z" />
        </g>
      </svg>
    </div>
  );
}
