import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftLabel } from "@/components/DraftLabel";
import { getEntries, getEntry } from "@/lib/content";

// Only the pages listed below exist; anything else is a 404
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getEntries("projects")).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const entry = await getEntry("projects", (await params).slug);
  return entry ? { title: entry.meta.title, description: entry.meta.summary } : {};
}

export default async function CaseStudy({ params }: PageProps<"/projects/[slug]">) {
  const entry = await getEntry("projects", (await params).slug);
  if (!entry) notFound();
  const { meta, Content } = entry;
  return (
    <article className="mx-auto max-w-[720px]">
      <p className="text-sm">
        <Link href="/projects" className="text-mu hover:text-ac2">
          <span aria-hidden="true">← </span>Projects
        </Link>
      </p>
      <h1 className="mt-4 flex flex-wrap items-center gap-3 text-2xl font-medium">
        {meta.title}
        {!entry.published && <DraftLabel />}
      </h1>
      <p className="mt-2 text-mu">{meta.summary}</p>
      {(meta.role || meta.links?.length) && (
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {meta.role && (
            <div>
              <dt className="text-mu">Role</dt>
              <dd>{meta.role}</dd>
            </div>
          )}
          {meta.links?.length ? (
            <div>
              <dt className="text-mu">Links</dt>
              <dd className="flex gap-4">
                {meta.links.map((l) => (
                  <a key={l.href} href={l.href} className="text-ac2 hover:underline">
                    {l.label}
                  </a>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      )}
      <div className="prose mt-8">
        <Content />
      </div>
    </article>
  );
}
