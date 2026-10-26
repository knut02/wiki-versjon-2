import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { linkify, parseArticle } from "./frontmatter.js";
import { slugify } from "./slug.js";

const wikiRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../wiki");
const sectionTitles = new Map();
let watching = false;
let syncing = false;
let pending = false;
let timer;

function isTransient(error) {
  return error?.code === "ENOENT" || error?.code === "EPERM" || error?.code === "EBUSY";
}

function sectionMeta(folder) {
  const dir = path.join(wikiRoot, ...folder);
  if (sectionTitles.has(dir)) return sectionTitles.get(dir);
  const indexPath = path.join(dir, "_index.md");
  let title = "";
  let description = "";
  let order = null;
  if (fs.existsSync(indexPath)) {
    try {
      const parsed = parseArticle(fs.readFileSync(indexPath, "utf8"), "index");
      title = parsed?.title ?? "";
      description = parsed?.description ?? "";
      order = parsed?.order ?? null;
    } catch (error) {
      if (!isTransient(error)) throw error;
    }
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
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    if (isTransient(error)) return;
    throw error;
  }
  for (const entry of entries) {
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
    let raw;
    try {
      raw = fs.readFileSync(file, "utf8");
    } catch (error) {
      if (isTransient(error)) {
        skipped += 1;
        continue;
      }
      throw error;
    }
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
  const ready = [];

  for (const { article, file, raw } of parsed) {
    const body = linkify(article.body, bySlug);
    let rendered;
    try {
      rendered = await renderMarkdown(`\u200b\n${body}`, { fileURL: pathToFileURL(file) });
    } catch (error) {
      if (isTransient(error)) {
        skipped += 1;
        continue;
      }
      throw error;
    }
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
    ready.push({
      id: article.slug,
      data,
      body,
      filePath: path.relative(fileURLToPath(config.root), file).replaceAll("\\", "/"),
      digest: generateDigest(raw),
      rendered,
    });
  }

  store.clear();
  for (const entry of ready) store.set(entry);

  logger.info(`${ready.length} artikler, ${skipped} filer uten tittel`);
}

function scheduleSync(context) {
  pending = true;
  clearTimeout(timer);
  timer = setTimeout(() => startSync(context), 400);
}

function startSync(context) {
  if (syncing) return;
  pending = false;
  syncing = true;
  context.logger.info("Oppdaterer biblioteket");
  sync(context)
    .catch((error) => {
      if (isTransient(error)) {
        pending = true;
        return;
      }
      context.logger.warn(`Kunne ikke oppdatere biblioteket: ${error?.message ?? error}`);
    })
    .finally(() => {
      syncing = false;
      if (pending) scheduleSync(context);
    });
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
        context.watcher.on("all", (event, changed) => {
          const relative = path.relative(wikiRoot, changed);
          if (relative.startsWith("..") || relative.split(path.sep).includes("sources")) return;
          if (!changed.endsWith(".md")) return;
          scheduleSync(context);
        });
      }
    },
  };
}
