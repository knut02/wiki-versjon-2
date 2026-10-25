import { slugify } from "./slug.js";

const WIKI_LINK = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;

export function wikiSlug(target) {
  const parts = target.trim().split("/").filter(Boolean);
  const leaf = parts.at(-1) ?? target;
  return slugify(leaf.replace(/\.md$/, ""));
}

export function wikiLinks(markdown) {
  const slugs = [];
  for (const match of markdown.matchAll(WIKI_LINK)) slugs.push(wikiSlug(match[1]));
  return [...new Set(slugs)];
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
    kategori,
    kategoriSlug: slugify(kategori),
    sub: field(frontmatter, "sub-kategori"),
    tags: tags(field(frontmatter, "tags")),
    links: wikiLinks(body),
    body,
  };
}

function label(value) {
  return value.replace(/[\[\]<>]/g, "").trim();
}

export function linkify(body, bySlug) {
  return body
    .split(/(```[\s\S]*?```)/g)
    .map((part) => {
      if (part.startsWith("```")) return part;
      return part.replace(WIKI_LINK, (_, target, alias) => {
        const slug = wikiSlug(target);
        const article = bySlug.get(slug);
        const text = label(alias || article?.title || slug.replaceAll("-", " "));
        if (!article) return `<span class="missing">${text}</span>`;
        const href = article.subSlug
          ? `/${article.kategoriSlug}/${article.subSlug}/${article.slug}`
          : `/${article.kategoriSlug}/${article.slug}`;
        return `[${text}](${href})`;
      });
    })
    .join("");
}
