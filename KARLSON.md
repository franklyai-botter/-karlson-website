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

### 1.4 Bildprüfung einschalten

```bash
cd ~/karlson-website
npm run hooks
```

Das musst du **einmal** machen. Danach schaut der Rechner bei jedem Hochladen
kurz auf neue Bilder und meldet sich, wenn etwas nicht passt: zu große Dateien,
das HEIC-Format vom iPhone, oder GPS-Koordinaten im Bild.

Der letzte Punkt ist der wichtigste. Handyfotos speichern normalerweise den
Ort, an dem sie aufgenommen wurden. Bei einer Privatfeier stünde damit die
Adresse deines Kunden im Internet, für jeden auslesbar. Der Rechner findet das
und bricht ab, bevor das Bild hochgeht.

Alle Bilder auf einmal prüfen, ohne etwas hochzuladen:

```bash
npm run bilder
```

### 1.5 Codex auf den Ordner richten

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
- Bilder: rund 1200 bis 1800 Pixel breit ablegen, Dateigröße möglichst unter
  500 KB, auf keinen Fall über 1 MB. Nicht kleiner als 1200 Pixel — die
  Webseite rechnet sich die kleinen Fassungen selbst aus (`npm run bilder:webp`),
  kann aber ein zu kleines Bild nicht wieder vergrößern, und in der
  Großansicht der Galerie sähe es dann unscharf aus.
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
2. Im Terminal einmal `npm run bilder:webp` ausführen.
   Das erzeugt kleinere Fassungen des Bildes fürs Handy. Ohne diesen Schritt
   lädt die Seite unnötig lange — kaputt ist dann nichts, nur langsam.
3. Codex sagen: „Tausch das Bild XY auf der Startseite gegen `bildname.jpg`"

Wenn du Schritt 2 vergisst, sagt dir das beim Commit von allein Bescheid.

### Neues Foto in die Galerie

Die Galerie auf **Eindrücke** liest den Ordner selbst aus. Du musst also nichts
eintragen und Codex nichts sagen:

1. Foto als `foto-45.jpg` (nächste freie Nummer) in
   `public/karlson/gallery-full/` legen
2. `npm run bilder:webp`
3. `git add . && git commit -m "neues Foto" && git push`

Seit dem 28.08. kann man die Bilder **anklicken** — dann gehen sie groß auf und
sind vollständig zu sehen. Vorher war jedes Bild in der Übersicht beschnitten
und ein Klick tat gar nichts. Das war Karins Hinweis, er stimmte.

Damit die Großansicht etwas taugt, sollte das Foto mindestens 1200 Pixel breit
sein. Bilder direkt vom Handy oder aus der Kamera sind das ohnehin.

### Text ändern
Codex sagen: „Auf der Seite /ueber-karlson den zweiten Absatz neu
schreiben: [neuer Text]".

### Ein Video auf die Seite bringen

Kurze Antwort auf deine Frage vom 26.08.: **Die Videodatei selbst kommt nicht
auf die Webseite. Du lädst sie zu YouTube hoch, und die Webseite holt sie sich
von dort.** Komprimieren musst du nichts — das macht YouTube.

Warum nicht direkt: Der Server, der deine Seite ausliefert, nimmt pro Datei
höchstens **25 MB**. Ein Video von fünf Minuten hat in ordentlicher Qualität
leicht 100 MB und mehr. Und alles, was einmal im Projektordner landet, bleibt
dort dauerhaft gespeichert — auch wenn du es später löschst. Bei ein paar
Videos wäre der Ordner irgendwann so groß, dass das Herunterladen bei dir
minutenlang dauert.

YouTube kostet dich dabei nichts und übernimmt die ganze Arbeit: es rechnet das
Video in verschiedene Größen um, damit es auf dem Handy genauso läuft wie am
großen Bildschirm.

**Wichtig, und neu seit dem 28.08.:** Die Videos laufen jetzt **auf deiner
Seite**. Wer draufklickt, bleibt bei dir und landet nicht mehr bei YouTube in
deren Vorschlägen. Vorher war das anders.

So gehst du vor:

1. **Video bei YouTube hochladen**, auf deinen Kanal `@karlikarlson1967`.
   Sichtbarkeit auf **„Nicht gelistet"** oder **„Öffentlich"** stellen — bei
   „Privat" kann die Webseite es nicht zeigen.
2. **Die Video-Kennung abschreiben.** Die steht in der Adresse hinter `v=`:
   `https://www.youtube.com/watch?v=`**`c-FGXQMpaXw`** — der fett gedruckte
   Teil ist gemeint.
3. **Codex sagen:** „Trag ein neues Video in `app/data.ts` bei `youtubeLinks`
   ein. Kennung: `<die Kennung>`, Titel: `<wie das Lied heißt>`, Zusatz:
   `<z. B. Live beim Fischerfest 2026>`."
4. **Im Terminal einmal:**
   ```bash
   npm run video:vorschau
   ```
   Das holt das Vorschaubild von YouTube und legt es bei dir ab. Ohne diesen
   Schritt bleibt die Fläche auf der Seite grau.
5. **Wie immer hochladen:**
   ```bash
   git add .
   git commit -m "neues Video: <Titel>"
   git push
   ```

Das Vorschaubild muss deshalb bei dir liegen, weil auf der Seite steht, dass
ohne Klick nichts an Google übertragen wird. Käme das Bild direkt von YouTube,
wäre das eine Übertragung — und die Aussage auf der Datenschutzseite wäre
falsch.

**Damit Leute von YouTube auch zu dir finden:** Trag deine Adresse
`https://karlson-solo-orchester.de` bei YouTube selbst ein — einmal unter
*Kanal anpassen → Basisinfos → Links*, und bei jedem Video oben in die
Beschreibung. Das kann nur über deinen YouTube-Zugang gemacht werden, nicht
über die Webseite.

**Wenn du gar nicht bei YouTube hochladen willst:** ruf Frank an. Es gibt
Alternativen, die brauchen aber eine Einrichtung und kosten je nach Menge
etwas.

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
- **Den Ordner `worker/` nicht anfassen.** Da läuft das Anfrageformular. Wenn
  daran etwas kaputtgeht, kommen keine Anfragen mehr an, und du siehst es
  nicht auf der Webseite.
- **Keine Passwörter, Codes oder Zugangsdaten in einen KI-Chat tippen.** Weder
  bei Codex noch sonst wo. Wenn ein Programm eine Anmeldung braucht, machst du
  die selbst im Browser oder rufst Frank an. Das gilt auch für die Schlüssel
  vom Mailversand — die stehen nicht im Projekt und sollen da auch nicht rein.

---

## 7. Das Anfrageformular

Auf der Seite **Kontakt & Buchung** gibt es ein Formular, über das Veranstalter
direkt anfragen können. Die Anfrage kommt als **E-Mail in dein Postfach**, und
wenn du auf „Antworten" drückst, geht die Antwort direkt an den Absender.

Für dich ändert sich dadurch nichts an der Arbeitsweise. Wichtig nur:

- Es wird **nichts auf der Webseite gespeichert.** Wenn du eine Anfrage
  löschst, ist sie weg — es gibt keine zweite Liste irgendwo.
- Kommt plötzlich **Werbemüll** über das Formular, ruf Frank an. Dann muss am
  Spam-Schutz nachgestellt werden, das ist nichts, was du selbst machst.
- Kommt **gar nichts mehr** an, obwohl jemand sagt, er habe angefragt: auch
  Frank anrufen. Bitte nicht selbst am Formular herumprobieren.
