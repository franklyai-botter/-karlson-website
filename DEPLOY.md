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

## 2. Cloudflare einrichten (einmalig) — Launch-Ablauf

Reihenfolge ist Absicht: **erst der Worker, dann die Domain.** So läuft die neue
Auslieferung schon nachweisbar, bevor die Domain umgezogen wird. Die Seite ist
zu keinem Zeitpunkt offline, weil Vercel bis zum Schluss weiterläuft.

Stand der Prüfung: 20.08.2026.

### Vorab — Ist-Zustand der Domain (geprüft, nicht vermutet)

`karlson-solo-orchester.de` ist seit 19.08.2026 registriert, Status `active`.
Sie liegt bei **IONOS** (Nameserver `ns1031.ui-dns.com`, `ns1040.ui-dns.biz`,
`ns1090.ui-dns.de`, `ns1106.ui-dns.org`). Bestehende Einträge:

| Typ | Wert |
|---|---|
| A | `217.160.0.176` (IONOS-Parkseite) |
| AAAA | `2001:8d8:100f:f000::200` |
| MX | `mx00.ionos.de` (10), `mx01.ionos.de` (10) |
| TXT | `v=spf1 include:_spf-eu.ionos.com ~all` |
| www | existiert nicht |

**DNSSEC ist nicht aktiv** (kein DS-Record). Die klassische Umzugsfalle entfällt
damit — nur beim Umzug bitte auch nicht einschalten.

> **Die MX- und SPF-Einträge sind der kritische Punkt am Launch-Abend.**
> Auf der Domain liegt ein IONOS-Postfach. Wer die Nameserver auf Cloudflare
> umstellt und MX plus SPF nicht in die Cloudflare-Zone übernimmt, schaltet die
> E-Mail-Adresse ab. Anfragen von Veranstaltern kommen dann nicht mehr an, und
> auf der Webseite fällt das nicht auf.

### Schritt 1 — Worker anlegen und aus dem Repo bauen lassen

Dashboard → **Compute (Workers)** → **Create** → **Import a repository**

- Git repository: `franklyai-botter/-karlson-website`
- Git branch: `main`
- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy` (ist der Standardwert, so lassen)

**Es gibt bei Workers kein Feld „Build output directory".** Das ist der
Unterschied zu Cloudflare Pages: was ausgeliefert wird, steht in `wrangler.jsonc`
(`assets.directory: "./out"`, `not_found_handling: "404-page"`). Wer hier ein
Ausgabeverzeichnis sucht, sucht vergeblich.

Der `npx wrangler deploy` im Deploy command ist **kein** CLI-Direkt-Deploy und
kein Widerspruch zur Regel oben: der Befehl läuft in Cloudflares Build-Umgebung,
ausgelöst durch den Push. Von einem lokalen Rechner wird nie deployt.

Node-Version: `.nvmrc` im Repo setzt 24, passend zur lokal getesteten
Umgebung. Ohne die Datei nimmt Cloudflare seinen eigenen Standard, der sich
irgendwann ändert und dann den Build brechen kann.

### Schritt 2 — Umgebungsvariable setzen

Settings → **Variables and Secrets**:

```
NEXT_PUBLIC_SITE_URL=https://karlson-solo-orchester.de
```

Ohne die Variable greift die Domain aus `app/data.ts` — das Ergebnis ist
dasselbe. Die Variable ist der Weg, die Domain ohne Code-Änderung zu wechseln.
Nach dem Setzen einen neuen Build auslösen, sonst steckt der alte Wert im HTML.

### Schritt 3 — Auf der Cloudflare-Testadresse prüfen

Der Worker ist sofort unter `<name>.<subdomain>.workers.dev` erreichbar. Diese
Adresse prüfen, **bevor** die Domain angefasst wird:

- Startseite lädt, Bilder sind da
- `/termine/`, `/buchung/`, `/impressum/` antworten mit 200
- `/robots.txt` und `/sitemap.xml` sind erreichbar
- ein erfundener Pfad wie `/gibtsnicht/` antwortet mit **404**, nicht mit der Startseite

Erst wenn das steht, weiter.

### Schritt 4 — Domain als Site in Cloudflare aufnehmen

Eine Custom Domain für einen Worker verlangt eine **aktive Cloudflare-Zone**.
Die Domain muss also erst in Cloudflare als Site liegen:

Dashboard → **Add a domain** → `karlson-solo-orchester.de` → Free-Plan genügt.

Cloudflare scannt die bestehende Zone und übernimmt gefundene Einträge. **Danach
gegen die Tabelle oben abgleichen**, insbesondere die zwei MX-Einträge und den
SPF-TXT. Was fehlt, hier nachtragen — jetzt, nicht später. Solange die
Nameserver noch bei IONOS stehen, ist das ein Trockenlauf ohne Wirkung nach
außen.

Den A- und AAAA-Eintrag auf die IONOS-Parkseite braucht es nicht mehr; den legt
Schritt 6 als Worker-Route neu an.

### Schritt 5 — Nameserver bei IONOS umstellen

Cloudflare nennt zwei Nameserver. Diese im IONOS-Kundenkonto unter der Domain
eintragen und die vier `ui-dns`-Einträge ersetzen.

- **Auto-Renew bei IONOS aktiv lassen.** Eine abgelaufene Domain ist schlimmer
  als eine langsame.
- Übernahme dauert in der Regel Minuten bis wenige Stunden. Cloudflare meldet
  die Zone dann als `Active`.
- **DNSSEC nicht einschalten**, solange der Umzug nicht durch ist.

### Schritt 6 — Custom Domain auf den Worker legen

Worker → **Settings** → **Domains & Routes** → **Add** → **Custom Domain**

- `karlson-solo-orchester.de` hinzufügen

Cloudflare legt den DNS-Eintrag selbst an und stellt das Zertifikat selbst aus.
Voraussetzung: auf dem Hostnamen darf kein CNAME liegen — deshalb Schritt 4
vorher aufräumen.

`www` gehört ebenfalls erledigt, sonst landet jeder, der es eintippt, im Nichts.
Empfehlung: **Redirect Rule** `www.karlson-solo-orchester.de/*` → 301 auf
`https://karlson-solo-orchester.de/$1`. Ein 301 statt einer zweiten Custom
Domain, weil Sitemap und Canonical-Tags auf die Adresse ohne `www` zeigen.

### Schritt 7 — Abnahme unter der echten Domain

- `https://karlson-solo-orchester.de` lädt, Zertifikat gültig
- `http://` leitet auf `https://` um
- `www.` leitet mit 301 auf die Adresse ohne `www`
- **E-Mail-Test: eine Mail an die Adresse auf der Domain schicken und dass sie
  ankommt.** Der Test, den man am Launch-Abend vergisst und drei Tage später
  bereut.
- `/sitemap.xml` nennt die echte Domain, nicht mehr den Vercel-Alias
- Eine Teständerung pushen und nachsehen, ob der Build automatisch anläuft

### Schritt 8 — Erst danach Vercel abschalten

- Vercel-Projekt **deaktivieren, nicht löschen.** Es bleibt Rückfallebene, bis
  die neue Auslieferung ein paar Tage stabil war.
- Dann prüfen, dass keine Doku und kein Link mehr auf
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
