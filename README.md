# Studie

Statisk nettsted for å lese artiklene i wikien. Artiklene ligger igjen som markdown i wiki-mappen. Denne appen kopierer dem ikke inn.

## Kilde

Loaderen i `src/lib/wiki-loader.js` leser `../wiki` (mappen `wiki/wiki` ved siden av `studie-app`). Den kjører ved `astro dev` og `astro build`, og følger med på endringer i wikien mens utviklingsserveren kjører.

Hver artikkel er en `.md`-fil med frontmatter. `title` er påkrevd. Filer uten `title` hoppes over.

Disse tas ikke med:

- mappen `sources/`
- filnavn som inneholder `conflicted copy`
- filer som ligger direkte i wiki-roten, inkludert `index.md`

Kategorier kommer fra mapper, ikke fra frontmatter-feltene `kategori` og `sub-kategori`.

- Toppmappen er hovedkategori. Navn og beskrivelse hentes fra den mappens `_index.md` (`title` og `description`). Mangler tittel, brukes mappenavnet.
- Undermappen er underkategori, med beskrivelse fra den mappens `_index.md`.
- En fil som ligger direkte i en toppmappe hører til hovedkategorien. Det lages ingen underkategori for den.
- `_index.md` brukes bare som navn og beskrivelse for mappen, og blir ikke en egen artikkel. I en toppmappe leses også `order`. Lavest tall sorteres først på forsiden. Uten `order` kommer kategorien sist. Andre lister, inkludert menyen, er alfabetiske.

Slug lages med små bokstaver. `æ` blir `ae`, `ø` blir `o`, `å` blir `a`.

`id` i frontmatter er valgfritt og slugifiseres på samme måte. En wikilenke uten skråstrek, `[[frelse]]` eller `[[frelse|alias]]`, slås opp på `id` først. Treffer den, brukes den artikkelen uansett hvilken mappe filen ligger i. To artikler med samme `id` holdes utenfor oppslaget. Artikler uten `id` påvirkes ikke.

Lenker med skråstrek, `[[sti/filnavn]]` eller `[[sti/filnavn|alias]]`, slås opp på mappesti og filnavn. Først en sti som treffer nøyaktig, deretter en sti som er et entydig suffiks, og til slutt et filnavn som bare finnes én gang.

Datoen «Oppdatert» kommer fra `modified`. Mangler feltet, eller kan det ikke leses, brukes `date`.

Artikler som lenker hit, samles under innlesing og vises som «Nevnt i» nederst på artikkelsiden. Seksjonen vises bare når minst én lenke treffer.

## Adresser

| Side | Adresse |
| --- | --- |
| Forside | `/` |
| Hovedkategori | `/{kategori}` |
| Underkategori | `/{kategori}/{underkategori}` |
| Artikkel i en underkategori | `/{kategori}/{underkategori}/{artikkel}` |
| Artikkel i hovedkategorien | `/{kategori}/{artikkel}` |
| Tagg | `/tag/{tagg}` |

Eldre adresser videresendes: `/kategori/{slug}` for hovedkategoriene. `/kategori/{slug}/{underkategori}`, adresser under `/artikkel/` og den oppdiktede bolken `/{kategori}/oversikt/{artikkel}` er tatt bort.

Forsiden viser hovedkategoriene i den rekkefølgen `order` gir. Underkategoriene vises på kategorisiden. Artikler som ligger rett i toppmappen vises der også. Taggene på en artikkel lenker til taggsiden.

«Utvalg» under søkefeltet er de fire første artiklene i alfabetisk rekkefølge. Antall og eventuell avgrensning styres av `popular` i `src/config/home.ts`.

## Søk

Søket er [Pagefind](https://pagefind.app/). Indeksen lages etter bygg. Pagefind hopper over taggsidene, og søket dekker artiklene. På utviklingsserveren finnes ikke indeksen, og søkefeltet sier fra om det. Fulltekstsøk virker etter `npm run build` og `npm run preview`, og på den publiserte siden.

## Kjøring

```bash
npm install
npm run dev
```

Utviklingsserveren bruker port 4173: [http://localhost:4173](http://localhost:4173).

```bash
npm run build
npm run preview
```

`npm run build` kjører også Pagefind. Resultatet ligger i `dist/`.

## Teknikk

- [Astro](https://astro.build) 7, statisk output, uten server-adapter
- [Tailwind CSS](https://tailwindcss.com) 4
- MDX- og sitemap-integrasjoner
- Innholdssamlingen `artikler` med en egen loader
- Utseende fra temaet [Compass](https://xocothemes.com/themes/compass/) (Xoco Themes)
- Temaet følger enhetens lys- eller mørkmodus. Et eget valg lagres i `localStorage` under nøkkelen `compass-theme`
- `@/` peker på `src/`

Nettstedets navn, beskrivelse og `siteUrl` ligger i `src/config/site.ts`. `siteUrl` står nå til `http://localhost:4173` og må oppdateres før publisering, ellers blir kanoniske lenker, RSS og sitemap feil.

## Publisering

Siden er statisk og publiseres som en Cloudflare Worker med statiske filer fra `dist/`. Oppsettet ligger i `wrangler.jsonc`. Navnet der, `studie`, må være likt navnet på workeren i Cloudflare. Hvis de ikke stemmer, feiler bygget.

Workers Builds kjører på hver push til `main`:

1. Bygg: `npm run build`
2. Publiser: `npx wrangler deploy`

Koble repoet i Cloudflare: workeren → **Settings** → **Builds** → **Connect**, og velg `knut02/wiki-versjon-2`. Byggekommandoen settes til `npm run build`. Publiseringskommandoen kan stå som `npx wrangler deploy`.

Cloudflare kloner bare GitHub-repoet. Wiki-mappen ligger utenfor repoet, så et bygg der har ingen artikler. Wikien må ligge i et git-repo som bygget kan hente, for eksempel som egen repo med submodule, før push-bygget kan fylle siden. Lokalt leser appen fortsatt `../wiki`.

`siteUrl` i `src/config/site.ts` må peke på den offentlige adressen, ellers blir kanoniske lenker, RSS og sitemap feil.
