# Deploy-Anleitung Karlson Website

Diese Webseite wird **immer ueber `git push`** deployt — nie direkt per Vercel CLI
oder Coolify-Upload. Sonst laufen GitHub-Stand und Live-Stand auseinander.

---

## 1. Workflow fuer Karlson + Codex (Standardfall, Vercel)

### Einmalig vorbereiten

Karlson braucht auf seinem Rechner:

1. **Git** installiert (https://git-scm.com/download/win)
2. **Node.js 20+** (https://nodejs.org)
3. **GitHub-Account** mit Zugriff auf das Repo `franklyai-botter/-karlson-website`
4. Repo lokal klonen:
   ```bash
   git clone https://github.com/franklyai-botter/-karlson-website.git karlson-website
   cd karlson-website
   npm install
   ```
5. Lokal starten zum Testen:
   ```bash
   npm run dev
   ```
   → öffnet `http://localhost:3000`

### Jede Aenderung deployen

Codex (oder Karlson selbst) arbeitet im Projektordner. Danach:

```bash
git pull origin main       # WICHTIG: immer zuerst, sonst Konflikte
# ... Aenderungen machen, lokal mit "npm run dev" pruefen ...
git add .
git commit -m "kurze beschreibung"
git push origin main
```

Vercel deployt automatisch in ca. 1 Minute auf
`https://karlson-website.vercel.app`.

### Was Codex auf Karlsons Rechner braucht

Codex muss den **Projektordner als Working Directory** bekommen — nicht nur
einzelne Dateien hochladen. Dann kann es echte Dateien aendern und committen.

---

## 2. Spaeter: Umzug auf Hetzner via Coolify

Das Projekt ist schon vorbereitet. Auf dem Hetzner-Server mit installiertem
Coolify:

### Schritt 1 — Neues Projekt in Coolify anlegen
- Source: **GitHub** → Repo `franklyai-botter/-karlson-website` auswaehlen
- Branch: `main`
- Build Pack: **Dockerfile** (Coolify erkennt das `Dockerfile` automatisch)
- Port: `3000`

### Schritt 2 — Environment Variables setzen
In Coolify unter „Environment Variables":
```
NEXT_IMAGES_UNOPTIMIZED=true
```
(Wird auch im Dockerfile gesetzt — als Fallback hier nochmal eintragen.)

### Schritt 3 — Domain verbinden
In Coolify Domain eintragen (z. B. `karlson-grosse.de`). Coolify holt
automatisch Let's-Encrypt-Zertifikat.

### Schritt 4 — Deploy
„Deploy" klicken. Ab da gilt: **jeder `git push` auf `main` triggert automatisch
ein neues Coolify-Deployment** (wenn „Auto Deploy" aktiviert ist).

### Schritt 5 — Vercel abschalten (erst wenn Coolify lauft)
- DNS auf den Hetzner-Server umstellen
- Vercel-Projekt deaktivieren (nicht loeschen — als Backup behalten)

---

## 3. Lokal mit Docker testen (optional)

Wenn du den Coolify-Build vorher lokal pruefen willst:

```bash
docker build -t karlson-website .
docker run -p 3000:3000 karlson-website
```

→ `http://localhost:3000` sollte die Seite zeigen.

---

## 4. Wichtige Regeln

- **Nie `vercel --prod` oder direkter Coolify-Upload.** Immer ueber `git push`.
- **Vor jeder Session `git pull`.** Lokal muss = GitHub sein.
- **Nach UI-Aenderungen einmal lokal `npm run dev` durchklicken**, bevor du pushst.
- **Geheime Werte** (API-Keys etc.) niemals committen. Immer ueber Env-Vars in
  Vercel/Coolify setzen und in `.env.example` dokumentieren (ohne Werte).
