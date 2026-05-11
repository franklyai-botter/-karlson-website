# Karlson Website

Next.js/Vercel Website für Karlson, Liedermacher aus Ketzin im Havelland.

## Stack

- Next.js App Router
- TypeScript
- Tailwind v4 Basissetup, eigenes CSS-Designsystem
- Deploymentziel: Vercel via GitHub

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

## Hinweise

- Originalmaterial, PDFs und ZIPs bleiben im Arbeitsordner, werden aber per `.gitignore` nicht committed.
- Kuratierte Webbilder liegen unter `public/karlson`.
- Formularversand ist noch nicht final angeschlossen. Entscheidung offen: Vercel Function mit Maildienst oder EU-Alternative.
- Rechtstexte sind Arbeitsfassungen und brauchen finale Kundendaten.
