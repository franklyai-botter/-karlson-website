/**
 * Gemeinsame Bausteine der Frontend-Pruefung.
 *
 * Playwright ist hier bewusst KEINE Dependency des Projekts. Waere es eine,
 * zoege jeder Cloudflare-Build einen kompletten Browser mit — fuer eine Seite,
 * die als statisches Asset ausgeliefert wird. Stattdessen wird eine vorhandene
 * Installation zur Laufzeit gesucht (siehe playwrightLaden).
 */
import { createRequire } from "node:module";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Die 11 Routen des statischen Exports. Vollstaendig, nicht als Auswahl. */
export const ROUTEN = [
  "/",
  "/programme/",
  "/repertoire/",
  "/termine/",
  "/eindruecke/",
  "/ueber-karlson/",
  "/veranstalter/",
  "/buchung/",
  "/impressum/",
  "/datenschutz/",
  "/agb/",
];

export const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

export const BASIS = (process.env.BASIS ?? "https://karlson-solo-orchester.de").replace(/\/$/, "");

/**
 * Ist auf der geprueften Fassung das Anfrageformular eingeschaltet?
 *
 * Das muss explizit bekannt sein, sonst prueft sich das Skript selbst blind:
 * "keine Formularfelder gefunden" darf nicht als Erfolg durchgehen. Deshalb
 * wird in BEIDE Richtungen geprueft — bei FORMULAR=1 muessen Felder da sein,
 * bei FORMULAR=0 muessen sie fehlen.
 *
 * Default: live ist das Formular an, ein lokaler Build ohne
 * NEXT_PUBLIC_FORMULAR_AKTIV hat es aus.
 */
const istLokal = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])/.test(BASIS);
export const FORMULAR_AKTIV = process.env.FORMULAR
  ? process.env.FORMULAR === "1"
  : !istLokal;

export const EIGENER_HOST = new URL(BASIS).host;

/**
 * Konsolenmeldungen, die bekannt und dokumentiert sind. Sie gelten nicht als
 * Fehler, werden aber gezaehlt und am Ende ausgewiesen — und wenn eine davon
 * nicht mehr auftritt, steht das ebenfalls im Bericht, damit der Eintrag hier
 * wieder rausfliegen kann.
 *
 * Nichts hier eintragen, was nicht im Vault begruendet ist.
 */
export const BEKANNTE_MELDUNGEN = [
  {
    muster: /RSC payload|access control checks/i,
    nurEngine: "webkit",
    grund:
      "WebKit bricht das Nachladen der Next.js-Navigationsdaten ab und laedt " +
      "ganze Seiten neu. Funktional bricht nichts, die Navigation ist auf " +
      "Apple-Geraeten nur langsamer. Offen, nicht behoben (Stand 21.08.2026).",
  },
];

// ------------------------------------------------------------ Playwright holen

/** Wurzeln, unter denen eine Playwright-Installation liegen koennte. */
function kandidatenWurzeln() {
  const wurzeln = [];
  if (process.env.PLAYWRIGHT_ROOT) wurzeln.push(resolve(process.env.PLAYWRIGHT_ROOT));

  // Das Repo selbst und alle Verzeichnisse darueber.
  let dir = REPO;
  for (;;) {
    wurzeln.push(dir);
    const oben = dirname(dir);
    if (oben === dir) break;
    dir = oben;
  }

  // Geschwisterprojekte: bei Frank liegt Playwright in einem Nachbarordner
  // unter "First Try". Gesucht statt hartkodiert, damit ein Umbenennen dort
  // die Pruefung hier nicht lahmlegt.
  try {
    for (const eintrag of readdirSync(dirname(REPO), { withFileTypes: true })) {
      if (eintrag.isDirectory()) wurzeln.push(join(dirname(REPO), eintrag.name));
    }
  } catch {
    // Elternverzeichnis nicht lesbar — dann eben ohne Geschwister.
  }

  return [...new Set(wurzeln)];
}

/**
 * Laedt playwright (oder playwright-core) aus einer vorhandenen Installation.
 * Findet sich keine, bricht der Aufrufer mit Exit-Code 2 ab — ein fehlender
 * Browser ist "ungeprueft", nicht "bestanden".
 */
export function playwrightLaden() {
  for (const wurzel of kandidatenWurzeln()) {
    for (const paket of ["playwright", "playwright-core"]) {
      const ziel = join(wurzel, "node_modules", paket, "package.json");
      if (!existsSync(ziel)) continue;
      try {
        const require = createRequire(pathToFileURL(join(wurzel, "package.json")));
        const pw = require(paket);
        if (pw?.chromium) return { pw, quelle: join(wurzel, "node_modules", paket) };
      } catch {
        // Naechster Kandidat.
      }
    }
  }
  return null;
}

/** Playwright laden oder mit klarer Anleitung abbrechen. */
export function playwrightOderAbbruch() {
  const gefunden = playwrightLaden();
  if (gefunden) {
    console.log(`Playwright: ${gefunden.quelle}`);
    return gefunden.pw;
  }
  console.error(
    "\nPlaywright nicht gefunden — die Pruefung wurde NICHT ausgefuehrt.\n\n" +
      "Playwright ist absichtlich keine Dependency dieses Projekts: sonst\n" +
      "zieht jeder Cloudflare-Build einen Browser mit. Einmalig einrichten:\n\n" +
      "  npm i -g playwright && npx playwright install chromium webkit\n\n" +
      "oder in einem beliebigen Nachbarordner installieren, oder den Pfad\n" +
      "direkt angeben:\n\n" +
      "  PLAYWRIGHT_ROOT=<ordner-mit-node_modules> npm run pruefen\n",
  );
  process.exit(2);
}

// ------------------------------------------------------------ Buchfuehrung

export function neuesProtokoll() {
  return {
    fehler: [],
    bestanden: 0,
    bekannt: [], // aufgetretene dokumentierte Ausnahmen
    fremd: [], // Meldungen aus Fremd-Origins (Turnstile & Co.)
    hinweise: [],
    engines: new Set(),
  };
}

/**
 * Eine Pruefung verbuchen. `detail` beschreibt den Fehlerfall so, dass man ihn
 * ohne den Quelltext versteht — inklusive Messwert.
 */
export function pruefe(p, bedingung, bezeichnung, detail) {
  if (bedingung) {
    p.bestanden++;
  } else {
    p.fehler.push(`${bezeichnung} — ${detail}`);
    console.log(`  x ${bezeichnung}: ${detail}`);
  }
}

/**
 * Trennt echte Konsolenfehler von dem, was nicht in unserer Hand liegt.
 *
 * Drei Toepfe:
 *   - Fremd-Origin (z. B. das Turnstile-Widget von challenges.cloudflare.com):
 *     kein Fehler, aber gezaehlt und im Bericht mit Host ausgewiesen. Fremden
 *     Code koennen wir nicht reparieren; stillschweigend verschwinden darf er
 *     trotzdem nicht.
 *   - dokumentierte Ausnahme aus BEKANNTE_MELDUNGEN: kein Fehler, gezaehlt.
 *   - alles andere: Fehler.
 *
 * `meldungen` sind Objekte { text, url }. url ist leer bei pageerror — das
 * gilt als eigener Code, also streng.
 */
export function konsoleAuswerten(p, engine, meldungen) {
  const unbekannt = [];
  for (const { text, url } of meldungen) {
    let host = "";
    try {
      if (url) host = new URL(url).host;
    } catch {
      // Keine brauchbare URL — als eigen behandeln.
    }
    if (host && host !== EIGENER_HOST) {
      p.fremd.push({ engine, host, text });
      continue;
    }
    const treffer = BEKANNTE_MELDUNGEN.find(
      (b) => b.muster.test(text) && (!b.nurEngine || b.nurEngine === engine),
    );
    if (treffer) p.bekannt.push({ engine, text, grund: treffer.grund });
    else unbekannt.push(text);
  }
  return unbekannt;
}

/**
 * Sammelt Konsolenfehler einer Seite als { text, url } — die Herkunft
 * entscheidet spaeter, ob es ein eigener Fehler ist.
 */
export function fehlerSammler(seite, topf) {
  seite.on("console", (m) => {
    if (m.type() === "error") topf.push({ text: m.text().slice(0, 140), url: m.location()?.url ?? "" });
  });
  seite.on("pageerror", (e) => topf.push({ text: "pageerror: " + e.message.slice(0, 140), url: "" }));
}

// ------------------------------------------------------------ WCAG-Kontrast

/** Relative Luminanz nach WCAG 2.x */
function luminanz([r, g, b]) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function kontrast(a, b) {
  const l1 = luminanz(a);
  const l2 = luminanz(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function rgb(str) {
  const m = String(str).match(/(\d+(?:\.\d+)?)/g);
  return m ? m.slice(0, 3).map(Number) : null;
}

// ------------------------------------------------------------ Bericht

/** Schlussbericht ausgeben und Exit-Code setzen. */
export function bericht(p, titel) {
  console.log(`\n========== ${titel} ==========`);
  console.log(`Geprueft gegen: ${BASIS}`);
  console.log(`Formular erwartet: ${FORMULAR_AKTIV ? "eingeschaltet" : "ausgeschaltet"}`);
  console.log(`Bestanden: ${p.bestanden}`);
  console.log(`Fehlgeschlagen: ${p.fehler.length}`);

  if (p.hinweise.length) {
    console.log("\nHinweise (kein Fehler):");
    for (const h of p.hinweise) console.log(`  - ${h}`);
  }

  if (p.fremd.length) {
    const nachHost = new Map();
    for (const f of p.fremd) nachHost.set(f.host, (nachHost.get(f.host) ?? 0) + 1);
    console.log("\nKonsolenfehler aus Fremd-Origins (nicht unser Code, kein Fehler):");
    for (const [host, anzahl] of nachHost) console.log(`  - ${anzahl}x ${host}`);
  }

  if (p.bekannt.length) {
    const nachGrund = new Map();
    for (const b of p.bekannt) {
      const schluessel = `${b.engine}: ${b.grund}`;
      nachGrund.set(schluessel, (nachGrund.get(schluessel) ?? 0) + 1);
    }
    console.log("\nBekannte Meldungen (dokumentiert, nicht als Fehler gezaehlt):");
    for (const [grund, anzahl] of nachGrund) console.log(`  - ${anzahl}x ${grund}`);
  }

  // Umgekehrte Richtung: eine Ausnahme, die nicht mehr greift, gehoert raus.
  // Nur fuer Engines, die in diesem Lauf ueberhaupt dran waren — sonst meldet
  // der Smoke-Test (nur Chromium) eine WebKit-Ausnahme als erledigt.
  for (const b of BEKANNTE_MELDUNGEN) {
    if (b.nurEngine && !p.engines.has(b.nurEngine)) continue;
    if (p.bekannt.some((x) => b.muster.test(x.text))) continue;
    console.log(
      `\nHinweis: die bekannte Meldung /${b.muster.source}/ trat in diesem Lauf ` +
        "nicht auf. Wenn das reproduzierbar ist, kann der Eintrag aus " +
        "BEKANNTE_MELDUNGEN in scripts/pruefen/lib.mjs raus.",
    );
  }

  if (p.fehler.length) {
    const nachArt = new Map();
    for (const f of p.fehler) {
      const art = f.split("/").slice(-1)[0].split(" —")[0];
      nachArt.set(art, (nachArt.get(art) ?? 0) + 1);
    }
    console.log("\nNach Art:");
    for (const [art, anzahl] of nachArt) console.log(`  ${art}: ${anzahl}`);
    console.log(`\nErste ${Math.min(25, p.fehler.length)}:`);
    for (const f of p.fehler.slice(0, 25)) console.log(`  - ${f}`);
    if (p.fehler.length > 25) console.log(`  ... und ${p.fehler.length - 25} weitere`);
  } else {
    console.log("\nAlle Pruefungen bestanden.");
  }

  process.exitCode = p.fehler.length > 0 ? 1 : 0;
}
