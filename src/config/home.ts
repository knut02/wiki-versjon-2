export const home = {
  hero: {
    eyebrow: "Studie",
    title: "Hva vil du lese?",
    description: "Artikler sortert etter kategori, med søk på tvers av hele biblioteket.",
    placeholder: "Søk i artiklene...",
  },
  popular: {
    label: "Utvalg",
    categories: [] as string[],
    limit: 4,
  },
  recent: {
    title: "Nylig oppdatert",
    description: "De siste endringene.",
    limit: 5,
  },
  support: {
    title: "Finner du ikke det du leter etter?",
    description: "Bla gjennom kategoriene, eller søk etter et emne.",
    actions: [{ label: "Til forsiden", href: "/", variant: "secondary" }],
  },
} as const;
