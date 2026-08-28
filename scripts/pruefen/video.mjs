/**
 * Pruefungen fuer die Zwei-Klick-Einbettung der Videos auf /eindruecke/.
 *
 * Die Datenschutzerklaerung sagt in Abschnitt 4 und 6 ausdruecklich zu:
 * *solange nicht auf das Video geklickt wird, besteht keine Verbindung zu
 * Google.* Das ist eine pruefbare Behauptung ueber das Netzwerkverhalten der
 * Seite — und genau die Sorte Behauptung, die still kaputtgeht, wenn jemand
 * spaeter ein Vorschaubild direkt von `i.ytimg.com` einbindet, weil es
 * bequemer ist.
 *
 * Deshalb misst diese Datei nicht, ob das Video „funktioniert", sondern ob der
 * Rechtstext noch stimmt.
 *
 * Gegenprobe (einmal von Hand durchgefuehrt am 28.08.2026): in `app/data.ts`
 * das lokale `vorschau` durch `https://i.ytimg.com/vi/<id>/maxresdefault.jpg`
 * ersetzt, gebaut, geprueft — die Pruefung „Beim Laden geht nichts an Google"
 * schlug an und meldete den Host. Danach zurueckgesetzt.
 */
import { BASIS, bericht, neuesProtokoll, playwrightOderAbbruch, pruefe } from "./lib.mjs";

const pw = playwrightOderAbbruch();
const p = neuesProtokoll();

/**
 * Hosts, die vor dem Klick nicht kontaktiert werden duerfen. `youtube-nocookie`
 * gehoert bewusst dazu — auch das leere Fenster von dort waere schon eine
 * Uebertragung.
 */
const GOOGLE_HOSTS =
  /(^|\.)(youtube\.com|youtube-nocookie\.com|ytimg\.com|googlevideo\.com|google\.com|gstatic\.com|googleapis\.com|doubleclick\.net)$/i;

for (const engineName of ["chromium", "webkit"]) {
  const engine = pw[engineName];
  if (!engine) {
    p.hinweise.push(`${engineName} nicht verfuegbar — uebersprungen`);
    continue;
  }

  const browser = await engine.launch();
  p.engines.add(engineName);
  const seite = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Jede angefragte Adresse mitschreiben, nicht nur die erfolgreichen. Ein
  // blockierter Request waere trotzdem eine Verbindungsaufnahme gewesen.
  const angefragt = [];
  seite.on("request", (r) => angefragt.push(r.url()));

  await seite.goto(`${BASIS}/eindruecke/`, { waitUntil: "networkidle" });
  // Bis ans Seitenende scrollen: die Videokarten liegen unter der Galerie und
  // ihre Bilder sind `loading="lazy"` — ohne Scrollen wuerde ein Vorschaubild
  // von einer fremden Domain gar nicht erst angefordert und die Pruefung waere
  // blind.
  await seite.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await seite.waitForTimeout(1500);

  const anGoogle = angefragt.filter((url) => {
    try {
      return GOOGLE_HOSTS.test(new URL(url).hostname);
    } catch {
      return false;
    }
  });

  pruefe(
    p,
    anGoogle.length === 0,
    `[${engineName}] Beim Laden von /eindruecke/ geht nichts an Google`,
    `${anGoogle.length} Anfrage(n) an ${[
      ...new Set(
        anGoogle.map((u) => {
          try {
            return new URL(u).hostname;
          } catch {
            return u;
          }
        }),
      ),
    ].join(", ")} — die Datenschutzerklaerung sagt in Abschnitt 4 und 6 zu, ` +
      "dass ohne Klick keine Verbindung zu Google besteht",
  );

  // --- Sind ueberhaupt Videos da? -------------------------------------------
  const starter = seite.locator(".video-start");
  const anzahl = await starter.count();

  pruefe(
    p,
    anzahl > 0,
    `[${engineName}] Videos sind als Zwei-Klick-Einbettung vorhanden`,
    "kein .video-start gefunden — entweder fehlen die Videos oder sie fuehren " +
      "wieder per Link weg von der Seite",
  );

  if (anzahl > 0) {
    // --- Vorschaubild vom eigenen Server ------------------------------------
    const vorschau = await seite.evaluate(() =>
      [...document.querySelectorAll(".video-start img")].map((img) => ({
        host: (() => {
          try {
            return new URL(img.currentSrc || img.src, location.href).hostname;
          } catch {
            return "";
          }
        })(),
        geladen: img.naturalWidth > 0,
      })),
    );

    const fremd = vorschau.filter((v) => v.host && v.host !== new URL(BASIS).hostname);
    pruefe(
      p,
      vorschau.length > 0 && fremd.length === 0,
      `[${engineName}] Vorschaubilder liegen auf dem eigenen Server`,
      vorschau.length === 0
        ? "kein Vorschaubild gefunden — die Karte zeigt eine leere Flaeche, " +
          "`npm run video:vorschau` wurde vermutlich nicht gelaufen"
        : `${fremd.length} Vorschaubild(er) von ${[...new Set(fremd.map((f) => f.host))].join(", ")}`,
    );

    pruefe(
      p,
      vorschau.every((v) => v.geladen),
      `[${engineName}] Vorschaubilder werden tatsaechlich angezeigt`,
      `${vorschau.filter((v) => !v.geladen).length} von ${vorschau.length} Bildern ` +
        "haben naturalWidth 0 — die Datei fehlt oder ist kaputt",
    );

    // --- Vor dem Klick kein iframe -------------------------------------------
    const iframesVorher = await seite.locator(".video-karte iframe").count();
    pruefe(
      p,
      iframesVorher === 0,
      `[${engineName}] Vor dem Klick ist kein YouTube-Fenster im Dokument`,
      `${iframesVorher} iframe(s) schon vor dem Klick vorhanden`,
    );

    // --- Klick laedt das Video ------------------------------------------------
    await starter.first().click();
    const rahmen = seite.locator(".video-karte iframe");
    const kam = await rahmen
      .first()
      .waitFor({ state: "attached", timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    pruefe(
      p,
      kam,
      `[${engineName}] Klick laedt das Video auf der Seite`,
      "nach dem Klick erscheint kein iframe — das Video startet nicht",
    );

    if (kam) {
      const quelle = await rahmen.first().getAttribute("src");
      pruefe(
        p,
        (quelle ?? "").includes("youtube-nocookie.com"),
        `[${engineName}] Video laeuft ueber youtube-nocookie.com`,
        `iframe-Quelle ist "${quelle}" — die nocookie-Domain setzt erst beim ` +
          "Abspielen Cookies, die normale youtube.com schon beim Laden",
      );

      // Der Punkt, an dem Karlsons Frage haengt: der Besucher soll auf der
      // Website bleiben und nicht bei YouTube landen.
      const urlNachKlick = seite.url();
      pruefe(
        p,
        urlNachKlick.includes(new URL(BASIS).hostname),
        `[${engineName}] Der Besucher bleibt nach dem Klick auf der Website`,
        `Adresse nach dem Klick: ${urlNachKlick} — das Video fuehrt weg, ` +
          "statt hier abzuspielen",
      );
    }
  }

  await seite.close();
  await browser.close();
}

bericht(p, "Videos: Zwei-Klick-Einbettung");
