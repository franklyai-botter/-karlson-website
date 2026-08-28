"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GalerieBild } from "./foto";

/**
 * Galerie mit Grossansicht.
 *
 * Anlass: Karin hat am 26.08.2026 gemeldet, dass sich die Bilder auf
 * /eindruecke/ beim Anklicken „nicht aufbauen" und „mitunter nicht alles auf
 * dem Bild zu sehen" ist. Nachgemessen an der Live-Seite: 40 Bilder, davon
 * **null** anklickbar, und `object-fit: cover` schnitt bei 19 von 40 Bildern
 * mehr als 20 % des Motivs ab — im schlimmsten Fall waren nur 45 % zu sehen.
 * Beides trifft zu, es war kein Bedienfehler.
 *
 * Die Kacheln sind bewusst `<button>` und nicht `<div onClick>`: nur dann sind
 * sie mit Tabulator erreichbar und mit Leertaste/Enter ausloesbar. Fuer
 * Karlsons Publikum ist das kein Randfall — ein Teil davon bedient die Seite
 * mit vergroesserter Schrift und Tastatur.
 */

type Props = {
  bilder: GalerieBild[];
  /** Klasse fuer das Raster, z. B. `gallery-grid` oder `gallery-masonry`. */
  rasterKlasse: string;
  /** `sizes` fuer die Kacheln. */
  sizes: string;
  /**
   * Bei `true` behaelt die Kachel ihr 4/5-Raster (`object-fit: cover`). Das ist
   * die Vorschau auf der Startseite, wo ein ruhiges Raster mehr zaehlt als das
   * vollstaendige Motiv — der Klick zeigt es ohnehin ungeschnitten.
   */
  zugeschnitten?: boolean;
};

export function Galerie({ bilder, rasterKlasse, sizes, zugeschnitten = false }: Props) {
  const [offen, setOffen] = useState<number | null>(null);
  const kacheln = useRef<(HTMLButtonElement | null)[]>([]);
  const dialog = useRef<HTMLDivElement>(null);
  const schliessenKnopf = useRef<HTMLButtonElement>(null);
  /** Index der Kachel, die die Ansicht geoeffnet hat — dorthin geht der Fokus zurueck. */
  const ausloeser = useRef<number | null>(null);

  const oeffnen = useCallback((index: number) => {
    ausloeser.current = index;
    setOffen(index);
  }, []);

  const schliessen = useCallback(() => {
    setOffen(null);
    // Fokus zurueck auf die Kachel, aus der heraus geoeffnet wurde. Ohne das
    // faellt er auf <body> und die Tastaturbedienung beginnt wieder ganz oben.
    const zurueck = ausloeser.current;
    if (zurueck !== null) {
      requestAnimationFrame(() => kacheln.current[zurueck]?.focus());
    }
  }, []);

  const blaettern = useCallback(
    (richtung: 1 | -1) => {
      setOffen((aktuell) => {
        if (aktuell === null) return aktuell;
        const naechster = (aktuell + richtung + bilder.length) % bilder.length;
        ausloeser.current = naechster;
        return naechster;
      });
    },
    [bilder.length],
  );

  // Tastatur: Escape schliesst, Pfeile blaettern, Tab bleibt im Dialog.
  useEffect(() => {
    if (offen === null) return;

    function beiTaste(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        schliessen();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        blaettern(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        blaettern(-1);
        return;
      }
      if (e.key !== "Tab") return;

      // Fokusfalle. Ohne sie wandert der Tabulator hinter den Dialog in die
      // Seite darunter, die fuer den Nutzer gar nicht sichtbar ist.
      const ziele = dialog.current?.querySelectorAll<HTMLElement>("button");
      if (!ziele || ziele.length === 0) return;
      const erstes = ziele[0];
      const letztes = ziele[ziele.length - 1];
      if (e.shiftKey && document.activeElement === erstes) {
        e.preventDefault();
        letztes.focus();
      } else if (!e.shiftKey && document.activeElement === letztes) {
        e.preventDefault();
        erstes.focus();
      }
    }

    document.addEventListener("keydown", beiTaste);
    return () => document.removeEventListener("keydown", beiTaste);
  }, [offen, schliessen, blaettern]);

  // Seite darunter festhalten. Der Ausgleich per padding-right verhindert, dass
  // das Layout um die Scrollbar-Breite springt, sobald sie verschwindet.
  useEffect(() => {
    if (offen === null) return;
    const koerper = document.body;
    const vorherOverflow = koerper.style.overflow;
    const vorherPadding = koerper.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    koerper.style.overflow = "hidden";
    if (scrollbar > 0) koerper.style.paddingRight = `${scrollbar}px`;
    return () => {
      koerper.style.overflow = vorherOverflow;
      koerper.style.paddingRight = vorherPadding;
    };
  }, [offen]);

  // Fokus in den Dialog, sobald er aufgeht.
  useEffect(() => {
    if (offen === null) return;
    schliessenKnopf.current?.focus();
  }, [offen]);

  // Wischen auf dem Handy. 40 Bilder mit Pfeilknoepfen durchzutippen ist auf
  // einem Telefon muehsam; die Geste ist dort die erwartete Bedienung.
  const wischStart = useRef<{ x: number; y: number } | null>(null);

  function beiTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    wischStart.current = { x: t.clientX, y: t.clientY };
  }

  function beiTouchEnd(e: React.TouchEvent) {
    const start = wischStart.current;
    wischStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Nur waagerechte Gesten zaehlen, und erst ab 50px — sonst blaettert schon
    // ein leichtes Zittern beim Antippen weiter.
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    blaettern(dx < 0 ? 1 : -1);
  }

  const aktuell = offen === null ? null : bilder[offen];

  return (
    <>
      <div className={rasterKlasse}>
        {bilder.map((bild, index) => (
          <button
            type="button"
            className={
              zugeschnitten ? "galerie-kachel galerie-kachel-zuschnitt" : "galerie-kachel"
            }
            key={bild.src}
            ref={(el) => {
              kacheln.current[index] = el;
            }}
            onClick={() => oeffnen(index)}
            aria-label={`${bild.alt} – Bild ${index + 1} von ${bilder.length} groß ansehen`}
          >
            {bild.kachelSrcSet ? (
              <picture>
                <source type="image/webp" srcSet={bild.kachelSrcSet} sizes={sizes} />
                <img src={bild.src} alt={bild.alt} loading="lazy" decoding="async" />
              </picture>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- bewusst kein next/image, siehe foto.tsx
              <img src={bild.src} alt={bild.alt} loading="lazy" decoding="async" />
            )}
            <span className="galerie-lupe" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" focusable="false">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M15.8 15.8 21 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M11 8.4v5.2M8.4 11h5.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {aktuell !== null && offen !== null && (
        <div
          className="galerie-ansicht"
          role="dialog"
          aria-modal="true"
          aria-label={`Bildansicht: ${aktuell.alt}`}
          ref={dialog}
          // Klick auf den Hintergrund schliesst. Der Vergleich auf currentTarget
          // sorgt dafuer, dass ein Klick auf das Bild selbst nichts ausloest.
          onClick={(e) => {
            if (e.target === e.currentTarget) schliessen();
          }}
          onTouchStart={beiTouchStart}
          onTouchEnd={beiTouchEnd}
        >
          <button
            type="button"
            className="galerie-schliessen"
            onClick={schliessen}
            ref={schliessenKnopf}
            aria-label="Bildansicht schließen"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {bilder.length > 1 && (
            <button
              type="button"
              className="galerie-blaettern galerie-zurueck"
              onClick={() => blaettern(-1)}
              aria-label="Vorheriges Bild"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
                <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <figure className="galerie-buehne">
            {aktuell.grossSrcSet ? (
              <picture>
                <source type="image/webp" srcSet={aktuell.grossSrcSet} sizes="100vw" />
                <img src={aktuell.src} alt={aktuell.alt} decoding="async" />
              </picture>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- bewusst kein next/image, siehe foto.tsx
              <img src={aktuell.src} alt={aktuell.alt} decoding="async" />
            )}
            <figcaption>
              Bild {offen + 1} von {bilder.length}
            </figcaption>
          </figure>

          {bilder.length > 1 && (
            <button
              type="button"
              className="galerie-blaettern galerie-vor"
              onClick={() => blaettern(1)}
              aria-label="Nächstes Bild"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
                <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
