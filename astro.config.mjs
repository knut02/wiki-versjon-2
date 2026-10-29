import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { siteConfig } from "./src/config/site.ts";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: siteConfig.siteUrl,
  // Workers Builds tar vare på denne mappen mellom bygg.
  cacheDir: "./node_modules/.astro",
  trailingSlash: "never",
  server: { port: 4173 },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.endsWith("/search-previews.json"),
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark-default",
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(root, "src"),
      },
    },
  },
});
