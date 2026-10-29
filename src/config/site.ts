export const siteConfig = {
  name: "Studie",
  title: "Studie",
  description: "Artikler og notater, sortert etter kategori.",
  siteUrl: "http://localhost:4173",
  /** Standardspråk. Et nytt språk er en fil i src/i18n/ som registreres i src/i18n/index.ts. */
  language: "nb",
  locale: "nb_NO",
  dateLocale: "nb-NO",
  socialImage: "/og-image.png",
  repository: "",
  editBaseUrl: "",
  action: { label: "Hjem", href: "/" },
  footerText:
    "Artiklene bygger på akademiske kilder, bøker, primærtekster og egne studier og refleksjoner. Kildene er skrevet av mennesker. Selve artiklene er i hovedsak skrevet av en KI-agent.",
  socials: [{ label: "RSS", href: "/rss.xml" }],
};

export const footerLinks = [
  { label: "RSS", href: "/rss.xml" },
  { label: "Sitemap", href: "/sitemap-index.xml" },
  { label: "llms.txt", href: "/llms.txt" },
];
