import { slugify } from "./slug.js";

const linkFields = ["seeAlso", "hasPart", "relatedTo"];

export function articlesById(docs) {
  const counts = new Map();
  for (const doc of docs) {
    const id = doc.entry?.data?.id;
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const byId = new Map();
  for (const doc of docs) {
    const id = doc.entry?.data?.id;
    if (id && counts.get(id) === 1) byId.set(id, doc);
  }
  return byId;
}

function resolveLink(value, byId, hrefFor) {
  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value)) return value;
    const doc = byId.get(slugify(value));
    return doc ? hrefFor(doc) : value;
  }
  if (Array.isArray(value)) return value.map((item) => resolveLink(item, byId, hrefFor));
  return value;
}

export function withArticleLinks(jsonld, byId, hrefFor) {
  const next = { ...jsonld };
  for (const field of linkFields) {
    if (field in next) next[field] = resolveLink(next[field], byId, hrefFor);
  }
  return next;
}
