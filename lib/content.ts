import fs from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";

/*
  Case studies (content/projects) and devlog entries (content/log) are .mdx files.
  Each one starts with `export const meta = { ... }`.

  A page is published only when meta.draft is false AND it has no <Todo> left.
  During `npm run dev`, drafts are shown too (with a "Draft" label) so you can preview them.
  Files starting with "_" (like _template.mdx) are never listed.
*/

export type ProjectMeta = {
  title: string;
  summary: string;
  role?: string;
  links?: { label: string; href: string }[];
  draft: boolean;
};

export type LogMeta = {
  title: string;
  /** YYYY-MM-DD */
  date: string;
  summary?: string;
  draft: boolean;
};

type Kind = "projects" | "log";
type MetaFor<K extends Kind> = K extends "projects" ? ProjectMeta : LogMeta;
export type Entry<K extends Kind> = { slug: string; meta: MetaFor<K>; published: boolean; Content: ComponentType };

const showDrafts = process.env.NODE_ENV === "development";

function dir(kind: Kind) {
  return path.join(process.cwd(), "content", kind);
}

function slugs(kind: Kind) {
  return fs
    .readdirSync(dir(kind))
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

async function load<K extends Kind>(kind: K, slug: string): Promise<Entry<K>> {
  const mod =
    kind === "projects" ? await import(`@/content/projects/${slug}.mdx`) : await import(`@/content/log/${slug}.mdx`);
  const meta = mod.meta as MetaFor<K>;
  const unfinished = fs.readFileSync(path.join(dir(kind), `${slug}.mdx`), "utf8").includes("<Todo");
  if (!meta.draft && unfinished) {
    console.warn(`content/${kind}/${slug}.mdx says draft: false but still has a <Todo>, so it stays hidden`);
  }
  return { slug, meta, published: !meta.draft && !unfinished, Content: mod.default };
}

/** Entries visible on the site: published ones (plus drafts while developing) */
export async function getEntries<K extends Kind>(kind: K): Promise<Entry<K>[]> {
  const all = await Promise.all(slugs(kind).map((s) => load(kind, s)));
  const visible = all.filter((e) => e.published || showDrafts);
  if (kind === "log") {
    // Newest first
    visible.sort((a, b) => ((b.meta as LogMeta).date > (a.meta as LogMeta).date ? 1 : -1));
  }
  return visible;
}

export async function getEntry<K extends Kind>(kind: K, slug: string): Promise<Entry<K> | null> {
  if (!slugs(kind).includes(slug)) return null;
  const entry = await load(kind, slug);
  return entry.published || showDrafts ? entry : null;
}

/** Only published entries, for the sitemap, RSS and links from the home page */
export async function getPublished<K extends Kind>(kind: K): Promise<Entry<K>[]> {
  return (await getEntries(kind)).filter((e) => e.published);
}
