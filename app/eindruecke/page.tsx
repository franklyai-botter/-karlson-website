import Image from "next/image";
import { galleryImages } from "../gallery";

export const metadata = {
  title: "Eindrücke",
  description: "Fotos und Eindrücke von Karlson: Remise, Gitarre, Bühne und Live-Musik.",
};

export default function EindrueckePage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Eindrücke</span>
          <h1>Karlson live und unterwegs.</h1>
          <p>
            Die Galerie enthält alle gelieferten Fotos. Vor dem Livegang werden
            Nutzungsrechte, Fotografenangaben und erkennbare Personen final geprüft.
          </p>
        </div>
      </section>
      <section className="section gallery-grid gallery-grid-full">
        {galleryImages.map((image) => (
          <Image src={image.src} alt={image.alt} width={900} height={1125} key={image.src} />
        ))}
      </section>
      <section className="split-band">
        <div className="section">
          <div className="notice card">
            <h2>Videos und Hörproben</h2>
            <p>
              YouTube-Videos werden später nur als Link oder mit 2-Klick-Lösung
              eingebunden. Cover-Songs werden nicht selbst gehostet.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
