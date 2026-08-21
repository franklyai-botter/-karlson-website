import manifest from "./bilder-manifest.json";

/**
 * Foto mit WebP-Fassungen in mehreren Breiten.
 *
 * Warum nicht `next/image`: der statische Export laeuft mit
 * `images.unoptimized`, dadurch erzeugt next/image kein srcset und liefert
 * immer die Originaldatei aus — auf /eindruecke/ waren das 44 Dateien und
 * rund 14 MB fuer Kacheln, die 266 px breit dargestellt werden.
 *
 * Die WebP-Fassungen stehen in `bilder-manifest.json`, erzeugt von
 * `scripts/bilder-optimieren.mjs` (`npm run bilder:webp`). Steht ein Bild
 * nicht im Manifest — etwa weil Karlson ein neues Foto hinzugefuegt hat, ohne
 * das Skript zu laufen — wird einfach das Original ausgeliefert. Das Bild ist
 * dann nur nicht verkleinert, es fehlt nicht.
 *
 * Das `<img>` innerhalb von `<picture>` traegt weiterhin die Originaldatei als
 * `src`. Das ist der Rueckfall fuer Browser ohne WebP-Unterstuetzung.
 */

const fassungen: Record<string, { pfad: string; breite: number }[]> = manifest;

type FotoProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * Wie breit das Bild dargestellt wird, als `sizes`-Angabe. Ohne diesen Wert
   * nimmt der Browser 100vw an und laedt eine zu grosse Fassung.
   */
  sizes?: string;
  className?: string;
  /**
   * Klasse fuer das umgebende `<picture>`. Nur noetig, wenn das Bild selbst
   * positioniert wird (z. B. das Hero-Hintergrundbild): dann muss das
   * `<picture>` die Positionierung tragen, sonst nimmt es als Grid-Item eine
   * eigene Zelle ein, waehrend das absolut gesetzte `<img>` darin schwebt.
   * Ohne WebP-Fassungen entfaellt das `<picture>` — deshalb steht in
   * globals.css fuer solche Faelle auch eine Regel auf das `<img>`.
   */
  pictureClassName?: string;
  /**
   * Fuer Bilder oberhalb der Faltkante. Schaltet Lazy-Loading ab und bittet
   * den Browser, das Bild vorzuziehen — sonst verzoegert es das LCP.
   */
  priority?: boolean;
};

export function Foto({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  pictureClassName,
  priority = false,
}: FotoProps) {
  const webp = fassungen[src];

  const bild = (
    // eslint-disable-next-line @next/next/no-img-element -- bewusst kein next/image, siehe Kommentar oben
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      // Entlastet den Hauptthread: der Browser darf das Bild nebenlaeufig
      // dekodieren, statt das Rendern dafuer anzuhalten.
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
    />
  );

  if (!webp || webp.length === 0) return bild;

  return (
    <picture className={pictureClassName}>
      <source
        type="image/webp"
        srcSet={webp.map((f) => `${f.pfad} ${f.breite}w`).join(", ")}
        sizes={sizes}
      />
      {bild}
    </picture>
  );
}

/**
 * `sizes` fuer die Galeriekacheln. Aus dem Layout in globals.css abgeleitet,
 * nicht geschaetzt: Container ist `min(1120px, 100% - 40px)`, Abstand 18px.
 *
 * `.gallery-grid-full` (Seite „Eindruecke"): 4 Spalten, ab 960px abwaerts 3,
 * ab 620px abwaerts eine. Bei 1120px Container sind 4 Spalten je 266px breit.
 */
export const SIZES_GALERIE_VOLL =
  "(max-width: 620px) calc(100vw - 28px), (max-width: 960px) 31vw, 266px";

/** `.gallery-grid` (Startseite): 3 Spalten, ab 960px abwaerts 2, ab 620px eine. */
export const SIZES_GALERIE =
  "(max-width: 620px) calc(100vw - 28px), (max-width: 960px) 46vw, 361px";
