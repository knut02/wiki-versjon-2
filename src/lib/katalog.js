export function byTitle(articles) {
  return [...articles].sort((a, b) => a.data.title.localeCompare(b.data.title, "nb"));
}

export function categories(articles) {
  const map = new Map();
  for (const article of articles) {
    if (!map.has(article.data.kategoriSlug)) map.set(article.data.kategoriSlug, article.data.kategori);
  }
  return [...map.entries()].sort((a, b) => {
    if (a[0] === "uten-kategori") return 1;
    if (b[0] === "uten-kategori") return -1;
    return a[1].localeCompare(b[1], "nb");
  });
}

export function subcategories(articles, kategoriSlug) {
  const map = new Map();
  for (const article of articles) {
    if (article.data.kategoriSlug !== kategoriSlug || !article.data.subSlug) continue;
    if (!map.has(article.data.subSlug)) map.set(article.data.subSlug, article.data.sub);
  }
  return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "nb"));
}

export function place(article) {
  const { kategori, sub } = article.data;
  if (!sub || sub.toLowerCase() === kategori.toLowerCase()) return kategori;
  return `${kategori} · ${sub}`;
}

export function searchText(article) {
  return [
    article.data.title,
    article.data.description,
    article.data.kategori,
    article.data.sub,
    ...article.data.tags.map((tag) => tag.name),
  ]
    .join(" ")
    .toLowerCase();
}

export function tagName(articles, slug) {
  for (const article of articles) {
    const tag = article.data.tags.find((item) => item.slug === slug);
    if (tag) return tag.name;
  }
  return slug;
}
