// Prueft Bilder, die neu nach public/karlson/ dazukommen, bevor sie committed
// werden. Laeuft ohne zusaetzliche Pakete, nur mit Node.
//
// Zwei Klassen von Befunden:
//   FEHLER  -> Commit wird abgebrochen. Etwas ist objektiv falsch.
//   HINWEIS -> Commit laeuft durch, aber es steht sichtbar im Terminal.
//
// Aufruf:
//   node scripts/bilder-pruefen.mjs <datei> [<datei> ...]
//   node scripts/bilder-pruefen.mjs --alle      (prueft alles in public/karlson)

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";

const BILDORDNER = "public/karlson";
const MAX_BYTES_FEHLER = 1_000_000; // 1 MB
// 500 KB und nicht weniger: der vorhandene Bestand liegt zum grossen Teil
// zwischen 300 und 500 KB. Eine Schwelle, die bei fast jedem Bild anschlaegt,
// liest niemand mehr.
const MAX_BYTES_HINWEIS = 500_000;
const MAX_BREITE_HINWEIS = 1800;

// ---------------------------------------------------------------- Hilfsmittel

function istBild(pfad) {
  return [".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".heif", ".gif"]
    .includes(extname(pfad).toLowerCase());
}

/** Liest Breite und Hoehe aus JPEG oder PNG, ohne Bildbibliothek. */
function masse(buf) {
  // PNG: Breite und Hoehe stehen fest im IHDR ab Byte 16
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { breite: buf.readUInt32BE(16), hoehe: buf.readUInt32BE(20) };
  }
  // JPEG: Segmente durchlaufen, bis ein SOF-Marker kommt
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let p = 2;
    while (p < buf.length - 9) {
      if (buf[p] !== 0xff) { p++; continue; }
      const marker = buf[p + 1];
      const laenge = buf.readUInt16BE(p + 2);
      // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15
      const istSOF = marker >= 0xc0 && marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker);
      if (istSOF) {
        return { hoehe: buf.readUInt16BE(p + 5), breite: buf.readUInt16BE(p + 7) };
      }
      p += 2 + laenge;
    }
  }
  return null;
}

/**
 * Sucht im EXIF-Block eines JPEG den GPS-Zeiger (Tag 0x8825).
 * Handyfotos tragen darin die Koordinaten des Aufnahmeorts. Bei einer
 * Privatfeier ist das die Adresse des Kunden.
 */
function hatGpsDaten(buf) {
  if (!(buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8)) return false;

  let p = 2;
  while (p < buf.length - 4) {
    if (buf[p] !== 0xff) { p++; continue; }
    const marker = buf[p + 1];
    if (marker === 0xda) break; // Bilddaten beginnen, EXIF kommt nicht mehr
    const laenge = buf.readUInt16BE(p + 2);
    if (marker === 0xe1) {
      const start = p + 4;
      if (buf.slice(start, start + 6).toString("latin1") === "Exif\0\0") {
        const tiff = start + 6;
        if (tiff + 8 > buf.length) return false;
        const bo = buf.slice(tiff, tiff + 2).toString("latin1");
        const gross = bo === "MM";
        if (bo !== "MM" && bo !== "II") return false;
        const u16 = (o) => (gross ? buf.readUInt16BE(o) : buf.readUInt16LE(o));
        const u32 = (o) => (gross ? buf.readUInt32BE(o) : buf.readUInt32LE(o));

        const ifd0 = tiff + u32(tiff + 4);
        if (ifd0 + 2 > buf.length) return false;
        const anzahl = u16(ifd0);
        for (let i = 0; i < anzahl; i++) {
          const eintrag = ifd0 + 2 + i * 12;
          if (eintrag + 12 > buf.length) break;
          if (u16(eintrag) === 0x8825) return true; // GPS IFD Pointer
        }
        return false;
      }
    }
    p += 2 + laenge;
  }
  return false;
}

// ---------------------------------------------------------------- Pruefung

const argumente = process.argv.slice(2);
let dateien;

if (argumente.includes("--alle")) {
  dateien = [];
  const durchlaufen = (ordner) => {
    for (const eintrag of readdirSync(ordner, { withFileTypes: true })) {
      const pfad = join(ordner, eintrag.name);
      if (eintrag.isDirectory()) durchlaufen(pfad);
      else if (istBild(pfad)) dateien.push(pfad);
    }
  };
  durchlaufen(BILDORDNER);
} else {
  dateien = argumente.filter(istBild);
}

if (dateien.length === 0) process.exit(0);

const fehler = [];
const hinweise = [];

for (const pfad of dateien) {
  let buf;
  try {
    buf = readFileSync(pfad);
  } catch {
    continue; // gelöscht oder umbenannt
  }
  const name = basename(pfad);
  const kb = Math.round(buf.length / 1024);
  const endung = extname(pfad).toLowerCase();

  if (endung === ".heic" || endung === ".heif") {
    fehler.push(
      `${name}: HEIC-Format. Das zeigen die meisten Browser nicht an.\n` +
      `      So loest du es: Bild in der App "Vorschau" oeffnen, dann\n` +
      `      Datei > Exportieren, Format JPEG.`
    );
    continue;
  }

  if (hatGpsDaten(buf)) {
    fehler.push(
      `${name}: enthaelt GPS-Koordinaten vom Aufnahmeort.\n` +
      `      Bei einer Privatfeier steht damit die Adresse des Kunden im\n` +
      `      Internet, fuer jeden auslesbar.\n` +
      `      So loest du es: Bild in "Vorschau" oeffnen, Werkzeuge >\n` +
      `      Informationen einblenden, Reiter GPS, dann "Ort entfernen".\n` +
      `      Danach speichern. Dauerhaft abschalten: Systemeinstellungen >\n` +
      `      Datenschutz & Sicherheit > Ortungsdienste > Kamera aus.`
    );
    continue;
  }

  if (buf.length > MAX_BYTES_FEHLER) {
    fehler.push(
      `${name}: ${kb} KB. Das ist zu gross fuer eine Webseite.\n` +
      `      Die Seite hat keine automatische Verkleinerung, das Bild geht\n` +
      `      in voller Groesse an jeden Besucher.\n` +
      `      So loest du es: in "Vorschau" oeffnen, Werkzeuge > Groesse\n` +
      `      korrigieren, Breite 1200 Pixel.`
    );
    continue;
  }

  const m = masse(buf);
  if (buf.length > MAX_BYTES_HINWEIS) {
    hinweise.push(`${name}: ${kb} KB. Unter 300 KB wuerde die Seite schneller laden.`);
  }
  if (m && m.breite > MAX_BREITE_HINWEIS) {
    hinweise.push(`${name}: ${m.breite} Pixel breit. Mehr als 1800 bringt nichts.`);
  }
}

const strich = "-".repeat(68);

if (hinweise.length > 0) {
  console.log(`\n${strich}\nHinweise zu den Bildern (der Commit laeuft trotzdem):\n`);
  for (const h of hinweise) console.log(`  - ${h}`);
}

if (fehler.length > 0) {
  console.error(`\n${strich}\nCommit abgebrochen. ${fehler.length} Bild-Problem(e):\n`);
  for (const f of fehler) console.error(`  ! ${f}\n`);
  console.error(
    `${strich}\n` +
    `Wenn du sicher bist, dass es trotzdem so soll, ruf Frank an.\n` +
    `Notfalls geht der Commit mit  git commit --no-verify  durch,\n` +
    `aber dann bitte nur nach Absprache.\n${strich}\n`
  );
  process.exit(1);
}

// Erinnerung, die immer kommt, wenn Bilder dazukommen. Der Rechner kann nicht
// sehen, wer auf dem Bild ist, deshalb muss der Mensch hier kurz nachdenken.
console.log(`
${strich}
${dateien.length} neue${dateien.length === 1 ? "s" : ""} Bild${dateien.length === 1 ? "" : "er"}. Kurz vor dem Hochladen pruefen:

  1. Ist ausser dir noch jemand deutlich erkennbar drauf?
  2. Sind Kinder drauf, deren Gesicht man sieht?
  3. Wenn ja zu 1 oder 2: haben die Leute gesagt, dass das online darf?
     Bei Kindern muessen die Eltern zustimmen.

Ein Bild von einem oeffentlichen Fest, auf dem das Fest das Motiv ist, ist in
der Regel unproblematisch. Ein Bild, auf dem eine einzelne Person gross und
erkennbar zu sehen ist, braucht deren Einverstaendnis.

Im Zweifel: Bild weglassen oder Frank fragen. Ein Foto weniger faellt
niemandem auf, ein Foto zu viel schon.
${strich}
`);
