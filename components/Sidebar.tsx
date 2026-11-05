import Image from "next/image";
import { site } from "@/content/site";
import { LinkIconView } from "./Icons";
import { TopographicContour } from "./TopographicContour";

export function Sidebar() {
  return (
    <aside aria-label="About me" className="flex flex-col gap-4">
      {site.avatar.kind === "image" ? (
        <Image src={site.avatar.src} alt="" width={160} height={160} priority className="size-40 rounded-full border border-ln object-cover" />
      ) : (
        <div aria-hidden="true" className="relative flex size-40 items-center justify-center overflow-hidden rounded-full border-2 border-ac bg-sf/80 backdrop-blur-xs text-5xl font-medium text-ac shadow-sm">
          <TopographicContour tint="violet" className="opacity-45" />
          <span className="relative z-10 flex items-center">
            {site.initials}
            <span className="cursor-blink text-ac2">_</span>
          </span>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-medium">{site.name}</h1>
        <p className="text-mu">@{site.handle}</p>
      </div>
      <p>{site.bio}</p>
      <ul className="flex flex-col gap-2 text-sm">
        {site.links.map((link) => (
          <li key={link.href}>
            <a href={link.href} rel="me noopener" className="inline-flex items-center gap-2 text-ac2 hover:underline">
              <LinkIconView icon={link.icon} />
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-2 text-sm text-mu">
        <span aria-hidden="true" className="size-2 rounded-full bg-ac" />
        {site.status}
      </p>
    </aside>
  );
}
