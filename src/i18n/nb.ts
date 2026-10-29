export const nb = {
  search: {
    label: "Søk i artiklene",
    placeholder: "Søk i artiklene...",
    hint: "Skriv for å søke. Bruk piltastene for å velge et resultat og Enter for å åpne det.",
    close: "Lukk søk",
    results: "Søkeresultater",
    suggestions: "Forslag",
    navigate: "for å velge",
    open: "for å åpne",
    dismiss: "for å lukke",
    poweredBy: "Søk med Pagefind",
    empty: "Ingen artikler treffer søket.",
    error: "Søket blir tilgjengelig etter en full bygg av siden.",
    untitled: "Uten tittel",
    resultCount: (count: number) => (count === 1 ? "1 treff" : `${count} treff`),
    suggestionCount: (count: number) => (count === 1 ? "1 forslag" : `${count} forslag`),
  },
  pagination: {
    previous: "Forrige",
    next: "Neste",
    goToPage: (page: number) => `Gå til side ${page}`,
  },
  code: {
    copy: "Kopier kode",
    copied: "Kopiert",
    copyFailed: "Kopiering feilet",
  },
  copyPage: {
    label: "Kopier siden",
    copied: "Kopiert",
    failed: "Kopiering feilet",
  },
  image: {
    close: "Lukk forstørret bilde",
    expanded: "Forstørret bilde",
  },
  heading: {
    thisSection: "dette avsnittet",
    linkTo: (title: string) => `Lenke til ${title}`,
  },
  toc: {
    label: "Innholdsfortegnelse",
    onThisPage: "På denne siden",
    editPage: "Rediger siden",
    backToTop: "Til toppen",
  },
  a11y: {
    breadcrumb: "Brødsmulesti",
    tabs: "Faner",
  },
  meta: {
    rssTitle: (name: string) => `${name}, oppdateringer`,
    socialImageAlt: (name: string) => `${name}, dokumentasjon`,
  },
};

export type Messages = typeof nb;
