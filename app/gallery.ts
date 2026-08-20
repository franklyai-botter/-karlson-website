// Alle 44 Aufnahmen aus public/karlson/gallery-full/ werden gezeigt.
//
// Falls einmal ein Bild raus muss, etwa weil eine abgebildete Person
// widerspricht: die Nummer hier in nichtZeigen eintragen, nicht die Datei
// loeschen. Dann bleibt nachvollziehbar, warum sie fehlt.
//
// Stand 20.08.2026: bei foto-28 ist im Hintergrund Publikum eines oeffentlichen
// Hoffests erkennbar, darunter ein Kind. Bewusst drin gelassen, weil die
// Veranstaltung das Motiv ist und nicht die einzelne Person. Kommt Widerspruch,
// gehoert die 28 in die Liste.
const nichtZeigen = new Set<number>();

export const galleryImages = Array.from({ length: 44 }, (_, index) => index + 1)
  .filter((nummer) => !nichtZeigen.has(nummer))
  .map((nummer) => {
    const number = String(nummer).padStart(2, "0");

    return {
      src: `/karlson/gallery-full/foto-${number}.jpg`,
      alt: `Karlson live und unterwegs, Aufnahme ${nummer}`,
    };
  });
