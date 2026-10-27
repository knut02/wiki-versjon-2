import { slugify } from "./slug.js";

const WIKI_LINK = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;

export function wikiSlug(target) {
  const parts = target.trim().split("/").filter(Boolean);
  const leaf = parts.at(-1) ?? target;
  return slugify(leaf.replace(/\.md$/i, ""));
}

export function linkPath(target) {
  return target
    .trim()
    .split("/")
    .filter(Boolean)
    .map((part) => slugify(part.replace(/\.md$/i, "")))
    .join("/");
}

export function linkIndex(articles) {
  const byPath = new Map();
  const byLeaf = new Map();
  for (const article of articles) {
    byPath.set(article.pathKey, article);
    const list = byLeaf.get(article.fileSlug) ?? [];
    list.push(article);
    byLeaf.set(article.fileSlug, list);
  }
  return { byPath, byLeaf };
}

export function resolveArticle(target, index) {
  const key = linkPath(target);
  if (!key) return null;
  const exact = index.byPath.get(key);
  if (exact) return exact;
  const suffix = [];
  for (const [pathKey, article] of index.byPath) {
    if (pathKey.endsWith(`/${key}`)) suffix.push(article);
  }
  if (suffix.length === 1) return suffix[0];
  if (!key.includes("/")) {
    const hits = index.byLeaf.get(key) ?? [];
    if (hits.length === 1) return hits[0];
  }
  return null;
}

export function wikiLinks(markdown) {
  const slugs = [];
  for (const match of markdown.matchAll(WIKI_LINK)) slugs.push(wikiSlug(match[1]));
  return [...new Set(slugs)];
}

export function articleHref(article) {
  return article.subSlug
    ? `/${article.kategoriSlug}/${article.subSlug}/${article.slug}`
    : `/${article.kategoriSlug}/${article.slug}`;
}

function linkedArticles(body, index) {
  const seen = new Set();
  const articles = [];
  for (const part of body.split(/(```[\s\S]*?```)/g)) {
    if (part.startsWith("```")) continue;
    for (const match of part.matchAll(WIKI_LINK)) {
      const article = resolveArticle(match[1], index);
      if (!article || seen.has(article.pathKey)) continue;
      seen.add(article.pathKey);
      articles.push(article);
    }
  }
  return articles;
}

export function backlinksByArticle(articles, index) {
  const incoming = new Map();
  for (const article of articles) {
    for (const target of linkedArticles(article.body, index)) {
      if (target.pathKey === article.pathKey) continue;
      const list = incoming.get(target.pathKey) ?? [];
      list.push({
        title: article.title,
        href: articleHref(article),
        section: article.subSlug ? article.sub : article.kategori,
      });
      incoming.set(target.pathKey, list);
    }
  }
  for (const list of incoming.values()) {
    list.sort((a, b) => a.title.localeCompare(b.title, "nb") || a.href.localeCompare(b.href, "nb"));
  }
  return incoming;
}

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function field(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match ? unquote(match[1]) : "";
}

function orderField(frontmatter) {
  const value = field(frontmatter, "order");
  if (!value) return null;
  const order = Number(value);
  return Number.isFinite(order) ? order : null;
}

function tags(value) {
  if (!value) return [];
  return value
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((name) => ({ name, slug: slugify(name) }));
}

export function parseArticle(raw, fallbackSlug) {
  const source = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  if (!source.startsWith("---\n")) return null;
  const end = source.indexOf("\n---", 4);
  if (end < 0) return null;
  const frontmatter = source.slice(4, end);
  const body = source.slice(end + 4).replace(/^\n/, "");
  const title = field(frontmatter, "title");
  if (!title) return null;
  const kategori = field(frontmatter, "kategori") || "Uten kategori";
  return {
    slug: fallbackSlug,
    title,
    description: field(frontmatter, "description"),
    date: field(frontmatter, "date"),
    modified: field(frontmatter, "modified"),
    kategori,
    kategoriSlug: slugify(kategori),
    sub: field(frontmatter, "sub-kategori"),
    tags: tags(field(frontmatter, "tags")),
    links: wikiLinks(body),
    order: orderField(frontmatter),
    body,
  };
}

function label(value) {
  return value.replace(/[\[\]<>]/g, "").trim();
}

export function linkify(body, index) {
  return body
    .split(/(```[\s\S]*?```)/g)
    .map((part) => {
      if (part.startsWith("```")) return part;
      return part.replace(WIKI_LINK, (_, target, alias) => {
        const article = resolveArticle(target, index);
        const text = label(alias || article?.title || wikiSlug(target).replaceAll("-", " "));
        if (!article) return `<span class="missing">${text}</span>`;
        return `[${text}](${articleHref(article)})`;
      });
    })
    .join("");
}
