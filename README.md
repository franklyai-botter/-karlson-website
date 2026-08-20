# Karlson Website

Website für Karlson, Liedermacher und One-Man-Band aus Ketzin im Havelland.

Live: https://karlson-solo-orchester.de

## Stack

- Next.js App Router, **statischer Export** (`output: "export"`, Ziel `./out`)
- TypeScript
- Tailwind v4 Basissetup, eigenes CSS-Designsystem
- Auslieferung: Cloudflare Workers Static Assets (`wrangler.jsonc`) via GitHub

Die Seite hat keine API-Route, keine Middleware und keine Datenbank. Sie ist
vollständig statisch, deshalb braucht sie keinen Node-Server im Betrieb.

## Deploy

**Immer über `git push origin main`.** Cloudflare baut und veröffentlicht
automatisch. Nie `wrangler deploy` oder ein anderer Direkt-Upload, sonst laufen
GitHub-Stand und Live-Stand auseinander.

Details in [DEPLOY.md](DEPLOY.md), die Anleitung für Karlson in
[KARLSON.md](KARLSON.md).

## Routen

- `/`
- `/programme`
- `/repertoire`
- `/ueber-karlson`
- `/termine`
- `/eindruecke`
- `/veranstalter`
- `/buchung`
- `/impressum`
- `/datenschutz`
- `/agb`
- `/entwurf-2` — alternative Layoutvariante, aus Suchindex und Sitemap ausgenommen

## Lokale Entwicklung

```bash
npm run dev
```

## Build

```bash
npm run build
```

Der Build schreibt den fertigen Export nach `./out`. Wer die Auslieferung so
prüfen will, wie Cloudflare sie ausführt, kann das lokal ohne Anmeldung tun:

```bash
npx wrangler dev
```

## Hinweise

- Originalmaterial, PDFs und ZIPs bleiben im Arbeitsordner und werden per
  `.gitignore` nicht committed. Kuratierte Webbilder liegen in `public/karlson`.
- **Bilder klein halten:** ohne Image-Optimizer geht jede Datei in Originalgröße
  an den Besucher. Richtwert 400 px Kantenlänge und unter 200 KB.
- **Kein Kontaktformular.** Die Buchungsseite arbeitet mit Telefonlink und einer
  vorbefüllten E-Mail, deshalb gibt es keinen Formularversand und keine
  Serververarbeitung von Anfragedaten.
- **Termine filtern sich über das Build-Datum.** Vergangene Termine
  verschwinden erst beim nächsten Deploy, nicht von selbst im Browser.
- `NEXT_PUBLIC_SITE_URL` überschreibt die Basis-URL für Meta-Tags und Sitemap.
  Ohne die Variable greift die Domain aus `app/data.ts`.
- Rechtstexte: Impressum ist aktuell (§ 5 DDG, § 18 Abs. 2 MStV). Datenschutz
  und AGB sind Arbeitsfassungen und sollten anwaltlich geprüft werden, bevor
  gewerblich damit geworben wird.
