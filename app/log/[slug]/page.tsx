import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftLabel } from "@/components/DraftLabel";
import { getEntries, getEntry } from "@/lib/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getEntries("log")).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/log/[slug]">): Promise<Metadata> {
  const entry = await getEntry("log", (await params).slug);
  return entry ? { title: entry.meta.title, description: entry.meta.summary } : {};
}

export default async function LogEntry({ params }: PageProps<"/log/[slug]">) {
  const entry = await getEntry("log", (await params).slug);
  if (!entry) notFound();
  const { meta, Content } = entry;
  return (
    <article className="mx-auto max-w-[720px]">
      <p className="text-sm">
        <Link href="/log" className="text-mu hover:text-ac2">
          <span aria-hidden="true">← </span>Log
        </Link>
      </p>
      <h1 className="mt-4 flex flex-wrap items-center gap-3 text-2xl font-medium">
        {meta.title}
        {!entry.published && <DraftLabel />}
      </h1>
      <time dateTime={meta.date} className="mt-2 block text-sm text-mu">
        {meta.date}
      </time>
      <div className="prose mt-8">
        <Content />
      </div>
    </article>
  );
}
