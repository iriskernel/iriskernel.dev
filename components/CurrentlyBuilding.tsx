import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { Panel } from "./Panel";

export function CurrentlyBuilding({ caseStudyReady }: { caseStudyReady: boolean }) {
  const p = site.currentlyBuilding;
  return (
    <Panel id="building" title="Currently building">
      <div className="flex flex-wrap items-start gap-4">
        <Image src="/logo/groupy-tile.svg" alt="" width={56} height={56} className="size-14 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-medium">{p.name}</span>
            <span className="rounded-full border border-ac px-2 text-xs leading-5 text-ac">{p.pill}</span>
          </p>
          <p className="mt-1">{p.pitch}</p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a href={p.href} className="text-ac2 hover:underline">
              Try it <span aria-hidden="true">→</span>
            </a>
            {caseStudyReady && (
              <Link href={`/projects/${p.caseStudy}`} className="text-ac2 hover:underline">
                Case study
              </Link>
            )}
            <span className="text-mu">{p.note}</span>
          </p>
        </div>
      </div>
    </Panel>
  );
}
