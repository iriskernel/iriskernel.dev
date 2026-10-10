import { site } from "@/content/site";
import { getPublished } from "@/lib/content";

export const dynamic = "force-static";

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const entries = await getPublished("log");
  const items = entries
    .map((e) => {
      const url = `${site.url}/log/${e.slug}`;
      return `    <item>
      <title>${escape(e.meta.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(e.meta.date + "T12:00:00Z").toUTCString()}</pubDate>${e.meta.summary ? `\n      <description>${escape(e.meta.summary)}</description>` : ""}
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(site.handle)} log</title>
    <link>${site.url}/log</link>
    <description>${escape(site.bio)}</description>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
