/**
 * Holt fuer jedes Video aus `app/data.ts` das Vorschaubild von YouTube und
 * legt es unter `public/karlson/video/<id>.jpg` ab.
 *
 * Warum ueberhaupt lokal: die Seite verspricht in der Datenschutzerklaerung,
 * dass ohne Klick nichts an YouTube geht. Ein Vorschaubild direkt von
 * `i.ytimg.com` waere genau so eine Uebertragung — die IP-Adresse jedes
 * Besuchers ginge beim blossen Seitenaufruf an Google, ohne dass er etwas
 * angeklickt hat. Deshalb liegt das Bild im eigenen Verzeichnis und wird
 * mitcommittet.
 *
 * Aufruf:  npm run video:vorschau
 *
 * Das Skript laedt nur, was fehlt. Ein vorhandenes Bild wird nicht ersetzt —
 * so ueberschreibt ein Lauf kein Vorschaubild, das jemand bewusst durch ein
 * eigenes Foto ausgetauscht hat. Neu holen: Datei loeschen, Skript laufen
 * lassen.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const WURZEL = process.cwd();
const ZIEL_ORDNER = join(WURZEL, "public", "karlson", "video");
const DATEN = join(WURZEL, "app", "data.ts");

/**
 * Video-IDs aus data.ts lesen.
 *
 * Bewusst per Textsuche statt Import: data.ts ist TypeScript, und dieses Skript
 * soll ohne Buildschritt laufen — auch bei Karlson, der nur `npm run` kennt.
 */
function idsAusDaten() {
  const inhalt = readFileSync(DATEN, "utf8");
  const block = inhalt.match(/export const youtubeLinks = \[([\s\S]*?)\n\];/);
  if (!block) {
    console.error(
      "In app/data.ts wurde `export const youtubeLinks = [ ... ];` nicht gefunden.\n" +
        "Wurde der Name geaendert? Dann muss dieses Skript mitgeaendert werden.",
    );
    process.exit(2);
  }
  const ids = [...block[1].matchAll(/id:\s*["']([\w-]{6,})["']/g)].map((m) => m[1]);
  if (ids.length === 0) {
    console.error("Keine Video-IDs in youtubeLinks gefunden.");
    process.exit(2);
  }
  return ids;
}

/**
 * YouTube legt nicht fuer jedes Video jede Groesse an. `maxresdefault` gibt es
 * nur, wenn das Original hoch genug aufgeloest war — deshalb der Reihe nach
 * absteigend probieren. Eine fehlende Groesse antwortet mit 404 und einem
 * winzigen Platzhalterbild, darum zaehlt zusaetzlich die Dateigroesse.
 */
const GROESSEN = ["maxresdefault", "sddefault", "hqdefault"];

async function holen(id) {
  for (const groesse of GROESSEN) {
    const url = `https://i.ytimg.com/vi/${id}/${groesse}.jpg`;
    let antwort;
    try {
      antwort = await fetch(url);
    } catch (fehler) {
      console.error(`  ${id}: Netzwerkfehler bei ${groesse} — ${fehler.message}`);
      continue;
    }
    if (!antwort.ok) continue;
    const daten = Buffer.from(await antwort.arrayBuffer());
    // Der 404-Platzhalter von YouTube ist rund 1 KB gross.
    if (daten.length < 8000) continue;
    return { daten, groesse };
  }
  return null;
}

mkdirSync(ZIEL_ORDNER, { recursive: true });

const ids = idsAusDaten();
console.log(`${ids.length} Video(s) in app/data.ts.\n`);

let geholt = 0;
let vorhanden = 0;
let fehlend = 0;

for (const id of ids) {
  const ziel = join(ZIEL_ORDNER, `${id}.jpg`);
  if (existsSync(ziel)) {
    console.log(`  ${id}: Vorschaubild liegt schon da`);
    vorhanden++;
    continue;
  }
  const treffer = await holen(id);
  if (!treffer) {
    console.error(
      `  ${id}: KEIN Vorschaubild zu holen.\n` +
        "     Moegliche Gruende: die ID stimmt nicht, das Video ist privat oder geloescht.\n" +
        "     Pruefen: https://www.youtube.com/watch?v=" + id,
    );
    fehlend++;
    continue;
  }
  writeFileSync(ziel, treffer.daten);
  console.log(
    `  ${id}: geholt (${treffer.groesse}, ${Math.round(treffer.daten.length / 1024)} KB)`,
  );
  geholt++;
}

console.log(
  `\nNeu geholt: ${geholt} · schon vorhanden: ${vorhanden} · fehlgeschlagen: ${fehlend}`,
);

if (geholt > 0) {
  console.log(
    "\nNicht vergessen: die neuen Bilder gehoeren mit in den Commit, sonst\n" +
      "fehlen sie auf der veroeffentlichten Seite.",
  );
}

// Ein fehlendes Vorschaubild ist kein Grund, den Build zu stoppen — die Karte
// zeigt dann eine leere Flaeche statt eines Bildes von YouTube. Sichtbar
// gemeldet wird es trotzdem.
process.exit(fehlend > 0 ? 1 : 0);
