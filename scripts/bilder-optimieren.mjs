// Erzeugt WebP-Fassungen der Fotos in mehreren Breiten und schreibt ein
// Manifest, aus dem die Bildkomponente ihr srcset baut.
//
// Warum es das braucht: der statische Export hat keinen Image-Optimizer.
// Ohne diesen Schritt geht jedes Foto in Originalgroesse an jeden Besucher —
// auf /eindruecke/ sind das 44 Dateien und rund 14 MB, fuer Kacheln, die auf
// dem Bildschirm 266 px breit sind.
//
// Aufruf:
//   npm run bilder:webp          nur fehlende/veraltete Fassungen
//   npm run bilder:webp -- --neu alles neu erzeugen
//
// Die Ergebnisse werden **mitcommittet**. Das ist Absicht: dadurch braucht der
// Build bei Cloudflare kein sharp, und Karlsons Veroeffentlichungskette bleibt
// so einfach wie bisher. Legt er ein neues Foto dazu, ohne dieses Skript zu
// laufen, faellt die Bildkomponente auf das Original zurueck — das Bild wird
// dann nur nicht verkleinert, es fehlt nicht.

import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, extname, relative, dirname, basename } from "node:path";
import sharp from "sharp";

const QUELLORDNER = "public/karlson";
const ZIELORDNER = "public/karlson/webp";
const MANIFEST = "app/bilder-manifest.json";

// 400 deckt die Kacheln bei einfacher Aufloesung ab, 800 dieselben auf
// Retina-Displays, 1200 die einspaltige Darstellung auf dem Handy (dort ist
// eine Kachel bis 592 px breit) ebenfalls auf Retina. Mehr braucht es nicht:
// die Seite hat keine Vollbild- oder Zoom-Ansicht.
const BREITEN = [400, 800, 1200];

// 78 statt 80+: bei Fotos ist der Unterschied zu 85 im Blindvergleich nicht
// zu sehen, die Datei aber deutlich kleiner.
const QUALITAET = 78;

// Eigene Breiten fuer einzelne Dateien. Das Logo erscheint im Header mit
// 42 px, im Footer mit 54 px und im Hero mit bis zu 192 px — die 800er und
// 1200er Fassungen der Fotoliste wuerden dort nie gewaehlt und waeren nur
// Ballast im Repo. Es liegt als PNG mit Transparenz vor; WebP kann Alpha,
// die Freistellung bleibt also erhalten.
const EIGENE_BREITEN = new Map([["logo.png", [120, 200, 400]]]);

// logo.jpg (1254x1254, 188 KB) ist seit der Logo-Verkleinerung am 20.08.2026
// nicht mehr eingebunden — weder in einer Komponente noch in den
// strukturierten Daten. Wird nicht mitoptimiert, damit keine Fassungen fuer
// eine ungenutzte Datei entstehen.
const NICHT_ANFASSEN = new Set(["logo.jpg"]);

const allesNeu = process.argv.includes("--neu");

/** Sammelt alle Bilddateien unterhalb von QUELLORDNER, ohne die Zielablage. */
function bilderSammeln(ordner) {
  const gefunden = [];
  for (const eintrag of readdirSync(ordner, { withFileTypes: true })) {
    const pfad = join(ordner, eintrag.name);
    if (eintrag.isDirectory()) {
      if (pfad.replace(/\\/g, "/") === ZIELORDNER) continue;
      gefunden.push(...bilderSammeln(pfad));
      continue;
    }
    const endung = extname(eintrag.name).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(endung)) continue;
    if (NICHT_ANFASSEN.has(eintrag.name)) continue;
    gefunden.push(pfad);
  }
  return gefunden;
}

/** Web-Pfad aus einem Dateipfad unter public/. */
function webPfad(dateipfad) {
  return "/" + relative("public", dateipfad).replace(/\\/g, "/");
}

const quellen = bilderSammeln(QUELLORDNER).sort();
if (quellen.length === 0) {
  console.error(`Keine Bilder in ${QUELLORDNER} gefunden.`);
  process.exit(1);
}

/** @type {Record<string, {pfad: string, breite: number}[]>} */
const manifest = {};
let erzeugt = 0;
let uebersprungen = 0;
let byteQuelle = 0;
let byteKlein = 0;

for (const quelle of quellen) {
  const info = await sharp(quelle).metadata();
  const originalBreite = info.width ?? 0;
  const quellStat = statSync(quelle);
  byteQuelle += quellStat.size;

  const relativZumOrdner = relative(QUELLORDNER, quelle).replace(/\\/g, "/");
  const zielBasis = join(ZIELORDNER, dirname(relativZumOrdner));
  const nameOhneEndung = basename(relativZumOrdner, extname(relativZumOrdner));

  /** @type {{pfad: string, breite: number}[]} */
  const fassungen = [];

  // Nie hochskalieren: eine 1200er Fassung eines 900 px breiten Originals
  // waere groesser als das Original und keinen Deut scharfer.
  const gewuenschteBreiten = EIGENE_BREITEN.get(basename(quelle)) ?? BREITEN;
  const passendeBreiten = gewuenschteBreiten.filter((b) => b <= originalBreite);
  if (passendeBreiten.length === 0 && originalBreite > 0) {
    passendeBreiten.push(originalBreite);
  }

  for (const breite of passendeBreiten) {
    const zieldatei = join(zielBasis, `${nameOhneEndung}-${breite}.webp`);
    mkdirSync(zielBasis, { recursive: true });

    const aktuell =
      !allesNeu &&
      existsSync(zieldatei) &&
      statSync(zieldatei).mtimeMs >= quellStat.mtimeMs;

    if (aktuell) {
      uebersprungen++;
    } else {
      await sharp(quelle)
        .resize({ width: breite, withoutEnlargement: true })
        .webp({ quality: QUALITAET })
        .toFile(zieldatei);
      erzeugt++;
    }

    byteKlein += statSync(zieldatei).size;
    fassungen.push({ pfad: webPfad(zieldatei), breite });
  }

  if (fassungen.length > 0) {
    manifest[webPfad(quelle)] = fassungen;
  }
}

// Sortiert schreiben, damit der Diff bei jedem Lauf vergleichbar bleibt.
const sortiert = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(MANIFEST, JSON.stringify(sortiert, null, 2) + "\n", "utf8");

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1) + " MB";
console.log(`Quellbilder:       ${quellen.length} (${mb(byteQuelle)})`);
console.log(`WebP-Fassungen:    ${erzeugt} neu, ${uebersprungen} unveraendert (${mb(byteKlein)} gesamt)`);
console.log(`Manifest:          ${MANIFEST} mit ${Object.keys(sortiert).length} Eintraegen`);

// Aussagekraeftiger als die Gesamtsumme: was ein Besucher der Galerie
// tatsaechlich statt des Originals laedt.
const kleinste = Object.values(sortiert)
  .map((f) => f[0])
  .filter(Boolean);
if (kleinste.length) {
  let summeKlein = 0;
  for (const f of kleinste) summeKlein += statSync(join("public", f.pfad.slice(1))).size;
  console.log(
    `Galerie-Erstladung: ${mb(byteQuelle)} Originale -> ${mb(summeKlein)} in der 400er Fassung`,
  );
}
