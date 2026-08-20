# Deploy-Anleitung Karlson Website

Diese Webseite wird **immer über `git push`** veröffentlicht. Nie per
`wrangler deploy`, nie per Direkt-Upload. Sonst laufen GitHub-Stand und
Live-Stand auseinander, und niemand weiß mehr, was eigentlich online ist.

Live: https://karlson-solo-orchester.de

---

## 1. Workflow für Karlson + Codex (Standardfall)

Die ausführliche, nicht-technische Fassung steht in [KARLSON.md](KARLSON.md).

### Einmalig vorbereiten

1. **Git** und **Node.js 20+**
2. GitHub-Zugriff auf `franklyai-botter/-karlson-website`
3. Repo klonen:
   ```bash
   git clone https://github.com/franklyai-botter/-karlson-website.git karlson-website
   cd karlson-website
   npm install
   ```

### Jede Änderung veröffentlichen

```bash
git pull origin main       # immer zuerst, sonst Konflikte
# ... Änderungen machen, lokal mit "npm run dev" prüfen ...
git add .
git commit -m "kurze beschreibung"
git push origin main
```

Cloudflare baut und veröffentlicht automatisch in ein bis zwei Minuten.

Codex braucht den **Projektordner als Working Directory**, nicht einzelne
Dateien. Nur so kann es echte Dateien ändern und committen.

---

## 2. Cloudflare einrichten (einmalig)

### Schritt 1 — Projekt anlegen

Cloudflare-Dashboard → **Workers & Pages** → **Create** → **Import a repository**

- Repository: `franklyai-botter/-karlson-website`
- Branch: `main`
- Build command: `npm run build`
- Build output directory: `out`

Ein `wrangler.jsonc` liegt im Repo und beschreibt die Auslieferung
(`assets.directory: "./out"`, `not_found_handling: "404-page"`).

### Schritt 2 — Umgebungsvariable setzen

Unter „Settings" → „Variables and Secrets":

```
NEXT_PUBLIC_SITE_URL=https://karlson-solo-orchester.de
```

Ohne die Variable greift die Domain aus `app/data.ts`. Beides führt zum
gleichen Ergebnis; die Variable ist der Weg, die Domain ohne Code-Änderung zu
wechseln.

### Schritt 3 — Domain verbinden

Unter „Custom domains" die Domain `karlson-solo-orchester.de` hinzufügen.
Cloudflare stellt das Zertifikat selbst aus.

**Wenn die Domain bei einem anderen Anbieter liegt (z. B. IONOS):** dort die
Nameserver auf die von Cloudflare genannten umstellen. Zwei Fallen dabei:

- **DNSSEC vorher abschalten.** Ist DNSSEC beim Registrar aktiv und die
  Nameserver wechseln, ist die Domain zwischenzeitlich für niemanden
  erreichbar, weil die Signaturen nicht mehr zur neuen Zone passen.
- **Auto-Renew beim Registrar aktiv lassen.** Eine abgelaufene Domain ist
  schlimmer als eine langsame.

### Schritt 4 — Prüfen, dann Vercel abschalten

Erst wenn die Cloudflare-Auslieferung unter der echten Domain läuft:

- Vercel-Projekt **deaktivieren, nicht löschen.** Es bleibt die Rückfallebene,
  bis die neue Auslieferung ein paar Tage stabil war.
- Danach prüfen, dass keine Doku und kein Link mehr auf
  `karlson-website.vercel.app` zeigt.

---

## 3. Auslieferung lokal prüfen

Der Build schreibt nach `./out`. So testet man genau das, was Cloudflare
ausliefert, ohne Anmeldung und ohne Deployment:

```bash
npm run build
npx wrangler dev
```

Dann `http://localhost:8787` aufrufen. Auch die 404-Behandlung lässt sich so
prüfen: ein Aufruf wie `/gibtsnicht/` muss mit Status 404 antworten.

---

## 4. Wichtige Regeln

- **Nie `wrangler deploy`, nie `vercel --prod`.** Immer über `git push`.
- **Vor jeder Session `git pull`.** Lokal muss gleich GitHub sein.
- **Nach UI-Änderungen einmal lokal durchklicken**, bevor gepusht wird.
- **Bilder klein halten.** Der statische Export hat keinen Image-Optimizer,
  jede Datei geht in Originalgröße an den Besucher. Richtwert: 400 px
  Kantenlänge, unter 200 KB.
- **Termine aktualisieren sich nur beim Build.** Der Stichtag ist das
  Build-Datum. Wer vergangene Termine verschwinden lassen will, muss einen
  Deploy auslösen, ein Aufruf im Browser genügt nicht.
- **Geheime Werte niemals committen.** Immer als Variable im
  Cloudflare-Projekt setzen und in `.env.example` ohne Wert dokumentieren.

---

## 5. Nicht mehr verfolgt: Coolify auf Hetzner

Bis Juni 2026 war ein Umzug auf einen eigenen Hetzner-Server mit Coolify
vorbereitet (`output: "standalone"` plus `Dockerfile`). Das ist mit dem
Wechsel auf den statischen Export hinfällig, `Dockerfile` und `.dockerignore`
sind entfernt.

Der Grund für die Entscheidung: die Seite hat keine API-Route, keine
Middleware und keine Datenbank. Ein Server, der laufen und gepatcht werden
muss, wäre für eine statische Seite Aufwand ohne Gegenwert. Sollte später
doch serverseitige Logik dazukommen, ist die Historie der richtige Ort, um den
alten Docker-Aufbau nachzulesen.
