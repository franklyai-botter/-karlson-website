# Anleitung für Karlson

So pflegst du deine Webseite selbst mit Codex auf deinem Mac. Frank schaltet
nur GitHub und Cloudflare im Hintergrund — du arbeitest nur in Codex und in
deinem Projektordner.

Deine Adresse: **https://karlson-solo-orchester.de**

---

## 0. Einmalig: deinen alten Stand aufräumen

Nur nötig, wenn du das Repo schon auf dem Mac hast und dort schon einmal etwas
committet hast, das nie hochgeladen wurde. Dann liegt bei dir eine alte Version
der Änderung, und ein `git pull` würde sich mit der neuen beißen.

```bash
cd ~/karlson-website
git fetch origin
git reset --hard origin/main
```

Das verwirft deinen lokalen Stand und holt den aktuellen. **Deine Arbeit ist
dabei nicht verloren:** Frank hat dieselbe Änderung schon eingebaut und
hochgeladen. Wenn du unsicher bist, ruf ihn vorher an.

---

## 1. Einmaliges Setup (15 Minuten)

Diese Schritte machst du **einmal**. Danach nie wieder.

### 1.1 Tools installieren

Öffne auf dem Mac das Programm „Terminal" (über Spotlight: `Cmd + Leertaste`,
dann „Terminal" tippen).

```bash
# Apple Entwickler-Tools (für Git):
xcode-select --install

# Homebrew (Paketmanager):
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js und GitHub-Login:
brew install node gh
```

### 1.2 Bei GitHub einloggen

```bash
gh auth login
```
- „GitHub.com" wählen
- „HTTPS" wählen
- „Login with a web browser" wählen
- Code merken, im Browser eingeben
- Mit deinem GitHub-Account `karlikarlson` einloggen

### 1.3 Repo runterladen

```bash
cd ~
gh repo clone franklyai-botter/-karlson-website karlson-website
cd karlson-website
npm install
```

### 1.4 Codex auf den Ordner richten

Öffne **Codex** auf dem Mac. Wenn Codex nach einem Projektordner fragt:
`~/karlson-website` auswählen.

Falls Codex die App-Variante ist: „Open Folder" → den Ordner
`karlson-website` aus deinem Benutzerverzeichnis öffnen.

---

## 2. Tägliche Arbeit (so machst du jede Änderung)

### 2.1 Aktuellsten Stand holen

Bevor du etwas änderst, hol dir den neuesten Stand:

```bash
cd ~/karlson-website
git pull
```

### 2.2 Codex auftragen was du willst

Sag Codex was du ändern willst. Beispiele:

- „Trag einen neuen Termin am 15. August in Ketzin, 19 Uhr ein"
- „Auf der Über-Seite den letzten Absatz neu schreiben: ..."
- „Tausch das Bild im Hero gegen das neue Foto, das ich gerade in
  `public/karlson/` reingelegt habe"

Codex ändert die Dateien direkt.

### 2.3 Lokal anschauen (optional aber empfohlen)

```bash
npm run dev
```
Öffne im Browser `http://localhost:3000` und schau ob alles passt.
Stoppen: `Ctrl + C` im Terminal.

### 2.4 Veröffentlichen

```bash
git add .
git commit -m "kurz beschreiben was du geändert hast"
git push
```

Nach 1 bis 2 Minuten ist die Änderung live auf
`https://karlson-solo-orchester.de`.

---

## 3. Codex-Startprompt (beim ersten Mal in Codex einfügen)

Kopier diesen Block in Codex am Anfang einer neuen Session:

```
Du arbeitest am Projekt "karlson-website" auf meinem Mac in ~/karlson-website.

Stack: Next.js 16 (App Router), TypeScript, Tailwind v4.
Die Seite ist ein statischer Export (next.config.ts: output "export") und wird
von Cloudflare ausgeliefert.
Live: https://karlson-solo-orchester.de

Wichtige Regeln:
- Arbeite immer im Ordner ~/karlson-website.
- Vor jeder Änderung: zuerst `git pull` ausführen.
- Termine, Social-Links und ähnliche Inhalte liegen in app/data.ts.
- Bilder gehören nach public/karlson/.
- Seitentexte liegen in app/<seitenname>/page.tsx.
- Nach Änderungen: `npm run dev` läuft lassen, ich schaue im Browser ob es passt.
- Wenn ich OK gebe: `git add . && git commit -m "..." && git push`.
- Niemals direkt deployen. Keine "vercel"- und keine "wrangler"-Befehle. Nur git push.
- Bilder klein halten: nichts über 400 Pixel Kantenlänge und nichts über 200 KB
  in public/karlson/ ablegen, sonst wird die Seite langsam.
- Wenn unklar: kurz nachfragen statt raten.

Deployt automatisch nach 1 bis 2 Minuten auf Cloudflare, sobald gepusht wurde.
```

---

## 4. Typische Aufgaben

### Termin ergänzen
Sag Codex: „Neuer Termin am [Datum], [Ort], [Uhrzeit], [öffentlich/privat]".
Codex trägt es in `app/data.ts` ein.

### Bild austauschen
1. Neues Bild in `~/karlson-website/public/karlson/` ablegen
2. Codex sagen: „Tausch das Bild XY auf der Startseite gegen `bildname.jpg`"

### Text ändern
Codex sagen: „Auf der Seite /ueber-karlson den zweiten Absatz neu
schreiben: [neuer Text]".

### Termin als „vergangen" markieren / entfernen
Codex sagen: „Termin vom [Datum] aus der Liste entfernen". Codex passt
`app/data.ts` an.

---

## 5. Wenn was schiefgeht

**„Permission denied" beim Push:**
GitHub-Login abgelaufen. Im Terminal: `gh auth login` nochmal durchlaufen.

**„Merge conflict" beim Pull:**
Codex fragen: „Es gibt einen Merge-Konflikt, bitte löse ihn." Im Zweifel
Frank kurz anrufen.

**Seite sieht nach Push komisch aus:**
Im Terminal `git revert HEAD`, dann `git push`. Damit ist die letzte Änderung
zurückgenommen und die Seite ist wieder wie vorher. Danach Frank anrufen.

**Änderung ist nach 5 Minuten noch nicht zu sehen:**
Erst mit `Cmd + Shift + R` neu laden, das umgeht den Browser-Zwischenspeicher.
Zweitens prüfen, ob der Push wirklich durchgegangen ist:

```bash
git status
```
Steht dort „Your branch is up to date with 'origin/main'", ist alles
hochgeladen und die Veröffentlichung läuft bei Frank. Steht dort „ahead of
'origin/main'", fehlt noch ein `git push`.

Ist beides in Ordnung und die Seite trotzdem alt: Frank anrufen. Die
Veröffentlichung läuft über seinen Zugang, dort kann er nachsehen, woran es
hängt. Du brauchst dafür keinen eigenen Zugang.

**Codex sagt etwas, das du nicht verstehst:**
Bitte ihn: „Erklär mir das so, als ob ich kein Programmierer bin."

---

## 6. Was du NICHT machen sollst

- Keine direkten Änderungen auf GitHub.com im Browser (außer Frank sagt's).
- Keinen `vercel`- und keinen `wrangler`-Befehl im Terminal.
- Nicht `git push --force` benutzen.
- Keine Dateien in `.next/`, `out/` oder `node_modules/` anfassen.
- **Keine Passwörter, Codes oder Zugangsdaten in einen KI-Chat tippen.** Weder
  bei Codex noch sonst wo. Wenn ein Programm eine Anmeldung braucht, machst du
  die selbst im Browser oder rufst Frank an.
