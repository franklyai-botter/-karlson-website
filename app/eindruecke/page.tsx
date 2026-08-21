import { Foto, SIZES_GALERIE_VOLL } from "../foto";
import { galleryImages } from "../gallery";
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

      <section className="section gallery-grid gallery-grid-full">
        {galleryImages.map((image) => (
          <Foto
            src={image.src}
            alt={image.alt}
            width={900}
            height={1125}
            sizes={SIZES_GALERIE_VOLL}
            key={image.src}
          />
        ))}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Hörproben</span>
            <h2>Videos auf YouTube ansehen.</h2>
          </div>
          <p>
            Die Videos werden erst nach einem Klick auf YouTube geöffnet – so
            werden beim Aufruf dieser Seite keine Daten an YouTube übertragen.
          </p>
        </div>
        <div className="grid-2">
          {youtubeLinks.map((video) => (
            <a
              className="card"
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3>{video.label}</h3>
              <p className="muted">Wird in einem neuen Tab auf YouTube geöffnet.</p>
              <p><strong>Auf YouTube ansehen →</strong></p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
