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
export const IST_LOKAL = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])/.test(BASIS);
export const FORMULAR_AKTIV = process.env.FORMULAR
  ? process.env.FORMULAR === "1"
  : !IST_LOKAL;

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
      "Artefakt DIESES Laufs, kein Seitenfehler: page.goto bricht die noch " +
      "laufenden RSC-Prefetches der vorigen Route ab, und WebKit meldet " +
      "abgebrochene Fetches als \"due to access control checks\". Am 22.08.2026 " +
      "belegt: derselbe Durchlauf ueber die 11 Routen ergibt ohne Ruhezeit 2 " +
      "solche Meldungen, mit 1800 ms Ruhezeit je Route 0. Und die Navigation " +
      "selbst ist in Ordnung — ein window-Marker ueberlebt den Klick in WebKit " +
      "mobil wie desktop, es ist also eine Client-Navigation und kein " +
      "Neuladen. Die frueher hier notierte Lesart (\"Safari laedt jede Seite " +
      "neu, Apple-Geraete sind langsamer\") war falsch.",
  },
  {
    muster: /challenges\.cloudflare\.com/i,
    grund:
      "Turnstile laeuft in einem iframe von challenges.cloudflare.com. Dessen " +
      "Skript greift auf den umgebenden Frame zu, was der Browser " +
      "unterbindet — Fremdcode, nicht reparierbar und ohne Wirkung auf das " +
      "Formular. Faellt hier auf, weil ein pageerror keine Quell-URL mitbringt " +
      "und deshalb nicht ueber die Origin-Trennung laeuft.",
  },
  {
    muster: /__next\..*__PAGE__\.txt/,
    nurLokal: true,
    grund:
      "Nur unter `wrangler dev` auf /buchung/: Next fragt den RSC-Payload als " +
      "__next.buchung.__PAGE__.txt an (mit Punkt), auf der Platte liegt er als " +
      "__next.buchung/__PAGE__.txt (mit Schraegstrich). Die lokale " +
      "Asset-Auslieferung loest das nicht auf, die echte Workers-Runtime schon " +
      "— live gemessen: 0 Fehler auf allen Routen. Warum sich beide " +
      "unterscheiden, ist nicht abschliessend geklaert; belegt ist nur, dass es " +
      "live nicht auftritt. Gilt deshalb ausschliesslich bei lokalem BASIS.",
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
    // Adresse mitfuehren, damit der Bericht und die Ausnahmepruefung sie sehen.
    const volltext = url ? `${text} <- ${url}` : text;
    const treffer = BEKANNTE_MELDUNGEN.find(
      (b) =>
        // Auch gegen die Quelle pruefen: "Failed to load resource: ... 404"
        // nennt die Adresse nicht im Text, sondern nur in location.url.
        (b.muster.test(text) || (url && b.muster.test(url))) &&
        (!b.nurEngine || b.nurEngine === engine) &&
        // Lokale Artefakte nie gegen live durchlassen: was live auftritt, ist
        // ein Befund, auch wenn es lokal erklaerbar waere.
        (!b.nurLokal || IST_LOKAL),
    );
    if (treffer) p.bekannt.push({ engine, text: volltext, grund: treffer.grund });
    else unbekannt.push(volltext);
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

// --------------------------------------------------------------- Hydration

/**
 * Wartet, bis React das Element uebernommen hat — also bis sein `onClick`
 * wirklich haengt.
 *
 * Warum das noetig ist: die Seite ist ein statischer Export. Ein `<button>` aus
 * einer Client-Komponente steht im ausgelieferten HTML fertig da, sieht
 * anklickbar aus und **tut vor der Hydration nichts**. Ein Klick geht dann ins
 * Leere, ohne Fehler, ohne Spur.
 *
 * `waitUntil: "networkidle"` deckt das nicht ab: es sagt aus, dass das Bundle
 * geladen ist, nicht dass es gelaufen ist. Genau daran hing der Video-Test —
 * er wartete nach dem Laden 1500 ms und klickte dann. Am 05.09.2026 unter
 * WebKit einmal rot ("nach dem Klick erscheint kein iframe"), in den
 * Wiederholungen gruen. Nachgestellt und belegt: `goto` mit
 * `domcontentloaded`, sofort klicken → **kein iframe**. Der Fehler war also
 * echt, nur nicht der, den die Meldung nannte.
 *
 * Ein fester Wartewert waere nur ein groesserer Wuerfel. Gewartet wird deshalb
 * auf einen **Zustand**: React haengt beim Hydrieren `__reactFiber$…` an jeden
 * Host-Knoten. Am 05.09.2026 an `.video-start` nachgemessen — vor der
 * Hydration `[]`, danach `["__reactFiber$…","__reactProps$…"]`.
 *
 * Das ist bewusst ein React-Interna. Sollte React den Namen aendern, laeuft
 * diese Funktion in die Frist und meldet `ok: false` — die Pruefung schlaegt
 * also **fehl**, statt still durchzuwinken. Das ist die Richtung, in die ein
 * Irrtum hier fallen darf: ein falsches Rot faellt auf, ein falsches Gruen
 * nicht.
 *
 * @returns {Promise<{ok: boolean, ms: number}>}
 */
export async function warteAufHydration(seite, selektor, frist = 15000) {
  const start = Date.now();
  const ok = await seite
    .waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        return !!el && Object.keys(el).some((k) => k.startsWith("__reactFiber$"));
      },
      selektor,
      { timeout: frist, polling: 100 },
    )
    .then(() => true)
    .catch(() => false);
  return { ok, ms: Date.now() - start };
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

/**
 * CSS-Farbe als { r, g, b, a }. Fuer rgb() ist a = 1.
 *
 * Der Alphakanal ist hier der ganze Punkt: rgb() oben verwirft ihn, und damit
 * rechnete die Kontrastpruefung bei `rgba(91,53,31,0.72)` mit dem vollen
 * Braun — 8,26:1 statt der tatsaechlichen 4,12:1. Sie konnte den Befund, um
 * dessentwillen sie existiert, gar nicht finden.
 */
export function farbe(str) {
  const m = String(str).match(/[\d.]+/g);
  if (!m || m.length < 3) return null;
  return {
    r: Number(m[0]),
    g: Number(m[1]),
    b: Number(m[2]),
    a: m.length > 3 ? Number(m[3]) : 1,
  };
}

/** Eine Farbe mit Alpha ueber eine deckende Farbe legen. */
export function ueberlagern(oben, unten) {
  const a = oben.a ?? 1;
  return {
    r: oben.r * a + unten.r * (1 - a),
    g: oben.g * a + unten.g * (1 - a),
    b: oben.b * a + unten.b * (1 - a),
    a: 1,
  };
}

/**
 * Rechnet eine im Browser gesammelte Hintergrundkette (von innen nach aussen)
 * plus optionalen Vordergrund zu einer deckenden Farbe zusammen. Basis ist
 * Weiss, weil darunter kein Hintergrund mehr liegt.
 */
export function deckendeFarbe(ketteInnenNachAussen, vordergrund = null) {
  let ergebnis = { r: 255, g: 255, b: 255, a: 1 };
  for (const eintrag of [...ketteInnenNachAussen].reverse()) {
    const f = farbe(eintrag);
    if (f) ergebnis = ueberlagern(f, ergebnis);
  }
  if (vordergrund) {
    const f = farbe(vordergrund);
    if (f) ergebnis = ueberlagern(f, ergebnis);
  }
  return ergebnis;
}

/** Kontrast zweier { r, g, b }-Objekte. */
export function kontrastObj(a, b) {
  return kontrast([a.r, a.g, a.b], [b.r, b.g, b.b]);
}

/**
 * JS-Schnipsel fuer seite.evaluate: sammelt die Hintergrundfarben eines
 * Elements von innen nach aussen, bis eine voll deckende erreicht ist.
 * Als String, damit ihn mehrere evaluate-Aufrufe teilen koennen.
 */
export const HG_KETTE = `
  function hgKette(el) {
    const kette = [];
    let n = el;
    while (n) {
      const b = getComputedStyle(n).backgroundColor;
      if (b && !/^rgba\\(0, 0, 0, 0\\)$/.test(b) && b !== "transparent") {
        kette.push(b);
        const m = b.match(/[\\d.]+/g);
        if (!m || m.length < 4 || Number(m[3]) === 1) break;
      }
      n = n.parentElement;
    }
    return kette;
  }
`;

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
    if (b.nurLokal && !IST_LOKAL) continue;
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
