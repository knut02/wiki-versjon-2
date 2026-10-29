import { getCollection, type CollectionEntry } from "astro:content";

export type WikiEntry = CollectionEntry<"artikler">;

export type DocsParent = {
  slug: string;
  name: string;
  description: string;
  count: number;
  icon: string;
  order: number | null;
};

export type DocsCategory = {
  name: string;
  slug: string;
  parent: string;
  description: string;
  icon: string;
};

export type DocView = {
  id: string;
  body?: string;
  filePath?: string;
  entry: WikiEntry;
  data: {
    title: string;
    description?: string;
    category: string;
    parent: string;
    tags: string[];
    updatedAt?: Date;
    hideFromSearch: boolean;
    relatedLinks: [];
    order: number;
  };
};

export type SearchSuggestion = {
  title: string;
  excerpt: string;
  url: string;
  category: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  "bibelen-det-nye-testamentet": "book-open",
  "bibelen-det-gamle-testamentet": "scroll-text",
  "lese-og-forsta-bibelen": "book-marked",
  studieplaner: "list-checks",
  "tro-og-liv": "heart",
  kristologi: "cross",
  teologi: "scale",
  kirkehistorie: "church",
  grunnleggende: "layers",
  "kvinner-og-bibelen": "users",
  "global-kristendom": "globe",
  "verdensreligioner-og-livssyn": "languages",
  personer: "user",
  steder: "map-pin",
  tidslinjer: "clock",
  historie: "landmark",
};

function categoryIcon(slug: string) {
  return CATEGORY_ICONS[slug] ?? "book-open";
}

const SEARCH_PREVIEW_MAX_CHARS = 160;

function parseDate(value: string) {
  if (!value) return undefined;
  const time = Date.parse(value);
  if (Number.isNaN(time)) return undefined;
  return new Date(time);
}

export function asDoc(entry: WikiEntry): DocView {
  return {
    id: entry.id,
    body: entry.body,
    filePath: entry.filePath,
    entry,
    data: {
      title: entry.data.title,
      description: entry.data.description || undefined,
      category: entry.data.subSlug,
      parent: entry.data.kategoriSlug,
      tags: entry.data.tags.map((tag) => tag.name),
      updatedAt: parseDate(entry.data.modified) ?? parseDate(entry.data.date),
      hideFromSearch: false,
      relatedLinks: [],
      order: 100,
    },
  };
}

export async function loadDocs() {
  const entries = await getCollection("artikler");
  return entries
    .map(asDoc)
    .sort((a, b) => a.data.title.localeCompare(b.data.title, "nb"));
}

export type DocsTag = {
  slug: string;
  name: string;
  count: number;
};

export function getPopularTags(docs: DocView[], limit = 10): DocsTag[] {
  const tags = new Map<string, Map<string, number>>();

  for (const doc of docs) {
    for (const tag of doc.entry.data.tags) {
      const names = tags.get(tag.slug) ?? new Map<string, number>();
      names.set(tag.name, (names.get(tag.name) ?? 0) + 1);
      tags.set(tag.slug, names);
    }
  }

  return [...tags.entries()]
    .map(([slug, names]) => {
      const [name, count] = [...names.entries()].sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "nb"),
      )[0];
      return { slug, name, count: [...names.values()].reduce((sum, value) => sum + value, 0) || count };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "nb"))
    .slice(0, limit);
}

export function getParents(docs: DocView[]): DocsParent[] {
  const parents = new Map<string, DocsParent & { count: number }>();

  for (const doc of docs) {
    const current = parents.get(doc.data.parent) ?? {
      slug: doc.data.parent,
      name: doc.entry.data.kategori,
      description: "",
      count: 0,
      order: null,
    };
    current.count += 1;
    if (doc.entry.data.kategoriDescription) current.description = doc.entry.data.kategoriDescription;
    if (doc.entry.data.kategoriOrder != null) current.order = doc.entry.data.kategoriOrder;
    parents.set(doc.data.parent, current);
  }

  return [...parents.values()]
    .sort((a, b) => a.name.localeCompare(b.name, "nb"))
    .map((parent) => ({
      slug: parent.slug,
      name: parent.name,
      description: parent.description,
      count: parent.count,
      icon: categoryIcon(parent.slug),
      order: parent.order,
    }));
}

export function getCategories(docs: DocView[]): DocsCategory[] {
  const categories = new Map<string, DocsCategory & { count: number }>();

  for (const doc of docs) {
    if (!doc.data.category) continue;
    const key = `${doc.data.parent}/${doc.data.category}`;
    const current = categories.get(key) ?? {
      name: doc.entry.data.sub || "Oversikt",
      slug: doc.data.category,
      parent: doc.data.parent,
      description: "",
      icon: "folder",
      count: 0,
    };
    current.count += 1;
    if (doc.entry.data.subDescription) current.description = doc.entry.data.subDescription;
    categories.set(key, current);
  }

  return [...categories.values()]
    .sort((a, b) => a.name.localeCompare(b.name, "nb"))
    .map((category) => ({
      name: category.name,
      slug: category.slug,
      parent: category.parent,
      description: category.description,
      icon: categoryIcon(category.parent),
    }));
}

export function getCategoriesForParent(docs: DocView[], parentSlug: string) {
  return getCategories(docs).filter((category) => category.parent === parentSlug);
}

export function getCategoryHref(category: { parent: string; slug: string }) {
  return `/${category.parent}/${category.slug}`;
}

export function getDocSlug(doc: DocView) {
  return doc.entry.data.slug;
}

export function getDocHref(doc: DocView) {
  const slug = getDocSlug(doc);
  if (!doc.data.category) return `/${doc.data.parent}/${slug}`;
  return `/${doc.data.parent}/${doc.data.category}/${slug}`;
}

export function getCategoryName(docs: DocView[], doc: DocView) {
  if (!doc.data.category) return doc.entry.data.kategori;
  return (
    getCategoriesForParent(docs, doc.data.parent).find((category) => category.slug === doc.data.category)?.name ??
    doc.data.category
  );
}

const clampText = (value: string, maxChars = SEARCH_PREVIEW_MAX_CHARS) => {
  if (value.length <= maxChars) return value;
  const truncated = value.slice(0, maxChars);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  return `${(lastSpaceIndex > 60 ? truncated.slice(0, lastSpaceIndex) : truncated).trimEnd()}...`;
};

export function getDocSearchPreview(doc: DocView, maxChars = SEARCH_PREVIEW_MAX_CHARS) {
  return clampText(doc.data.description?.trim() ?? "", maxChars);
}

export function getSearchPreviewLookup(docs: DocView[]) {
  return Object.fromEntries(docs.map((doc) => [getDocHref(doc), getDocSearchPreview(doc)])) as Record<string, string>;
}

export function getSuggestedSearchArticles(
  docs: DocView[],
  { limit = 4, categories = [] }: { limit?: number; categories?: readonly string[] } = {},
): SearchSuggestion[] {
  const allowed = new Set(categories);
  const visible = docs.filter((doc) => !doc.data.hideFromSearch);
  const filtered = allowed.size ? visible.filter((doc) => allowed.has(doc.data.category)) : visible;
  const chosen = (filtered.length ? filtered : visible).slice(0, limit);

  return chosen.map((doc) => ({
    title: doc.data.title,
    excerpt: getDocSearchPreview(doc),
    url: getDocHref(doc),
    category: getCategoryName(docs, doc),
  }));
}

export function getOrderedDocsForCategory(docs: DocView[], parent: string, category: string) {
  return docs
    .filter((doc) => doc.data.parent === parent && doc.data.category === category)
    .sort((a, b) => a.data.title.localeCompare(b.data.title, "nb"));
}

export function getRecentDocs(docs: DocView[], limit = 5) {
  return docs
    .filter((doc) => doc.data.updatedAt && !doc.data.hideFromSearch)
    .sort((a, b) => b.data.updatedAt!.getTime() - a.data.updatedAt!.getTime())
    .slice(0, limit);
}

export type SidebarGroup = {
  name: string;
  slug: string;
  href: string;
  icon: string;
  description: string;
  articles: { title: string; href: string; slug: string }[];
};

export function getSidebarGroups(docs: DocView[], parentSlug: string): SidebarGroup[] {
  return getCategoriesForParent(docs, parentSlug).map((category) => ({
    name: category.name,
    slug: category.slug,
    href: getCategoryHref(category),
    icon: category.icon,
    description: category.description,
    articles: getOrderedDocsForCategory(docs, parentSlug, category.slug).map((doc) => ({
      title: doc.data.title,
      href: getDocHref(doc),
      slug: getDocSlug(doc),
    })),
  }));
}

export function getReadingTime(body = "") {
  const words = body
    .replace(/^---[\s\S]*?---/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / 220));
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}
