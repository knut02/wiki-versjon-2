import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { siteConfig } from "../config/site";
import { getCategoryName, getDocHref, getRecentDocs, loadDocs } from "../lib/docs";

export const GET: APIRoute = async (context) => {
  const docs = await loadDocs();
  const recent = getRecentDocs(docs, Infinity);

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site ?? siteConfig.siteUrl,
    items: recent.map((doc) => ({
      title: doc.data.title,
      description: doc.data.description ?? getCategoryName(docs, doc),
      pubDate: doc.data.updatedAt,
      link: getDocHref(doc),
    })),
    customData: `<language>${siteConfig.language}</language>`,
  });
};
