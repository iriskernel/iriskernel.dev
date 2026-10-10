import Link from "next/link";
import { DraftLabel } from "@/components/DraftLabel";
import { getEntries } from "@/lib/content";

export const metadata = { title: "Log", alternates: { canonical: "/log" } };

export default async function LogPage() {
  const entries = await getEntries("log");
  return (
    <div className="mx-auto max-w-[720px]">
      <h1 className="text-2xl font-medium">
        <span aria-hidden="true" className="text-mu">~/</span>Log
      </h1>
      <p className="mt-2 text-mu">
        Short notes on what I&apos;m building.{" "}
        <a href="/log/rss.xml" className="text-ac2 hover:underline">
          RSS feed
        </a>
      </p>
      {entries.length === 0 ? (
        <p className="mt-8 text-mu">No entries yet.</p>
      ) : (
        <ol className="mt-8 flex flex-col gap-5">
          {entries.map((e) => (
            <li key={e.slug} className="grid gap-1 sm:grid-cols-[120px_1fr] sm:gap-4">
              <time dateTime={e.meta.date} className="text-sm text-mu">
                {e.meta.date}
              </time>
              <div>
                <p className="flex flex-wrap items-center gap-2">
                  <Link href={`/log/${e.slug}`} className="font-medium text-ac2 hover:underline">
                    {e.meta.title}
                  </Link>
                  {!e.published && <DraftLabel />}
                </p>
                {e.meta.summary && <p className="text-sm text-mu">{e.meta.summary}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
