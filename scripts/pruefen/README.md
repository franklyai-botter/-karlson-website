# Frontend-Pruefung

Zwei Stufen. Beide setzen den Exit-Code auf 1, wenn etwas fehlschlaegt, taugen
also als Gate.

| Befehl | Dauer (gemessen gegen live) | Was es abdeckt |
|---|---|---|
| `npm run pruefen:smoke` | ~40 s, 220 Pruefungen | 11 Routen × Desktop/Handy, nur Chromium. Status, Assets, Ueberlauf, JS-Fehler, Bilder, `alt`, genau eine `h1`. |
| `npm run pruefen` | ~20 s, 1578 Pruefungen | Chromium **und WebKit**: Burgermenue, Social-Kacheln, 11 Routen, 14 Breiten mit Kontrast, Hero-Geometrie, CTA, Inline-Links, Formularfelder, Honeypot. |

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
Fehler zaehlen. Derzeit ein Eintrag: WebKit bricht das Nachladen der
Next.js-Navigationsdaten ab (`RSC payload`) und laedt ganze Seiten neu.
Funktional bricht nichts, die Navigation ist auf Apple-Geraeten nur langsamer.

Die Liste wird in beide Richtungen ausgewertet: aufgetretene Ausnahmen stehen
gezaehlt im Bericht, und wenn eine Ausnahme **nicht** mehr auftritt, sagt der
Bericht das auch — dann gehoert der Eintrag raus.
