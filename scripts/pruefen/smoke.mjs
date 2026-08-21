/**
 * Stufe 1 — Smoke-Test. Das, was nach jeder Aenderung dran ist: alle 11 Routen
 * in Desktop- und Handybreite, nur Chromium. Gemessen gegen live: 220
 * Pruefungen in rund 40 Sekunden.
 *
 * Geprueft wird, was eine Seite unbrauchbar macht, ohne dass man es sieht:
 * HTTP-Status, nachgeladene Assets mit 4xx/5xx, horizontaler Ueberlauf,
 * JS-Fehler, Bilder die nicht laden oder 0 px hoch bleiben, fehlende
 * alt-Texte, genau eine h1.
 *
 * Was hier NICHT drin ist: Kontrast, Breakpoint-Matrix, WebKit, das
 * Burgermenue. Das ist Stufe 2 (frontend.mjs) und dauert Minuten.
 *
 *   npm run pruefen:smoke                          (gegen live)
 *   BASIS=http://127.0.0.1:8788 npm run pruefen:smoke
 *   SCHUSS_ORDNER=./schuesse npm run pruefen:smoke  (Screenshots ablegen)
 */
import { mkdirSync } from "node:fs";
import {
  BASIS,
  ROUTEN,
  bericht,
  fehlerSammler,
  konsoleAuswerten,
  neuesProtokoll,
  playwrightOderAbbruch,
  pruefe,
} from "./lib.mjs";

const { chromium } = playwrightOderAbbruch();
const SCHUSS_ORDNER = process.env.SCHUSS_ORDNER;
if (SCHUSS_ORDNER) mkdirSync(SCHUSS_ORDNER, { recursive: true });

const p = neuesProtokoll();
p.engines.add("chromium");
const browser = await chromium.launch();

try {
  for (const [name, viewport] of [
    ["Desktop", { width: 1280, height: 900 }],
    ["Handy", { width: 390, height: 844 }],
  ]) {
    console.log(`\n########## ${name} ${viewport.width}px ##########`);

    for (const route of ROUTEN) {
      const seite = await browser.newPage({ viewport });
      const jsFehler = [];
      const assetFehler = [];
      fehlerSammler(seite, jsFehler);
      seite.on("response", (r) => {
        // Nur eigene Assets. Was das Turnstile-Widget von
        // challenges.cloudflare.com nachlaedt, ist nicht unsere Baustelle.
        if (
          r.status() >= 400 &&
          r.url().startsWith(BASIS) &&
          /\.(jpg|jpeg|png|webp|avif|css|js|woff2?)$/i.test(r.url())
        ) {
          assetFehler.push(`${r.status()} ${r.url().replace(BASIS, "")}`);
        }
      });

      const antwort = await seite.goto(BASIS + route, { waitUntil: "domcontentloaded" });

      // Durchscrollen, damit lazy geladene Bilder wirklich angefordert werden.
      await seite.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 800) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 50));
        }
        window.scrollTo(0, 0);
      });
      await seite.waitForTimeout(800);

      const befund = await seite.evaluate(() => {
        const bilder = [...document.querySelectorAll("img")];
        return {
          ueberlauf:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          bilderGesamt: bilder.length,
          // naturalWidth 0 trotz complete = Datei kam nicht an
          kaputt: bilder.filter((b) => b.complete && b.naturalWidth === 0).length,
          // im Layout sichtbar, aber ohne Hoehe = kaputtes <picture>
          ohneHoehe: bilder.filter(
            (b) => b.getBoundingClientRect().height < 2 && b.offsetParent !== null,
          ).length,
          ohneAlt: bilder.filter((b) => !b.hasAttribute("alt")).length,
          h1: document.querySelectorAll("h1").length,
          interneLinks: document.querySelectorAll('a[href^="/"]').length,
        };
      });

      const kennung = `${name}${route}`;
      pruefe(p, antwort?.status() === 200, `${kennung}/status`, `HTTP ${antwort?.status()}`);
      pruefe(p, befund.ueberlauf <= 1, `${kennung}/kein-overflow`, `${befund.ueberlauf}px zu breit`);
      // Mindestanzahl als Waechter: findet der Selektor nichts, ist das ein
      // Fehler und kein Bestehen. Das Logo steckt auf jeder Seite im Header.
      pruefe(p, befund.bilderGesamt >= 1, `${kennung}/bilder-gefunden`, "kein einziges <img> gefunden");
      pruefe(p, befund.interneLinks >= 5, `${kennung}/navigation-da`, `nur ${befund.interneLinks} interne Links`);
      pruefe(p, befund.kaputt === 0, `${kennung}/bilder-laden`, `${befund.kaputt} Bild(er) ohne Daten`);
      pruefe(p, befund.ohneHoehe === 0, `${kennung}/bilder-hoehe`, `${befund.ohneHoehe} Bild(er) 0px hoch`);
      pruefe(p, befund.ohneAlt === 0, `${kennung}/bilder-alt`, `${befund.ohneAlt} Bild(er) ohne alt`);
      pruefe(p, befund.h1 === 1, `${kennung}/genau-eine-h1`, `${befund.h1} h1-Elemente`);
      pruefe(p, assetFehler.length === 0, `${kennung}/assets`, assetFehler.slice(0, 2).join(", "));

      const unbekannt = konsoleAuswerten(p, "chromium", jsFehler);
      pruefe(p, unbekannt.length === 0, `${kennung}/keine-js-fehler`, unbekannt.slice(0, 2).join(" | "));

      console.log(
        `  ${route.padEnd(17)} ${antwort?.status()} · ${befund.bilderGesamt} Bilder · ` +
          `Ueberlauf ${befund.ueberlauf}px · h1 ${befund.h1}`,
      );

      if (SCHUSS_ORDNER && (route === "/" || route === "/eindruecke/")) {
        await seite.screenshot({
          path: `${SCHUSS_ORDNER}/smoke-${name.toLowerCase()}-${route.replace(/\//g, "") || "start"}.png`,
          fullPage: route !== "/",
        });
      }

      await seite.close();
    }
  }
} finally {
  await browser.close();
  bericht(p, "SMOKE-TEST");
}
