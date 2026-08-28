import { galerieBilder, SIZES_GALERIE_VOLL } from "../foto";
import { Galerie } from "../galerie";
import { galleryImages } from "../gallery";
import { Video } from "../video";
import { youtubeLinks } from "../data";

export const metadata = {
  title: "Eindrücke",
  description:
    "Fotos und Hörproben von Karlson: Live-Auftritte, Bühne und YouTube-Videos.",
};

export default function EindrueckePage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Eindrücke</span>
          <h1>Karlson live und unterwegs.</h1>
          <p>
            Eindrücke aus Konzerten, von der Bühne und aus dem Havelland –
            ergänzt um Hörproben auf YouTube.
          </p>
        </div>
      </section>

      <section className="section">
        <p className="galerie-hinweis">
          Ein Klick auf ein Bild zeigt es vollständig und in groß.
        </p>
        <Galerie
          bilder={galerieBilder(galleryImages)}
          rasterKlasse="gallery-masonry"
          sizes={SIZES_GALERIE_VOLL}
        />
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Hörproben</span>
            <h2>Videos auf YouTube ansehen.</h2>
          </div>
          <p>
            Die Videos laufen direkt hier auf der Seite. Geladen werden sie
            erst mit einem Klick – beim Aufruf dieser Seite wird noch nichts an
            YouTube übertragen.
          </p>
        </div>
        <div className="grid-2">
          {youtubeLinks.map((video) => (
            <Video
              key={video.id}
              id={video.id}
              label={video.label}
              note={video.note}
              vorschau={video.vorschau}
            />
          ))}
        </div>
        <p className="muted video-kanal">
          Mehr Videos auf{" "}
          <a
            href="https://www.youtube.com/@karlikarlson1967"
            target="_blank"
            rel="noopener noreferrer"
          >
            Karlsons YouTube-Kanal
          </a>
          .
        </p>
      </section>
    </main>
  );
}
