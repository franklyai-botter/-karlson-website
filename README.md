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

⚠️ **`wrangler dev` vorher beenden, wenn neu gebaut wird.** Sonst bricht der
Build unter Windows mit `EBUSY` ab und man prüft unbemerkt gegen einen
Mischstand aus zwei Builds.

## Prüfen

```bash
npm run pruefen:smoke   # ~40 s, 11 Routen × Desktop/Handy, Chromium
npm run pruefen         # ~20 s, Chromium + WebKit, 1464 Prüfungen
```

Beide setzen den Exit-Code auf 1, wenn etwas fehlschlägt, und prüfen
standardmäßig die Live-Seite. Playwright ist absichtlich **keine** Dependency —
sonst zöge jeder Cloudflare-Build einen Browser mit. Einrichtung, Variablen und
die Konstruktionsregeln stehen in
[scripts/pruefen/README.md](scripts/pruefen/README.md).

## Hinweise

- Originalmaterial, PDFs und ZIPs bleiben im Arbeitsordner und werden per
  `.gitignore` nicht committed. Kuratierte Webbilder liegen in `public/karlson`.
- **Bilder klein halten.** `next/image` erzeugt bei `images.unoptimized` kein
  srcset, deshalb baut `npm run bilder:webp` die WebP-Fassungen (400/800/1200 px)
  plus Manifest; die erzeugten Dateien werden **mitcommittet**, damit der
  Cloudflare-Build kein sharp braucht. Fehlt ein Bild im Manifest, geht das
  Original raus — nur unverkleinert, nicht fehlend.
- **Anfrageformular auf `/buchung/`**, seit 21.08.2026 produktiv. Der Versand
  liegt in `worker/index.js` (der statische Export schließt eine Next-API-Route
  aus), geht per Mailjet raus und speichert nichts. Sichtbar nur mit
  `NEXT_PUBLIC_FORMULAR_AKTIV=1`; Spam-Schutz über Turnstile, Honeypot,
  serverseitige Feldprüfung, Origin-Check und eine WAF-Rate-Limit-Regel auf
  `/api/contact`. Details in [DEPLOY.md](DEPLOY.md).
- **Termine filtern sich über das Build-Datum.** Vergangene Termine
  verschwinden erst beim nächsten Deploy, nicht von selbst im Browser.
- `NEXT_PUBLIC_SITE_URL` überschreibt die Basis-URL für Meta-Tags und Sitemap.
  Ohne die Variable greift die Domain aus `app/data.ts`.
- Rechtstexte: Impressum ist aktuell (§ 5 DDG, § 18 Abs. 2 MStV). Datenschutz
  und AGB sind Arbeitsfassungen und sollten anwaltlich geprüft werden, bevor
  gewerblich damit geworben wird.
