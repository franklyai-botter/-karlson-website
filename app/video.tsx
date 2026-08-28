"use client";

import { useState } from "react";

/**
 * Video mit Zwei-Klick-Einbettung.
 *
 * Beim Aufruf der Seite passiert nichts: zu sehen ist ein Vorschaubild, das aus
 * dem eigenen Verzeichnis kommt. Erst der Klick laedt das YouTube-Fenster nach.
 * Bis dahin geht **keine** Verbindung zu Google — kein Bild, kein Skript, kein
 * Cookie. Genau das sagt die Datenschutzerklaerung zu, und deshalb darf das
 * Vorschaubild auch nicht von `i.ytimg.com` kommen.
 *
 * Warum ueberhaupt einbetten statt verlinken: Karlson hatte am 26.08.2026
 * gefragt, wie man von seinen YouTube-Videos auf die Website zurueckkommt. Der
 * bisherige Weg fuehrte per `target="_blank"` zu YouTube und dort in dessen
 * Empfehlungen — der Besucher kam nicht wieder. Jetzt bleibt er hier.
 *
 * `youtube-nocookie.com` statt `youtube.com`: die Domain setzt erst beim
 * Abspielen Cookies statt schon beim Laden des Fensters.
 */

type Props = {
  id: string;
  label: string;
  note?: string;
  vorschau?: string;
};

export function Video({ id, label, note, vorschau }: Props) {
  const [laeuft, setLaeuft] = useState(false);

  if (laeuft) {
    return (
      <figure className="video-karte video-karte-laeuft">
        <div className="video-rahmen">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={`${label} – Video auf YouTube`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <figcaption>
          <strong>{label}</strong>
          {note ? <span className="muted"> – {note}</span> : null}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="video-karte">
      {/* Bewusst **ohne** `aria-label`: der Knopf enthaelt seinen Namen schon
          sichtbar — Titel, Zusatz und den Hinweis auf das Nachladen. Ein
          zusaetzliches Label wuerde diesen Text ueberschreiben und muesste ihn
          nach WCAG 2.5.3 („Label in Name") vollstaendig enthalten. Ein erster
          Entwurf tat das nicht; der Pruefharness hat es gemeldet. */}
      <button type="button" className="video-start" onClick={() => setLaeuft(true)}>
        <span className="video-rahmen">
          {vorschau ? (
            // eslint-disable-next-line @next/next/no-img-element -- bewusst kein next/image, siehe foto.tsx
            <img src={vorschau} alt="" width={1280} height={720} loading="lazy" decoding="async" />
          ) : (
            // Fehlt das Vorschaubild, bleibt die Flaeche leer statt ein Bild von
            // YouTube nachzuladen. Abhilfe: `npm run video:vorschau`.
            <span className="video-ohne-bild" aria-hidden="true" />
          )}
          <span className="video-knopf" aria-hidden="true">
            <svg viewBox="0 0 68 48" width="54" height="38" focusable="false">
              <path
                d="M66.5 7.7c-.8-2.9-2.5-5.2-5.4-6C55.8.2 34 .2 34 .2S12.2.2 6.9 1.7C4 2.5 2.3 4.8 1.5 7.7 0 13 0 24 0 24s0 11 1.5 16.3c.8 2.9 2.5 5.2 5.4 6C12.2 47.8 34 47.8 34 47.8s21.8 0 27.1-1.5c2.9-.8 4.6-3.1 5.4-6C68 35 68 24 68 24s0-11-1.5-16.3z"
                fill="#d0342c"
              />
              <path d="M27 34V14l18 10-18 10z" fill="#fff" />
            </svg>
          </span>
        </span>
        <span className="video-text">
          <strong>{label}</strong>
          {note ? <span className="muted"> – {note}</span> : null}
          <span className="video-hinweis">
            Klick lädt das Video von YouTube. Vorher wird nichts übertragen.
          </span>
        </span>
      </button>
    </figure>
  );
}
