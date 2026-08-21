import { readdirSync } from "node:fs";
import { join } from "node:path";

// Die Galerie liest den Ordner public/karlson/gallery-full/ beim Build aus.
// Frueher stand hier eine feste Zahl (`{ length: 44 }`) — dadurch war ein neu
// hochgeladenes foto-45.jpg unsichtbar, ohne dass jemand einen Fehler gesehen
// haette. Jetzt gilt: Datei rein, `npm run bilder:webp`, pushen, fertig.
//
// Die Liste entsteht zur Build-Zeit auf dem Server, deshalb ist `node:fs` hier
// erlaubt. Diese Datei darf aus demselben Grund **nicht** in eine
// Client-Komponente importiert werden ("use client").
//
// Falls einmal ein Bild raus muss, etwa weil eine abgebildete Person
// widerspricht: die Nummer in nichtZeigen eintragen, nicht die Datei loeschen.
// Dann bleibt nachvollziehbar, warum sie fehlt.
//
// Stand 20.08.2026: bei foto-28 ist im Hintergrund Publikum eines oeffentlichen
// Hoffests erkennbar, darunter ein Kind. Bewusst drin gelassen, weil die
// Veranstaltung das Motiv ist und nicht die einzelne Person. Kommt Widerspruch,
// gehoert die 28 in die Liste.
const nichtZeigen = new Set<number>();

const GALERIE_ORDNER = join(process.cwd(), "public", "karlson", "gallery-full");

/**
 * Nummer aus einem Dateinamen wie `foto-07.jpg`. Bilder ohne Nummer im Namen
 * werden mitgenommen und hinten einsortiert, damit ein abweichend benanntes
 * Foto nicht stillschweigend verschwindet.
 */
function nummerAus(datei: string): number | null {
  const treffer = datei.match(/(\d+)/);
  return treffer ? Number(treffer[1]) : null;
}

const dateien = readdirSync(GALERIE_ORDNER)
  .filter((datei) => /\.(jpe?g|png)$/i.test(datei))
  .sort((a, b) => {
    const na = nummerAus(a);
    const nb = nummerAus(b);
    if (na !== null && nb !== null) return na - nb;
    if (na !== null) return -1;
    if (nb !== null) return 1;
    return a.localeCompare(b);
  });

export const galleryImages = dateien
  .filter((datei) => {
    const nummer = nummerAus(datei);
    return nummer === null || !nichtZeigen.has(nummer);
  })
  .map((datei) => {
    const nummer = nummerAus(datei);
    return {
      src: `/karlson/gallery-full/${datei}`,
      alt: nummer
        ? `Karlson live und unterwegs, Aufnahme ${nummer}`
        : "Karlson live und unterwegs",
    };
  });
