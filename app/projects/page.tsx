import Link from "next/link";
import { DraftLabel } from "@/components/DraftLabel";
import { PinnedProjects } from "@/components/PinnedProjects";
import { getGitHubData } from "@/lib/github";
import { getEntries } from "@/lib/content";

export const metadata = { title: "Projects" };
export const revalidate = 3600;

export default async function ProjectsPage() {
  const [studies, { pinned }] = await Promise.all([getEntries("projects"), getGitHubData()]);
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-medium">
        <span aria-hidden="true" className="text-mu">~/</span>Projects
      </h1>
      <section aria-labelledby="studies-title">
        <h2 id="studies-title" className="mb-3 font-medium text-ac">Case studies</h2>
        {studies.length === 0 ? (
          <p className="text-mu">Case studies are being written. Check back soon.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {studies.map((s) => (
              <li key={s.slug} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link href={`/projects/${s.slug}`} className="font-medium text-ac2 hover:underline">
                  {s.meta.title}
                </Link>
                <span className="text-sm text-mu">{s.meta.summary}</span>
                {!s.published && <DraftLabel />}
              </li>
            ))}
          </ul>
        )}
      </section>
      <PinnedProjects repos={pinned} />
    </div>
  );
}
