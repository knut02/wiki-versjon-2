import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { linkify, parseArticle } from "./frontmatter.js";
import { slugify } from "./slug.js";

const wikiRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../wiki");
let watching = false;
const sectionTitles = new Map();

function sectionMeta(folder) {
  const dir = path.join(wikiRoot, ...folder);
  if (sectionTitles.has(dir)) return sectionTitles.get(dir);
  const indexPath = path.join(dir, "_index.md");
  let title = "";
  let description = "";
  let order = null;
  if (fs.existsSync(indexPath)) {
    const parsed = parseArticle(fs.readFileSync(indexPath, "utf8"), "index");
    title = parsed?.title ?? "";
    description = parsed?.description ?? "";
    order = parsed?.order ?? null;
  }
  if (!title) {
    const name = folder.at(-1) ?? "";
    title = name.replaceAll("-", " ");
    title = title.charAt(0).toLocaleUpperCase("nb") + title.slice(1);
  }
  const meta = { title, description, order };
  sectionTitles.set(dir, meta);
  return meta;
}

function sections(file) {
  const parts = path.relative(wikiRoot, file).split(path.sep);
  const top = parts.length > 1 ? parts[0] : "";
  const sub = parts.length > 2 ? parts[1] : "";
  if (!top) {
    return {
      kategori: "Uten kategori",
      kategoriSlug: "uten-kategori",
      kategoriDescription: "",
      kategoriOrder: null,
      sub: "",
      subSlug: "",
      subDescription: "",
    };
  }
  const topMeta = sectionMeta([top]);
  const subMeta = sub ? sectionMeta([top, sub]) : { title: "", description: "" };
  return {
    kategori: topMeta.title,
    kategoriSlug: slugify(top),
    kategoriDescription: topMeta.description,
    kategoriOrder: topMeta.order,
    sub: subMeta.title,
    subSlug: sub ? slugify(sub) : "",
    subDescription: subMeta.description,
  };
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "sources") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".md") && entry.name !== "_index.md" && !/conflicted copy/i.test(entry.name)) {
      files.push(full);
    }
  }
}

function demoteHeadings(html) {
  return html.replaceAll("<h1", "<h2").replaceAll("</h1>", "</h2>");
}

async function sync({ store, parseData, renderMarkdown, generateDigest, logger, config }) {
  sectionTitles.clear();
  const files = [];
  walk(wikiRoot, files);
  const parsed = [];
  const used = new Set();
  let skipped = 0;

  for (const file of files) {
    if (!path.relative(wikiRoot, file).includes(path.sep)) {
      skipped += 1;
      continue;
    }
    const raw = fs.readFileSync(file, "utf8");
    const base = slugify(path.basename(file, ".md"));
    const parent = slugify(path.basename(path.dirname(file)));
    let slug = used.has(base) ? `${parent}-${base}` : base;
    let suffix = 2;
    while (used.has(slug)) {
      slug = `${parent}-${base}-${suffix}`;
      suffix += 1;
    }
    used.add(slug);
    const article = parseArticle(raw, slug);
    if (!article) {
      skipped += 1;
      continue;
    }
    Object.assign(article, sections(file));
    parsed.push({ article, file, raw });
  }

  const bySlug = new Map(parsed.map(({ article }) => [article.slug, article]));
  store.clear();

  for (const { article, file, raw } of parsed) {
    const body = linkify(article.body, bySlug);
    const rendered = await renderMarkdown(`\u200b\n${body}`, { fileURL: pathToFileURL(file) });
    rendered.html = demoteHeadings(rendered.html).replaceAll("\u200b", "");
    const data = await parseData({
      id: article.slug,
      data: {
        title: article.title,
        description: article.description,
        date: article.date,
        kategori: article.kategori,
        kategoriSlug: article.kategoriSlug,
        kategoriDescription: article.kategoriDescription,
        kategoriOrder: article.kategoriOrder,
        sub: article.sub,
        subSlug: article.subSlug,
        subDescription: article.subDescription,
        tags: article.tags,
        links: article.links,
      },
      filePath: file,
    });
    store.set({
      id: article.slug,
      data,
      body,
      filePath: path.relative(fileURLToPath(config.root), file).replaceAll("\\", "/"),
      digest: generateDigest(raw),
      rendered,
    });
  }

  logger.info(`${parsed.length} artikler, ${skipped} filer uten tittel`);
}

export function wikiLoader() {
  return {
    name: "wiki-loader",
    load: async (context) => {
      if (!fs.existsSync(wikiRoot)) {
        context.logger.error(`Fant ikke wikien i ${wikiRoot}`);
        return;
      }
      await sync(context);
      if (context.watcher && !watching) {
        watching = true;
        context.watcher.add(wikiRoot);
        context.watcher.on("all", async (event, changed) => {
          const relative = path.relative(wikiRoot, changed);
          if (relative.startsWith("..") || relative.split(path.sep).includes("sources")) return;
          if (!changed.endsWith(".md")) return;
          context.logger.info("Oppdaterer biblioteket");
          await sync(context);
        });
      }
    },
  };
}
