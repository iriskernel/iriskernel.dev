import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Search engines may list the site (chosen in setup). To block them: rules: { userAgent: "*", disallow: "/" }
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
