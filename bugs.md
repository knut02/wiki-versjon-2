# Bugs

Notert 2. november 2026, etter gjennomgang av tagsidene. Ikke rettet.

## Taglenker som peker på feil bokstav

Bokstavsiden grupperer en tagg etter den vanligste skrivemåten. Lenken på artikkelen bruker skrivemåten i den artikkelen. Når de to ikke starter med samme bokstav, åpnes feil side.

- `lese-og-forstå-bibelen/oversettelse/oversettelse-av-gudsnavnet.md` har taggen `Jeg er` og lenker til `/tag/j#jeg-er`. Listen ligger på `/tag/andre`, fordi `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-18-1-27-arrestasjonen-og-peters-fornektelse.md` har skrevet `"jeg-er"`.
- `kristologi/liv-og-tjeneste/jesus-i-johannes-evangeliet.md` har taggen `jeg er-utsagn` og lenker til `/tag/j#jeg-er-utsagn`. Listen ligger på `/tag/andre` under `«Jeg er»-utsagn`, fra `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-evangeliet.md`.

## Anførselstegn blir en del av taggnavnet

Lesingen av tagglisten tar ikke bort anførselstegn rundt ett enkelt ord. `"jeg-er"` beholder tegnene, regnes ikke som en bokstav, og havner under Andre. Det er samme tagg som `Jeg er`. Koden ligger i `tags()` i `src/lib/frontmatter.js`.

## Pilen til toppen

Pilen er festet til høyre kant, midt i høyden. På smal skjerm ligger den oppå teksten.

Med tastatur kommer den sist, etter alle taggene og artiklene på siden.

Uten JavaScript gjør knappen ingenting. Den har ingen adresse å falle tilbake på.

## Knappen som forstørrer bilder er på engelsk

I `src/scripts/article-enhancements.ts` får bildeknappen teksten `Expand image`. Lukking og selve dialogen bruker de norske tekstene i `src/i18n/nb.ts`. Ingen artikler har bilder nå, så knappen vises ikke før et bilde legges inn.

## Artikler uten dato

51 artikler har verken `date` eller `modified`. De kommer ikke med i RSS eller i «Nylig oppdatert». Feltet finnes heller ikke inne i `jsonld`.

- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-1-1-8-prolog-alfa-og-omega.md` — Åp 1:1–8 – Prolog: «Alfa og Omega»
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-1-9-20-den-innledende-synen.md` — Åp 1:9–20 – Den innledende synen: Menneskesønnen midt blant lysestakene
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-10-1-11-engelen-og-den-lille-rullen.md` — Åp 10:1–11 – Engelen og den lille rullen
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-11-1-19-de-to-vitnene.md` — Åp 11:1–19 – De to vitnene og den syvende basunen
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-12-1-17-kvinnen-og-dragen.md` — Åp 12:1–17 – Kvinnen og dragen
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-13-1-18-dyret-fra-havet.md` — Åp 13:1–18 – Dyret fra havet og dyret fra landet
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-14-1-20-lammet-paa-sion.md` — Åp 14:1–20 – Lammet på Sion og domsinnhøstingen
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-15-1-16-21-vredens-skaaler.md` — Åp 15:1–16:21 – Vredens skåler
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-17-1-18-den-store-skjogen.md` — Åp 17:1–18 – Den store skjøgen
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-18-1-24-babylon-er-falt.md` — Åp 18:1–24 – Babylon er falt
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-19-1-21-lammets-bryllup-og-rytterdommen.md` — Åp 19:1–21 – Lammets bryllup og rytterdommen
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-2-1-7-efesos.md` — Åp 2:1–7 – Brev til Efesos: Den som har mistet sin første kjærlighet
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-2-12-17-pergamon.md` — Åp 2:12–17 – Brev til Pergamon: Der Satan har sin trone
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-2-18-29-tyatira.md` — Åp 2:18–29 – Brevet til Tyatira
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-2-8-11-smyrna.md` — Åp 2:8–11 – Brev til Smyrna: Vær trofast inntil døden
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-20-1-15-tusenaarrsriket-og-dommen.md` — Åp 20:1–15 – Tusenårsriket og dommen
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-21-1-8-det-nye-jerusalem.md` — Åp 21:1–8 – Det nye Jerusalem (innledning)
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-21-9-22-5-den-nye-skapning.md` — Åp 21:9–22:5 – Den nye skapning
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-22-6-21-epilog.md` — Åp 22:6–21 – Epilog
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-3-1-6-sardes.md` — Åp 3:1–6 – Brev til Sardes: Du har navn for å leve, men du er død
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-3-14-22-laodikea.md` — Åp 3:14–22 – Brev til Laodikea: Den lunken menigheten
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-3-7-13-filadelfia.md` — Åp 3:7–13 – Brev til Filadelfia: Den åpne døren ingen kan stenge
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-4-1-11-himmeltronen.md` — Åp 4:1–11 – Synet av himmeltronen: Den Evige på tronen
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-5-1-14-lammet-og-rullen.md` — Åp 5:1–14 – Lammet og rullen: Seieren gjennom ofringen
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-6-1-17-de-syv-seglene.md` — Åp 6:1–17 – De syv seglene
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-7-1-17-de-144000.md` — Åp 7:1–17 – De 144 000 og den store skare
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-8-1-13-basunene-begynner.md` — Åp 8:1–13 – Basunene begynner
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaring-9-1-21-femte-og-sjette-basun.md` — Åp 9:1–21 – Femte og sjette basun: De to Ve
- `Bibelen - det Nye Testamentet/apenbaringen/aapenbaringens-sjanger.md` — Åpenbaringens sjanger: apokalyptikk, profeti og brev
- `Bibelen - det Nye Testamentet/brevene/filipperbrevet.md` — Filipperbrevet
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-11-1-57-lasarus-oppvekkelsen.md` — Johannes 11:1-57 – Lasarus' oppvekkelse
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-12-1-11-salvingen-i-betania.md` — Johannes 12:1-11 – Salvingen i Betania
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-12-12-19-det-triumferende-inntog.md` — Johannes 12:12-19 – Det triumferende inntog
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-12-20-36-greskerne-og-timens-ankomst.md` — Johannes 12:20-36 – Greskerne og timens ankomst
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-12-37-50-vantro-og-tro-epilog.md` — Johannes 12:37-50 – Vantro og tro: epilog til Tegnenes bok
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-13-1-20-fotvasking.md` — Johannes 13:1-20 – Fotvasking
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-13-21-30-forraederi-avsloringen.md` — Johannes 13:21-30 – Forræderiet avsløres
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-13-31-38-nytt-bud-og-peters-fornektelse.md` — Johannes 13:31-38 – Det nye budet og Peters fornektelse forutsagt
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-14-1-14-vei-sannhet-og-liv.md` — Johannes 14:1–14 – Vei, sannhet og liv
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-14-15-31-paraklet-og-jesu-fred.md` — Johannes 14:15–31 – Paraklet og Jesu fred
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-15-1-17-vinstokken-og-grenene.md` — Johannes 15:1–17 – Vinstokken og grenene
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-15-18-27-verden-hater-og-parakleten-vitner.md` — Johannes 15:18–27 – Verden hater, Parakleten vitner
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-18-1-27-arrestasjonen-og-peters-fornektelse.md` — Johannes 18:1–27 – Arrestasjonen og Peters fornektelse
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-18-28-19-16-jesus-for-pilatus.md` — Johannes 18:28–19:16 – Jesus for Pilatus
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-19-17-37-korsfestelsen.md` — Johannes 19:17–37 – Korsfestelsen
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-19-38-42-begravelsen.md` — Johannes 19:38–42 – Begravelsen
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-20-1-18-den-tomme-graven.md` — Johannes 20:1–18 – Den tomme graven og Maria Magdalena
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-20-19-31-tomas-bekjennelse.md` — Johannes 20:19–31 – Jesus viser seg; Tomas' bekjennelse
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-21-1-14-det-store-fisket.md` — Johannes 21:1–14 – Det store fisket ved Tiberias-sjøen
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-21-15-25-peter-gjenopprettes.md` — Johannes 21:15–25 – Peter gjenopprettes; «elsker du meg?»
- `Bibelen - det Nye Testamentet/johannesevangeliet/johannes-7-53-8-11-ekteskapsbrudd.md` — Joh 7:53–8:11 – Kvinnen grepet i ekteskapsbrudd
