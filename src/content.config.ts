import { defineCollection } from "astro:content";

import { z } from "astro/zod";

import { wikiLoader } from "./lib/wiki-loader.js";

const artikler = defineCollection({
  loader: wikiLoader(),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    modified: z.string().default(""),
    kategori: z.string(),
    kategoriSlug: z.string(),
    kategoriDescription: z.string(),
    kategoriOrder: z.number().nullable(),
    sub: z.string(),
    subSlug: z.string(),
    subDescription: z.string(),
    tags: z.array(z.object({ name: z.string(), slug: z.string() })),
    links: z.array(z.string()),
    slug: z.string(),
    legacySlug: z.string().default(""),
    backlinks: z
      .array(z.object({ title: z.string(), href: z.string(), section: z.string() }))
      .default([]),
  }),
});

export const collections = { artikler };
