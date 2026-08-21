# Frontend-Pruefung

Zwei Stufen. Beide setzen den Exit-Code auf 1, wenn etwas fehlschlaegt, taugen
also als Gate.

| Befehl | Dauer (gemessen gegen live) | Was es abdeckt |
|---|---|---|
| `npm run pruefen:smoke` | ~40 s, 220 Pruefungen | 11 Routen × Desktop/Handy, nur Chromium. Status, Assets, Ueberlauf, JS-Fehler, Bilder, `alt`, genau eine `h1`. |
| `npm run pruefen` | ~40 s, ~2100 Pruefungen | Chromium **und WebKit**: Burgermenue, Social-Kacheln, 11 Routen, 14 Breiten mit Kontrast, Hero-Geometrie, CTA, Inline-Links, Formularfelder, Checkbox-Zeile, Honeypot, Feldrahmen-Kontrast, Beschriftungen (aria-label, WCAG 2.5.3), Abstaende, Formularverhalten. |

Nach jeder Aenderung Stufe 1. Vor dem Push und nach jeder CSS-Aenderung Stufe 2.

Dass der Vollauf schneller ist als der Smoke-Test, liegt am Smoke-Test: der
scrollt jede Seite durch und wartet auf lazy geladene Bilder. Beide sind schnell
genug, um sie einfach beide laufen zu lassen.

## Warum kein Hook

Beide Stufen pruefen eine **ausgelieferte** Seite. In einem Pre-Commit- oder
Pre-Push-Hook liefe der Test gegen den Stand, der schon live ist — also gegen
alles ausser der Aenderung, die gerade committet wird. Das waere ein gruener
Haken ohne Aussage.

Fuer einen Hook muesste erst gebaut und `wrangler dev` gestartet werden. Das
dauert deutlich laenger als die 10 bis 15 Sekunden, die ein Hook-Timeout
hergibt. Deshalb: von Hand, mit `BASIS` auf das, was man wirklich pruefen will.

## Playwright ist absichtlich keine Dependency

Waere Playwright in der `package.json`, zoege **jeder Cloudflare-Build einen
kompletten Browser mit** — fuer eine Seite, die als statisches Asset
ausgeliefert wird. Die Skripte suchen sich zur Laufzeit eine vorhandene
Installation: erst `PLAYWRIGHT_ROOT`, dann das Repo und alle Verzeichnisse
darueber, dann die Nachbarordner.

Findet sich keine, brechen sie mit **Exit-Code 2** und einer Anleitung ab. Das
ist bewusst kein stiller Erfolg: ein fehlender Browser heisst "ungeprueft",
nicht "bestanden".

Einmalig einrichten:

```bash
npm i -g playwright && npx playwright install chromium webkit
```

Oder den Pfad direkt angeben:

```bash
PLAYWRIGHT_ROOT=../Firtst-Try npm run pruefen
```

## Umgebungsvariablen

| Variable | Default | Wirkung |
|---|---|---|
| `BASIS` | `https://karlson-solo-orchester.de` | Gegen welche Adresse geprueft wird. |
| `FORMULAR` | `1` live, `0` bei localhost | Ob das Anfrageformular eingeschaltet **erwartet** wird. |
| `NUR_CHROMIUM` | aus | WebKit ueberspringen. Halbiert die Zeit und die Aussage. |
| `SCHUSS_ORDNER` | aus | Nur Smoke: Screenshots von `/` und `/eindruecke/` ablegen. |
| `PLAYWRIGHT_ROOT` | aus | Ordner, in dessen `node_modules` Playwright liegt. |

Gegen einen lokalen Build:

```bash
# wrangler dev MUSS vorher beendet sein, sonst bricht der Build mit EBUSY ab
# und man prueft unbemerkt gegen einen Mischstand.
npm run build && npx wrangler dev
BASIS=http://127.0.0.1:8788 npm run pruefen
```

`FORMULAR` muss dabei zum Zustand passen. Ein lokaler Build ohne
`NEXT_PUBLIC_FORMULAR_AKTIV=1` hat das Formular aus — das ist der Default bei
localhost. Ist es lokal an, dann `FORMULAR=1` setzen.

## Drei Regeln, an denen die Tests haengen

Der Vorgaenger dieser Skripte meldete fuer die Startseite "0 Befunde", waehrend
die Hero-Spalte 152 px ueber den Rand ragte — unsichtbar, weil `.hero`
`overflow: hidden` hat. Ein Review fand 30 Befunde, 12 davon Blocker. Daraus:

1. **Jeder Test muss fehlschlagen koennen.** Der alte Escape-Test drueckte
   Escape auf ein bereits geschlossenes Menue — man haette den Handler loeschen
   koennen, der Test waere gruen geblieben. Jeder Schliessmechanismus bekommt
   jetzt einen eigenen, frisch geoeffneten Ausgangszustand.
2. **Fehlender Selektor = Fehler, nicht Erfolg.** Zu jedem Selektor gehoert
   eine Mindestanzahl. Waere `.social-button` umbenannt worden, haette der alte
   Test null Elemente gefunden und "sauber" gemeldet.
3. **WebKit ist Pflicht.** Das CSS nutzt `env(safe-area-inset-*)`, `100svh` und
   `-webkit-overflow-scrolling`; der gemeldete Fehler trat auf einem iPhone
   auf. Alles in Chromium zu pruefen und "iPhone" darueber zu schreiben deckt
   ihn nicht ab. Laeuft WebKit nicht, ist das ein Fehler im Lauf.

Und: `document.documentElement.scrollWidth` allein reicht nicht. `overflow:
hidden` verbirgt Ueberlaeufe genau dort, wo sie wehtun — innere Container
werden mitgemessen.

Eine einzige Ausnahme davon: Elemente, die **vollstaendig ausserhalb des
Viewports** liegen (`right <= 0` oder `left >= vw`), werden uebersprungen. Das
ist die uebliche Versteck-Technik, und der Honeypot nutzt sie — `left:-9999px`
in einer 1px-Huelle, sein `<label>` laeuft dadurch zwangslaeufig ueber. Die
Ausnahme prueft die Lage im Viewport und **nicht**, ob ein Vorfahre clippt;
sonst waere der Hero-Fall wieder unsichtbar. Gegengeprueft mit injiziertem
`padding-right: 3000px` auf `.hero-content`: wird weiterhin gemeldet.

## Checkbox-Zeile

Bei mehrzeiligem Zustimmungstext muss das Kästchen neben der **ersten** Zeile
stehen (Versatz <= Zeilenhöhe), nicht in der Mitte des Absatzes. Die Prüfung
existiert, weil genau das kaputt war: `label:has(input[type="checkbox"])` hat die
Spezifität (0,1,2) — `:has()` nimmt die Spezifität seines Arguments an — und
schlug damit `.checkbox-zeile` (0,1,0) samt dessen `align-items: start`.

Auf dem Desktop war das unsichtbar, weil der Satz in eine Zeile passt. Bei
320 px brach er auf sechs Zeilen um, und das Kästchen hing 56 px tiefer, neben
Zeile 3. Behoben durch `:where()` um die Grundregel, die sie
spezifitätsfrei (0,0,1) macht.

## Kontrast wird mit Alpha gerechnet

Farben werden **komponiert**, nicht direkt verglichen: `rgba(91,53,31,0.72)` auf
beigem Grund ergibt 4,12:1, nicht die 8,26:1 des vollen Brauntons. Die
Hintergrundkette wird im Browser bis zur ersten deckenden Farbe gesammelt
(`HG_KETTE` in `lib.mjs`) und in Node ueber Weiss zusammengerechnet.

Das ist keine Feinheit, sondern der Unterschied zwischen einer Pruefung, die
etwas findet, und einer, die nur so aussieht: die erste Fassung verwarf den
Alphakanal und haette weder den Befund am Markenzusatz (4,12:1) noch den am
Feldrahmen (1,33:1) je gemeldet. Aufgefallen ist das erst in der Gegenprobe —
die alten Farben zurueckinjiziert, und die Pruefung blieb gruen.

## Beschriftungen

Zwei Regeln, beide auf allen 11 Routen:

- **`aria-label` muss wirken.** Auf einem `<div>`/`<span>`/`<p>` ohne `role`
  gibt es kein Screenreader es aus. Zwei solche Faelle gab es (Header-Social,
  Hero-Social), beide sind jetzt `<nav>`.
- **WCAG 2.5.3, Label in Name.** Enthaelt ein Bedienelement sichtbaren Text,
  muss der zugaengliche Name diesen Text enthalten — sonst trifft
  Sprachsteuerung ihn nicht. Gemessen wird mit `innerText`, nicht
  `textContent`: der Markenlink enthaelt `<strong>` und `<small>` als Bloecke,
  die in `textContent` ohne Leerzeichen aneinanderstossen
  ("KarlsonOne-Man-Band") — dagegen kann kein Label bestehen.

## Formularverhalten

Bei leerem Absenden: mindestens 6 Meldungen, mindestens 6 Felder mit
`aria-invalid`, jede Meldung per `aria-describedby` einem Feld zugeordnet, Fokus
im ersten fehlerhaften Feld — und **kein** Request an `/api/contact`.

Zwei Zustaende brauchen Request-Manipulation, laufen dafuer ohne dass eine Mail
rausgeht:

- **Turnstile-Fehler:** `challenges.cloudflare.com` wird blockiert, danach muss
  die Meldung mit `role="alert"` im Formular stehen. Laeuft nur, wenn ein
  Sitekey gesetzt ist — also live, nicht gegen einen lokalen Build.
- **Fokus nach Erfolg:** die Antwort auf `/api/contact` wird mit `{ok:true}`
  beantwortet, ohne den Worker zu erreichen. Danach muss der Fokus im
  Erfolgspanel liegen. Laeuft nur **ohne** Turnstile, weil sich das Absenden
  mit aktivem Widget nicht ohne echtes Token durchspielen laesst — also gegen
  einen lokalen Build.

Beide melden im Bericht, wenn sie uebersprungen wurden. Ein stiller Skip waere
genau das, was dieser Harness vermeiden soll.

## Honeypot

Drei eigene Pruefungen auf `/buchung/`, weil hier ein CSS-Versehen Geld kostet:
Der Worker antwortet auf einen gefuellten Honeypot mit `{ok:true}` und **200,
schickt aber keine Mail**. Wuerde das Feld sichtbar, fuellt ein Mensch es aus,
sieht die Erfolgsmeldung — und seine Buchungsanfrage ist weg, ohne Spur.

Geprueft wird deshalb, dass `input[name="webseite"]` existiert, ausserhalb des
Viewports oder unsichtbar liegt, die Huelle `aria-hidden="true"` traegt und
`tabIndex` `-1` ist. Gegenprobe gelaufen: zeigt der Selektor auf ein echtes
Feld, schlagen alle drei fehl.

## Bekannte Meldungen

In `lib.mjs` steht eine Liste dokumentierter Konsolenmeldungen, die nicht als
Fehler zaehlen. Gematcht wird gegen den Text **und** die Quelle — "Failed to load
resource ... 404" nennt die Adresse nur in `location.url`. Zwei Eintraege:

- **WebKit, `RSC payload`:** Safari bricht das Nachladen der
  Next.js-Navigationsdaten ab und laedt ganze Seiten neu. Funktional bricht
  nichts, die Navigation ist auf Apple-Geraeten nur langsamer. Offen.
- **`nurLokal`, `__next.*__PAGE__.txt`:** unter `wrangler dev` fragt Next auf
  `/buchung/` den RSC-Payload mit **Punkt** an
  (`__next.buchung.__PAGE__.txt`), auf der Platte liegt er mit **Schraegstrich**
  (`__next.buchung/__PAGE__.txt`). Die lokale Asset-Auslieferung loest das nicht
  auf, die echte Workers-Runtime schon — live gemessen 0 Fehler. Warum sich
  beide unterscheiden, ist nicht abschliessend geklaert.

`nurLokal`-Ausnahmen gelten **nur** bei lokalem `BASIS`. Was live auftritt,
bleibt ein Befund — sonst waere die Ausnahme ein Weg, einen echten Fehler
wegzudefinieren.

Die Liste wird in beide Richtungen ausgewertet: aufgetretene Ausnahmen stehen
gezaehlt im Bericht, und wenn eine Ausnahme **nicht** mehr auftritt, sagt der
Bericht das auch — dann gehoert der Eintrag raus.
