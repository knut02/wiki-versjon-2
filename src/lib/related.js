function ranked(articles, article) {
  const tags = new Set(article.data.tags.map((tag) => tag.slug));
  return articles
    .filter((item) => item.id !== article.id)
    .map((item) => ({
      item,
      score: item.data.tags.reduce((sum, tag) => sum + (tags.has(tag.slug) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score || a.item.data.title.localeCompare(b.item.data.title, "nb"));
}

export function related(article, articles) {
  const byId = new Map(articles.map((item) => [item.id, item]));
  const outgoing = article.data.links.map((slug) => byId.get(slug)).filter(Boolean);
  const outgoingIds = new Set(outgoing.map((item) => item.id));
  const incoming = articles
    .filter((item) => item.id !== article.id && item.data.links.includes(article.id))
    .sort((a, b) => a.data.title.localeCompare(b.data.title, "nb"));
  const order = ranked(articles, article);
  const sameCategory = order
    .filter(({ item }) => item.data.kategoriSlug === article.data.kategoriSlug && !outgoingIds.has(item.id))
    .sort((a, b) => {
      const sameSub = (item) => (item.data.subSlug && item.data.subSlug === article.data.subSlug ? 1 : 0);
      return (
        sameSub(b.item) - sameSub(a.item) ||
        b.score - a.score ||
        a.item.data.title.localeCompare(b.item.data.title, "nb")
      );
    })
    .slice(0, 6)
    .map(({ item }) => item);
  const used = new Set([...outgoing, ...sameCategory, ...incoming].map((item) => item.id));
  const sameTags = order
    .filter(({ item, score }) => score > 0 && !used.has(item.id))
    .slice(0, 8)
    .map(({ item }) => item);

  return { outgoing, sameCategory, sameTags, incoming: incoming.slice(0, 8) };
}
