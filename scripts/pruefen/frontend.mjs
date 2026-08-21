/**
 * Stufe 2 — Vollauf. Gate vor dem Push und nach jeder CSS-Aenderung.
 * Gemessen gegen live: 1464 Pruefungen in rund 20 Sekunden.
 *
 * Geprueft wird eine ausgelieferte Seite, nicht der Arbeitsstand — deshalb ist
 * das kein Hook, sondern ein Handgriff (Begruendung in README.md).
 *
 * Geprueft in Chromium UND WebKit. WebKit ist Pflicht, nicht Zierde: das CSS
 * nutzt env(safe-area-inset-*), 100svh und -webkit-overflow-scrolling, und die
 * gemeldeten Fehler traten auf einem iPhone auf. Ein Lauf, der nur Chromium
 * abdeckt, hat den Bug nicht gesehen.
 *
 * Drei Konstruktionsregeln, die aus einem Review des Vorgaengers stammen — der
 * meldete "0 Befunde", waehrend die Hero-Spalte 152 px ueber den Rand ragte:
 *
 *  1. Jeder Schliessmechanismus bekommt einen eigenen, frisch geoeffneten
 *     Ausgangszustand. Escape auf ein bereits geschlossenes Menue zu druecken
 *     ist ein Test, der nicht fehlschlagen kann.
 *  2. Fehlende Selektoren sind ein FEHLER, kein Bestehen. Zu jedem Selektor
 *     gehoert eine erwartete Mindestanzahl.
 *  3. Gemessen wird der berechnete Zustand im Browser, nicht die CSS-Quelle —
 *     und nicht nur documentElement.scrollWidth. overflow:hidden verbirgt
 *     Ueberlaeufe genau dort, wo sie wehtun.
 *
 *   npm run pruefen                                  (live, beide Engines)
 *   NUR_CHROMIUM=1 npm run pruefen                   (schneller, halbe Aussage)
 *   BASIS=http://127.0.0.1:8788 FORMULAR=0 npm run pruefen
 */
import {
  BASIS,
  FORMULAR_AKTIV,
  IPHONE_UA,
  ROUTEN,
  bericht,
  fehlerSammler,
  konsoleAuswerten,
  kontrast,
  neuesProtokoll,
  playwrightOderAbbruch,
  pruefe,
  rgb,
} from "./lib.mjs";

const { chromium, webkit } = playwrightOderAbbruch();
const NUR_CHROMIUM = process.env.NUR_CHROMIUM === "1";

/**
 * Breitenmatrix. Die Werte sind nicht rund gewaehlt, sondern liegen auf den
 * Breakpoints des CSS und knapp daneben (620/621, 960, 1140): genau dort sass
 * der Fehler, bei dem die ganze Seite auf dem iPad Pro horizontal scrollte.
 */
const BREITEN = [320, 360, 375, 393, 430, 500, 620, 621, 768, 834, 960, 1024, 1140, 1280];

const p = neuesProtokoll();

// ---------------------------------------------------------------- Hilfsmittel

async function menueOeffnen(seite) {
  await seite.locator("details.mobile-menu summary").click();
  return seite.locator("details.mobile-menu").evaluate((el) => el.open);
}

function istOffen(seite) {
  return seite.locator("details.mobile-menu").evaluate((el) => el.open);
}

/**
 * Fuehrt einen Pruefblock aus und uebersetzt eine Ausnahme in einen Befund.
 *
 * Ohne das waere ein umbenannter Selektor kein Fehler, sondern ein Absturz:
 * locator.click() laeuft in einen Timeout, die Ausnahme fliegt hoch und der
 * Rest des Laufs findet nie statt. Ein Absturz ist zwar auch nicht gruen, sagt
 * aber nicht, WAS fehlt — und verdeckt alles danach.
 */
async function versuche(bezeichnung, fn) {
  try {
    await fn();
  } catch (e) {
    const text = String(e.message ?? e).split("\n")[0].slice(0, 160);
    p.fehler.push(`${bezeichnung} — abgebrochen: ${text}`);
    console.log(`  x ${bezeichnung}: abgebrochen: ${text}`);
  }
}

// ---------------------------------------------------------------- A + B + C

/** Burgermenue, Social-Kacheln und alle Routen in iPhone-Groesse. */
async function mobilPruefungen(engine, browser) {
  const meldungen = [];
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    userAgent: IPHONE_UA,
    isMobile: true,
    hasTouch: true,
  });
  const seite = await ctx.newPage();
  // Kurze Timeouts: ein fehlender Selektor soll nach Sekunden als Befund
  // auftauchen, nicht nach einer halben Minute Warten.
  seite.setDefaultTimeout(10_000);
  seite.setDefaultNavigationTimeout(20_000);
  fehlerSammler(seite, meldungen);

  // --- A. Die drei Schliessmechanismen, jeder mit frischem Ausgangszustand ---
  console.log("  A. Burgermenue");

  // A1: Klick auf einen Link schliesst das Menue. Das Layout bleibt bei
  // Next.js-Client-Navigation gemountet, ein <details> behaelt sein open.
  await versuche(`${engine}/A1-navigation`, async () => {
    await seite.goto(BASIS + "/", { waitUntil: "load" });
    pruefe(p, await menueOeffnen(seite), `${engine}/menue-oeffnet`, "summary-Klick oeffnete das Menue nicht");
    const linkAnzahl = await seite.locator("details.mobile-menu div a").count();
    pruefe(p, linkAnzahl >= 5, `${engine}/menue-hat-links`, `nur ${linkAnzahl} Links im Menue`);
    await seite.locator("details.mobile-menu div a").first().click();
    await seite.waitForLoadState("load");
    pruefe(p, !(await istOffen(seite)), `${engine}/schliesst-bei-navigation`, "Menue blieb nach Navigation offen");
  });

  // A2: Aussenklick
  await versuche(`${engine}/A2-aussenklick`, async () => {
    await seite.goto(BASIS + "/", { waitUntil: "load" });
    await menueOeffnen(seite);
    await seite.mouse.click(5, 500);
    pruefe(p, !(await istOffen(seite)), `${engine}/schliesst-bei-aussenklick`, "Aussenklick schloss das Menue nicht");
  });

  // A3: Escape — hier war der alte Test blind, deshalb erst die Vorbedingung
  // pruefen und dann drucken.
  await versuche(`${engine}/A3-escape`, async () => {
    await seite.goto(BASIS + "/", { waitUntil: "load" });
    pruefe(p, await menueOeffnen(seite), `${engine}/escape-vorbedingung`, "Menue war vor Escape nicht offen — Test waere sinnlos");
    await seite.keyboard.press("Escape");
    pruefe(p, !(await istOffen(seite)), `${engine}/schliesst-bei-escape`, "Escape schloss das Menue nicht");
  });

  // A4: letzter Link, nicht nur der erste
  await versuche(`${engine}/A4-letzter-link`, async () => {
    await seite.goto(BASIS + "/", { waitUntil: "load" });
    await menueOeffnen(seite);
    const interne = seite.locator('details.mobile-menu div a:not([target="_blank"])');
    const internAnzahl = await interne.count();
    pruefe(p, internAnzahl >= 2, `${engine}/menue-interne-links`, `nur ${internAnzahl} interne Links`);
    await interne.nth(internAnzahl - 1).click();
    await seite.waitForLoadState("load");
    pruefe(p, !(await istOffen(seite)), `${engine}/schliesst-bei-letztem-link`, "Menue blieb nach dem letzten Link offen");
  });

  // --- B. Social-Kacheln IM GEOEFFNETEN Menue messen ---
  console.log("  B. Social-Kacheln im geoeffneten Menue");
  await versuche(`${engine}/B-social-im-menue`, async () => {
    await seite.goto(BASIS + "/", { waitUntil: "load" });
    await menueOeffnen(seite);
    const imMenue = await seite.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll("details.mobile-menu .social-button")) {
        const r = el.getBoundingClientRect();
        out.push({
          txt: (el.textContent ?? "").trim().slice(0, 30),
          w: Math.round(r.width),
          sichtbar: r.width > 0 && r.height > 0,
          abgeschnitten: el.scrollWidth > el.clientWidth + 1,
          ragtRaus: r.right > document.documentElement.clientWidth + 1,
        });
      }
      return out;
    });
    pruefe(p, imMenue.length >= 2, `${engine}/menue-social-gefunden`, `${imMenue.length} Social-Kacheln (erwartet >= 2)`);
    pruefe(p, imMenue.every((b) => b.sichtbar), `${engine}/menue-social-sichtbar`, "mindestens eine war 0x0");
    for (const b of imMenue) {
      pruefe(p, !b.abgeschnitten, `${engine}/menue-social-nicht-abgeschnitten`, `"${b.txt}" abgeschnitten (w=${b.w})`);
      pruefe(p, !b.ragtRaus, `${engine}/menue-social-im-viewport`, `"${b.txt}" ragt aus dem Viewport`);
    }
  });

  // --- C. Alle Routen: Status, Ueberlauf, Social-Kacheln ---
  console.log(`  C. ${ROUTEN.length} Routen`);
  for (const pfad of ROUTEN) {
    await versuche(`${engine}${pfad}/C-block`, () => routePruefen(engine, seite, pfad));
  }

  const unbekannt = konsoleAuswerten(p, engine, meldungen);
  pruefe(p, unbekannt.length === 0, `${engine}/keine-konsolenfehler`, unbekannt.slice(0, 3).join(" | "));

  await ctx.close();
}

/** Teil C fuer eine Route. Ausgelagert, damit versuche() sie einzeln kapselt. */
async function routePruefen(engine, seite, pfad) {
  const antwort = await seite.goto(BASIS + pfad, { waitUntil: "load" });
  pruefe(p, antwort !== null && antwort.status() < 400, `${engine}${pfad}/status`, `HTTP ${antwort?.status()}`);

  const mess = await seite.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const kacheln = [];
    for (const el of document.querySelectorAll(".social-button")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      kacheln.push({
        txt: (el.textContent ?? "").trim().slice(0, 26),
        abgeschnitten: el.scrollWidth > el.clientWidth + 1,
        ragtRaus: r.right > vw + 1,
      });
    }
    // Innere Container mitpruefen. Nur documentElement zu messen war der
    // Grund, warum die 152px breite Hero-Spalte durchrutschte.
    const innere = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
        const cs = getComputedStyle(el);
        if (cs.overflowX !== "visible" || ["SELECT", "TEXTAREA", "INPUT"].includes(el.tagName)) continue;
        // Absichtlich aus dem Bild geschobene Elemente ueberspringen: der
        // Honeypot liegt bei left:-9999px in einer 1px-Huelle mit
        // overflow:hidden, sein <label> "ueberlaeuft" damit zwangslaeufig.
        // Bewusst eng gefasst — geprueft wird die Lage im Viewport, nicht ob
        // ein Vorfahre clippt. Sonst waere der Hero-Fall wieder unsichtbar.
        const r = el.getBoundingClientRect();
        if (r.right <= 0 || r.left >= vw) continue;
        innere.push(`${el.tagName.toLowerCase()}.${el.className?.toString().slice(0, 24)}`);
      }
    }
    return {
      seiteScrollt: document.documentElement.scrollWidth > vw + 1,
      kacheln,
      innere: innere.slice(0, 5),
      anzahlInnere: innere.length,
    };
  });

  pruefe(p, !mess.seiteScrollt, `${engine}${pfad}/kein-overflow`, "Seite scrollt horizontal");
  pruefe(p, mess.kacheln.length > 0, `${engine}${pfad}/social-gefunden`, "keine .social-button gefunden — Selektor kaputt?");
  for (const b of mess.kacheln) {
    pruefe(p, !b.abgeschnitten, `${engine}${pfad}/social-nicht-abgeschnitten`, `"${b.txt}" abgeschnitten`);
    pruefe(p, !b.ragtRaus, `${engine}${pfad}/social-im-viewport`, `"${b.txt}" ragt raus`);
  }
  if (mess.anzahlInnere > 0) {
    p.hinweise.push(`${engine}${pfad}: ${mess.anzahlInnere} innere Container mit Ueberlauf (${mess.innere.join(", ")})`);
  }
}

// ---------------------------------------------------------------- D + E

/** Breitenmatrix: Kontrast, Hero-Geometrie, CTA, Links, Formularfelder. */
async function breitenPruefungen(engine, browser) {
  console.log(`  D. Breitenmatrix (${BREITEN.length} Breiten)`);

  for (const breite of BREITEN) {
    const ctx = await browser.newContext({
      viewport: { width: breite, height: 900 },
      hasTouch: breite <= 960,
      isMobile: breite <= 960,
    });
    const seite = await ctx.newPage();
    seite.setDefaultTimeout(10_000);
    seite.setDefaultNavigationTimeout(20_000);
    // Kapseln, damit eine Ausnahme bei einer Breite die restlichen 13 nicht
    // mitnimmt — und der Kontext trotzdem geschlossen wird.
    await versuche(`${engine}/${breite}/D-block`, () => breitePruefen(engine, seite, breite));
    await ctx.close();
  }
}

/** Teil D und E fuer eine Viewport-Breite. */
async function breitePruefen(engine, seite, breite) {
  {
    const kennung = `${engine}/${breite}`;

    // ---- Startseite ----
    await seite.goto(BASIS + "/", { waitUntil: "load" });

    // .button.secondary war unsichtbar: color:#fffaf2 auf hellem Grund,
    // Kontrast 1,00:1 — betroffen waren drei von vier CTAs im Abschlussblock.
    const sekundaer = await seite.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll(".button.secondary")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        // Effektiven Hintergrund suchen: erster Vorfahre mit Deckung.
        let knoten = el;
        let hg = "rgba(0, 0, 0, 0)";
        while (knoten) {
          const b = getComputedStyle(knoten).backgroundColor;
          if (b && !b.startsWith("rgba(0, 0, 0, 0")) {
            hg = b;
            break;
          }
          knoten = knoten.parentElement;
        }
        out.push({ txt: (el.textContent ?? "").trim().slice(0, 24), vg: getComputedStyle(el).color, hg });
      }
      return out;
    });
    pruefe(p, sekundaer.length > 0, `${kennung}/secondary-gefunden`, "kein .button.secondary gefunden — Selektor kaputt?");
    for (const s of sekundaer) {
      const v = rgb(s.vg);
      const h = rgb(s.hg);
      if (!v || !h) continue;
      const k = kontrast(v, h);
      pruefe(p, k >= 4.5, `${kennung}/secondary-kontrast`, `"${s.txt}" nur ${k.toFixed(2)}:1 (${s.vg} auf ${s.hg})`);
    }

    // Hero: .hero-content behielt unter 621px das padding-right der
    // Grundregel, obwohl das Bild dort display:none ist — Textspalte 153px
    // breit, Hero 1415px hoch, Ueberschrift Wort fuer Wort umgebrochen.
    const hero = await seite.evaluate(() => {
      const el = document.querySelector(".hero-content");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const heroEl = document.querySelector(".hero");
      return {
        innen: Math.round(r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)),
        padRight: Math.round(parseFloat(cs.paddingRight)),
        heroHoehe: heroEl ? Math.round(heroEl.getBoundingClientRect().height) : 0,
        vw: document.documentElement.clientWidth,
      };
    });
    pruefe(p, hero !== null, `${kennung}/hero-gefunden`, ".hero-content nicht gefunden — Selektor kaputt?");
    if (hero) {
      const mindest = Math.min(260, hero.vw - 60);
      pruefe(p, hero.innen >= mindest, `${kennung}/hero-textbreite`, `nur ${hero.innen}px Text (padding-right ${hero.padRight}px), erwartet >= ${mindest}px`);
      pruefe(p, hero.heroHoehe < 1100, `${kennung}/hero-hoehe`, `Hero ${hero.heroHoehe}px hoch`);
    }

    // Buchungs-CTA: war mobil erst bei 92,4 % Seitentiefe erreichbar.
    const cta = await seite.evaluate(() => {
      const el = document.querySelector(".header-cta");
      if (!el) return { da: false };
      const r = el.getBoundingClientRect();
      return {
        da: true,
        sichtbar: r.width > 0 && r.height > 0,
        imViewport: r.right <= document.documentElement.clientWidth + 1,
        txt: (el.textContent ?? "").trim(),
        hoehe: Math.round(r.height),
      };
    });
    pruefe(p, cta.da && cta.sichtbar, `${kennung}/cta-sichtbar`, ".header-cta nicht sichtbar");
    pruefe(p, cta.imViewport, `${kennung}/cta-im-viewport`, `.header-cta ragt raus (Text "${cta.txt}")`);
    pruefe(p, (cta.hoehe ?? 0) >= 44, `${kennung}/cta-touchziel`, `nur ${cta.hoehe}px hoch, WCAG 2.5.8 verlangt 44px`);

    // Header darf nicht ueberlaufen. Genau hier wurde ein eigener Regress
    // gefangen: mit sichtbarem CTA brauchte der Header 454px bei 375px Platz,
    // weil min-width:220px auf .brand nicht nachgab.
    const kopf = await seite.evaluate(() => {
      const el = document.querySelector(".site-header");
      const vw = document.documentElement.clientWidth;
      const raus = [];
      for (const k of el?.querySelectorAll("*") ?? []) {
        const r = k.getBoundingClientRect();
        if (r.width > 0 && r.right > vw + 1) raus.push(k.className?.toString().slice(0, 24) || k.tagName);
      }
      return { da: el !== null, seiteScrollt: document.documentElement.scrollWidth > vw + 1, raus: raus.slice(0, 3) };
    });
    pruefe(p, kopf.da, `${kennung}/header-gefunden`, ".site-header nicht gefunden — Selektor kaputt?");
    pruefe(p, !kopf.seiteScrollt, `${kennung}/kein-overflow`, "Seite scrollt horizontal");
    pruefe(p, kopf.raus.length === 0, `${kennung}/header-passt`, `ragt raus: ${kopf.raus.join(", ")}`);

    // ---- Buchungsseite ----
    await seite.goto(BASIS + "/buchung/", { waitUntil: "load" });

    // Telefonnummer und E-Mail waren nicht als Links erkennbar: gleiche Farbe,
    // keine Unterstreichung — Folge von a { color: inherit; text-decoration: none }.
    const inline = await seite.evaluate(() =>
      [...document.querySelectorAll("p a:not([class]), label a:not([class])")].map((el) => {
        const cs = getComputedStyle(el);
        return {
          txt: (el.textContent ?? "").trim().slice(0, 26),
          deko: cs.textDecorationLine,
          farbe: cs.color,
          elternFarbe: el.parentElement ? getComputedStyle(el.parentElement).color : "",
        };
      }),
    );
    pruefe(p, inline.length > 0, `${kennung}/inline-links-gefunden`, "keine klassenlosen Inline-Links gefunden");
    for (const l of inline) {
      const unterschieden = l.deko.includes("underline") || l.farbe !== l.elternFarbe;
      pruefe(p, unterschieden, `${kennung}/inline-link-erkennbar`, `"${l.txt}" weder unterstrichen noch andersfarbig`);
    }

    // Formularfelder: font:inherit erbte font-weight:900 vom <label>, und bei
    // Feldern unter 16px zoomt iOS-Safari automatisch hinein.
    const felder = await seite.evaluate(() =>
      [...document.querySelectorAll("input:not([type=checkbox]), textarea, select")].map((el) => {
        const cs = getComputedStyle(el);
        return { name: el.getAttribute("name") ?? el.tagName, px: parseFloat(cs.fontSize), gewicht: cs.fontWeight };
      }),
    );
    // In beide Richtungen pruefen, damit "nichts gefunden" nie als Erfolg
    // durchgeht. Welcher Zustand erwartet wird, sagt FORMULAR.
    if (FORMULAR_AKTIV) {
      pruefe(p, felder.length >= 6, `${kennung}/formularfelder-gefunden`, `nur ${felder.length} Felder — Formular aus oder Markup geaendert?`);
      for (const f of felder) {
        pruefe(p, f.px >= 16, `${kennung}/feld-16px`, `${f.name}: ${f.px}px — iOS zoomt unter 16px hinein`);
        pruefe(p, Number(f.gewicht) <= 500, `${kennung}/feld-gewicht`, `${f.name}: font-weight ${f.gewicht}`);
      }
    } else {
      pruefe(p, felder.length === 0, `${kennung}/formular-wirklich-aus`, `${felder.length} Felder da, obwohl FORMULAR=0 erwartet wurde`);
    }

    // Checkbox-Zeile: bei mehrzeiligem Text muss das Kaestchen neben der
    // ERSTEN Zeile stehen, nicht in der Mitte des Absatzes. Das ist kein
    // Geschmacksurteil — `.checkbox-zeile` setzt dafuer `align-items: start`,
    // verliert aber gegen `label:has(input[type=checkbox])`: (0,1,0) gegen
    // (0,1,2), weil :has() die Spezifitaet seines Arguments annimmt. Auf dem
    // Desktop ist der Text einzeilig und der Fehler unsichtbar, mobil bricht
    // er auf fuenf Zeilen um.
    if (FORMULAR_AKTIV) {
      const zustimmung = await seite.evaluate(() => {
        const lab = document.querySelector("label.checkbox-zeile");
        if (!lab) return null;
        const box = lab.querySelector('input[type="checkbox"]');
        if (!box) return { ohneBox: true };
        const lr = lab.getBoundingClientRect();
        const br = box.getBoundingClientRect();
        const cs = getComputedStyle(lab);
        const zeilenhoehe = parseFloat(cs.lineHeight) || 0;
        return {
          zeilenhoehe: Math.round(zeilenhoehe),
          zeilen: zeilenhoehe ? Math.round((lr.height / zeilenhoehe) * 10) / 10 : 0,
          versatz: Math.round(br.top - lr.top),
          // Mitte des Kaestchens, gemessen von der Oberkante des Labels.
          boxMitte: Math.round(br.top - lr.top + br.height / 2),
          alignItems: cs.alignItems,
        };
      });
      pruefe(p, zustimmung !== null, `${kennung}/checkbox-zeile-gefunden`, "label.checkbox-zeile nicht gefunden — Selektor kaputt?");
      if (zustimmung && !zustimmung.ohneBox) {
        pruefe(p, zustimmung.zeilenhoehe > 0, `${kennung}/checkbox-zeilenhoehe`, "line-height nicht messbar");
        if (zustimmung.zeilen >= 1.5) {
          // Nicht "irgendwo in der ersten Zeile", sondern die MITTE des
          // Kaestchens auf der ersten Zeile. Die schwaechere Fassung (Oberkante
          // innerhalb der Zeilenhoehe) haette ein um 20px verschobenes
          // Kaestchen noch bestehen lassen.
          pruefe(
            p,
            zustimmung.boxMitte > 0 && zustimmung.boxMitte <= zustimmung.zeilenhoehe,
            `${kennung}/checkbox-neben-erster-zeile`,
            `Kaestchenmitte ${zustimmung.boxMitte}px unter dem Textanfang, erste Zeile reicht bis ` +
              `${zustimmung.zeilenhoehe}px (${zustimmung.zeilen} Zeilen, align-items: ${zustimmung.alignItems})`,
          );
        }
      }
    }

    // Honeypot. Wird er je sichtbar, fuellt ihn ein Mensch aus, bekommt vom
    // Worker {ok:true} und 200 — und seine Anfrage wird verworfen, ohne dass
    // es jemand merkt. Ein stiller Verlust von Buchungsanfragen, deshalb
    // eigene Pruefung und kein Vertrauen auf das CSS.
    if (FORMULAR_AKTIV) {
      const honig = await seite.evaluate(() => {
        const feld = document.querySelector('input[name="webseite"]');
        if (!feld) return null;
        const huelle = feld.closest(".honeypot");
        const r = feld.getBoundingClientRect();
        const vw = document.documentElement.clientWidth;
        const cs = getComputedStyle(feld);
        return {
          ausserhalb: r.right <= 0 || r.left >= vw,
          unsichtbar: cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0,
          ariaHidden: huelle?.getAttribute("aria-hidden") === "true",
          tabIndex: feld.tabIndex,
          links: Math.round(r.left),
        };
      });
      pruefe(p, honig !== null, `${kennung}/honeypot-vorhanden`, 'input[name="webseite"] fehlt — Spam-Schutz weg?');
      if (honig) {
        pruefe(p, honig.ausserhalb || honig.unsichtbar, `${kennung}/honeypot-unsichtbar`, `Feld sichtbar bei x=${honig.links} — echte Anfragen wuerden still verworfen`);
        pruefe(p, honig.ariaHidden, `${kennung}/honeypot-aria-hidden`, "Huelle ohne aria-hidden — Screenreader lesen das Feld vor");
        pruefe(p, honig.tabIndex === -1, `${kennung}/honeypot-nicht-tabbar`, `tabIndex ${honig.tabIndex} statt -1`);
      }
    }
  }
}

// ---------------------------------------------------------------- Ablauf

async function lauf(engine, launcher) {
  console.log(`\n===== ${engine} =====`);
  p.engines.add(engine);
  const browser = await launcher.launch();
  try {
    await mobilPruefungen(engine, browser);
    await breitenPruefungen(engine, browser);
  } finally {
    await browser.close();
  }
}

try {
  await lauf("chromium", chromium);
  if (NUR_CHROMIUM) {
    p.hinweise.push("NUR_CHROMIUM=1 — WebKit uebersprungen, Safari-Verhalten ist UNGEPRUEFT.");
  } else {
    try {
      await lauf("webkit", webkit);
    } catch (e) {
      // Nicht lauffaehig ist ein Fehler, kein Bestehen: sonst faellt die
      // Safari-Abdeckung still weg und der Lauf meldet trotzdem gruen.
      p.engines.delete("webkit");
      p.fehler.push(`webkit/nicht-lauffaehig — ${e.message.slice(0, 160)}`);
      console.log(`  x WebKit nicht lauffaehig: ${e.message.slice(0, 160)}`);
    }
  }
} finally {
  bericht(p, "FRONTEND-VOLLAUF");
}
