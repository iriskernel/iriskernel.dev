import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getPublished } from "@/lib/content";

// Drafts are never listed here
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, log] = await Promise.all([getPublished("projects"), getPublished("log")]);
  return [
    { url: site.url },
    { url: `${site.url}/projects` },
    { url: `${site.url}/log` },
    { url: `${site.url}/terminal` },
    ...projects.map((p) => ({ url: `${site.url}/projects/${p.slug}` })),
    ...log.map((e) => ({ url: `${site.url}/log/${e.slug}`, lastModified: e.meta.date })),
  ];
}
