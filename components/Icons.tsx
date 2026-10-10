import * as simpleIcons from "simple-icons";
import type { LinkIcon } from "@/content/site";

type SimpleIcon = { title: string; path: string };
const iconTable = simpleIcons as unknown as Record<string, SimpleIcon | undefined>;

/** A brand icon from Simple Icons, drawn in the current text color. slug example: "nextdotjs" */
export function BrandIcon({ slug, size = 16 }: { slug: string; size?: number }) {
  const icon = iconTable["si" + slug.charAt(0).toUpperCase() + slug.slice(1)];
  if (!icon) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={icon.path} />
    </svg>
  );
}

function MailIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

function ChainIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}

export function LinkIconView({ icon, size = 16 }: { icon: LinkIcon; size?: number }) {
  if (icon === "github") return <BrandIcon slug="github" size={size} />;
  if (icon === "email") return <MailIcon size={size} />;
  return <ChainIcon size={size} />;
}
