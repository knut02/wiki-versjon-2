import type { APIRoute } from "astro";
import { siteConfig } from "../config/site";
import {
  getCategoriesForParent,
  getDocHref,
  getOrderedDocsForCategory,
  getParents,
  loadDocs,
} from "../lib/docs";

export const GET: APIRoute = async () => {
  const docs = (await loadDocs()).filter((doc) => !doc.data.hideFromSearch);
  const lines = [`# ${siteConfig.name}`, "", `> ${siteConfig.description}`, ""];

  const pushEntries = (heading: string, entries: typeof docs) => {
    if (entries.length === 0) return;
    lines.push(`## ${heading}`, "");
    entries.forEach((doc) => {
      const url = new URL(getDocHref(doc), siteConfig.siteUrl).toString();
      lines.push(`- [${doc.data.title}](${url})${doc.data.description ? `: ${doc.data.description}` : ""}`);
    });
    lines.push("");
  };

  getParents(docs).forEach((parent) => {
    getCategoriesForParent(docs, parent.slug).forEach((category) => {
      pushEntries(`${parent.name}: ${category.name}`, getOrderedDocsForCategory(docs, parent.slug, category.slug));
    });
    pushEntries(parent.name, getOrderedDocsForCategory(docs, parent.slug, ""));
  });

  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
