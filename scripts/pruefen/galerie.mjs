/**
 * Pruefungen fuer die Galerie-Grossansicht und den Abschnitt „Wo Karlson schon
 * gespielt hat".
 *
 * Anlass sind zwei Meldungen aus Karlsons WhatsApp-Nachricht vom 26.08.2026
 * (Fragen von Karin):
 *
 *   „Wo Karlson gespielt hat: oeffnet sich nicht"
 *   „wenn ich bei Eindruecke Bilder anklicke, bauen sie sich nicht auf, d. h.
 *    es ist mitunter nicht alles auf dem Bild zu sehen"
 *
 * Beides war zutreffend und wurde am 28.08.2026 an der Live-Seite nachgemessen,
 * bevor etwas geaendert wurde:
 *
 *   - Abschnitt „Wo Karlson schon gespielt hat": 3 Karten mit Schatten,
 *     **null** anklickbare Elemente. Ein Klick tat nichts.
 *   - /eindruecke/: 40 Bilder, **null** anklickbar. `object-fit: cover` schnitt
 *     bei 19 von 40 Bildern mehr als 20 % des Motivs ab, im schlimmsten Fall
 *     blieben 45 % uebrig.
 *
 * Diese Datei ist die Absicherung dagegen. Die Gegenprobe ist unaufwendig,
 * weil der kaputte Zustand noch erreichbar ist, solange der Fix nicht deployt
 * ist:
 *
 *   BASIS=https://karlson-solo-orchester.de node scripts/pruefen/galerie.mjs
 *
 * Dort muessen die Pruefungen fehlschlagen. Tun sie das nicht, pruefen sie
 * nichts — siehe README, Abschnitt „Gegenprobe".
 */
import { BASIS, bericht, neuesProtokoll, playwrightOderAbbruch, pruefe } from "./lib.mjs";

const pw = playwrightOderAbbruch();
const p = neuesProtokoll();

/** Wie viel Prozent des Motivs eine Kachel mindestens zeigen muss. */
const MINDESTENS_SICHTBAR = 92;

for (const engineName of ["chromium", "webkit"]) {
  const engine = pw[engineName];
  if (!engine) {
    p.hinweise.push(`${engineName} nicht verfuegbar — uebersprungen`);
    continue;
  }

  const browser = await engine.launch();
  p.engines.add(engineName);

  // --------------------------------------------------- Startseite: Auftritte
  {
    const seite = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await seite.goto(`${BASIS}/`, { waitUntil: "networkidle" });

    const auftritte = await seite.evaluate(() => {
      const abschnitte = [...document.querySelectorAll("section")];
      const treffer = abschnitte.find((s) =>
        /gespielt hat/i.test(s.querySelector("h2")?.innerText ?? ""),
      );
      if (!treffer) return null;
      return {
        karten: treffer.querySelectorAll(".card").length,
        ortsEintraege: treffer.querySelectorAll(".place-list li").length,
        // Steht die Ortsliste noch in einem eigenen zweiten Abschnitt?
        eigeneOrtsAbschnitte: abschnitte.filter(
          (s) => s !== treffer && s.querySelector(".place-list"),
        ).length,
      };
    });

    pruefe(
      p,
      auftritte !== null,
      `[${engineName}] Abschnitt „Wo Karlson schon gespielt hat" vorhanden`,
      "kein <section> mit passender H2 gefunden",
    );

    if (auftritte) {
      // Der Kern des Befunds: die Frage „wo hat er gespielt" muss im selben
      // Abschnitt vollstaendig beantwortet sein. Vorher standen dort nur drei
      // Karten ohne Klickziel, die vollstaendige Liste lag in einem zweiten
      // Abschnitt weiter unten.
      pruefe(
        p,
        auftritte.ortsEintraege >= 8,
        `[${engineName}] Ortsliste steht im selben Abschnitt wie die Highlights`,
        `nur ${auftritte.ortsEintraege} Ortseintraege im Abschnitt (erwartet mindestens 8) — ` +
          "die vollstaendige Antwort steht nicht dort, wo die Frage gestellt wird",
      );

      pruefe(
        p,
        auftritte.eigeneOrtsAbschnitte === 0,
        `[${engineName}] Keine zweite, getrennte Ortsliste auf der Startseite`,
        `${auftritte.eigeneOrtsAbschnitte} weitere(r) Abschnitt(e) mit .place-list gefunden`,
      );

      pruefe(
        p,
        auftritte.karten === 3,
        `[${engineName}] Drei Highlight-Karten vorhanden`,
        `${auftritte.karten} Karten gefunden`,
      );
    }

    await seite.close();
  }

  // ------------------------------------------------ /eindruecke/: Grossansicht
  {
    const seite = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await seite.goto(`${BASIS}/eindruecke/`, { waitUntil: "networkidle" });

    const kacheln = seite.locator(".galerie-kachel");
    const anzahl = await kacheln.count();

    pruefe(
      p,
      anzahl > 0,
      `[${engineName}] Galeriebilder sind anklickbar`,
      "kein einziges Bild ist ein Knopf — ein Klick auf die Kachel tut nichts " +
        "(genau der gemeldete Befund)",
    );

    if (anzahl > 0) {
      // --- Zuschnitt im Raster ---------------------------------------------
      const zuschnitt = await seite.evaluate(() => {
        const werte = [];
        for (const img of document.querySelectorAll(".gallery-masonry .galerie-kachel img")) {
          const r = img.getBoundingClientRect();
          if (!img.naturalWidth || !r.width) continue;
          const echt = img.naturalWidth / img.naturalHeight;
          const kachel = r.width / r.height;
          const sichtbar = echt > kachel ? kachel / echt : echt / kachel;
          werte.push({ datei: img.currentSrc.split("/").pop(), prozent: Math.round(sichtbar * 100) });
        }
        return werte;
      });

      const beschnitten = zuschnitt
        .filter((z) => z.prozent < MINDESTENS_SICHTBAR)
        .sort((a, b) => a.prozent - b.prozent);
      // Der Detailtext wird auch im Erfolgsfall ausgewertet, deshalb muss er
      // ohne Treffer bestehen koennen — sonst wirft die Pruefung genau dann,
      // wenn alles in Ordnung ist.
      const schlechtestes = beschnitten[0];
      pruefe(
        p,
        zuschnitt.length > 0 && beschnitten.length === 0,
        `[${engineName}] Kein Galeriebild wird im Raster beschnitten`,
        zuschnitt.length === 0
          ? "keine Bilder im Spaltensatz gefunden — Selektor oder Layout geaendert"
          : `${beschnitten.length} von ${zuschnitt.length} Bildern zeigen weniger als ` +
            `${MINDESTENS_SICHTBAR} % des Motivs` +
            (schlechtestes
              ? `, schlechtestes: ${schlechtestes.prozent} % (${schlechtestes.datei})`
              : ""),
      );

      // --- Oeffnen ----------------------------------------------------------
      await kacheln.nth(2).click();
      const dialog = seite.locator(".galerie-ansicht");
      const gingAuf = await dialog
        .waitFor({ state: "visible", timeout: 3000 })
        .then(() => true)
        .catch(() => false);

      pruefe(
        p,
        gingAuf,
        `[${engineName}] Klick auf ein Bild oeffnet die Grossansicht`,
        "nach dem Klick erscheint kein Dialog — das Bild baut sich nicht auf",
      );

      if (gingAuf) {
        // --- Vollstaendig sichtbar? ----------------------------------------
        // Der eigentliche Punkt aus Karins Meldung: in der Grossansicht darf
        // nichts mehr abgeschnitten sein.
        const gross = await seite.evaluate(() => {
          const img = document.querySelector(".galerie-buehne img");
          if (!img) return null;
          const r = img.getBoundingClientRect();
          return {
            objectFit: getComputedStyle(img).objectFit,
            echtesVerhaeltnis: img.naturalWidth / img.naturalHeight,
            dargestelltesVerhaeltnis: r.width / r.height,
            passtInsFenster:
              r.width <= window.innerWidth + 1 && r.height <= window.innerHeight + 1,
            breite: Math.round(r.width),
            hoehe: Math.round(r.height),
          };
        });

        pruefe(
          p,
          gross !== null,
          `[${engineName}] Grossansicht zeigt ein Bild`,
          "kein <img> in .galerie-buehne",
        );

        if (gross) {
          // Bei `contain` bleibt das Seitenverhaeltnis erhalten. Weicht das
          // dargestellte Verhaeltnis vom echten ab, ist das Bild verzerrt oder
          // beschnitten.
          const abweichung =
            Math.abs(gross.dargestelltesVerhaeltnis - gross.echtesVerhaeltnis) /
            gross.echtesVerhaeltnis;
          pruefe(
            p,
            abweichung < 0.02,
            `[${engineName}] Grossansicht zeigt das vollstaendige Motiv`,
            `Seitenverhaeltnis weicht um ${Math.round(abweichung * 100)} % ab ` +
              `(echt ${gross.echtesVerhaeltnis.toFixed(2)}, dargestellt ` +
              `${gross.dargestelltesVerhaeltnis.toFixed(2)}) — object-fit ist ` +
              `"${gross.objectFit}"`,
          );

          pruefe(
            p,
            gross.passtInsFenster,
            `[${engineName}] Grossansicht passt ins Fenster`,
            `Bild ist ${gross.breite}x${gross.hoehe} px bei einem Fenster von ` +
              "1280x900 — es ragt hinaus und ist wieder nicht ganz zu sehen",
          );
        }

        // --- Blaettern -------------------------------------------------------
        const vorher = await seite.locator(".galerie-buehne figcaption").innerText();
        await seite.keyboard.press("ArrowRight");
        await seite.waitForTimeout(220);
        const nachher = await seite.locator(".galerie-buehne figcaption").innerText();
        pruefe(
          p,
          vorher !== nachher,
          `[${engineName}] Pfeiltaste blaettert weiter`,
          `Bildnummer bleibt bei "${vorher}"`,
        );

        // --- Schliessen und Fokus --------------------------------------------
        await seite.keyboard.press("Escape");
        await seite.waitForTimeout(220);
        const zu = await dialog.count();
        pruefe(
          p,
          zu === 0,
          `[${engineName}] Escape schliesst die Grossansicht`,
          "Dialog ist nach Escape noch da — der Nutzer kommt nicht zurueck zur Seite",
        );

        const fokus = await seite.evaluate(() => {
          const a = document.activeElement;
          return {
            tag: a?.tagName.toLowerCase() ?? "",
            istKachel: !!a?.classList.contains("galerie-kachel"),
          };
        });
        pruefe(
          p,
          fokus.istKachel,
          `[${engineName}] Fokus liegt nach dem Schliessen wieder auf einer Kachel`,
          `Fokus liegt auf <${fokus.tag || "nichts"}> — mit der Tastatur beginnt ` +
            "die Bedienung wieder ganz oben auf der Seite",
        );
      }

      // --- Tastaturbedienung der Kachel selbst ------------------------------
      const perTastatur = await seite.evaluate(() => {
        const k = document.querySelector(".galerie-kachel");
        return k ? k.tagName.toLowerCase() : "";
      });
      pruefe(
        p,
        perTastatur === "button",
        `[${engineName}] Kacheln sind Knoepfe und damit mit Tabulator erreichbar`,
        `Kachel ist ein <${perTastatur || "nichts"}> — mit der Tastatur nicht ausloesbar`,
      );
    }

    await seite.close();
  }

  await browser.close();
}

bericht(p, "Galerie und Auftrittsorte");
