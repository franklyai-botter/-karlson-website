"use client";

import { useEffect, useRef, useState } from "react";
import { programs, site } from "../data";

/**
 * Anfrageformular. Sendet an den Worker unter /api/contact (siehe
 * worker/index.js), der die Anfrage per Mailjet an Karlsons Postfach
 * weiterleitet. Es wird nichts gespeichert.
 *
 * Die Felder entsprechen der Checkliste auf dieser Seite — genau die Angaben,
 * die Karlson braucht, um ohne Rueckfrage ein Angebot zu machen.
 */

// Sitekey ist oeffentlich und darf im HTML stehen (das Secret liegt im Worker).
// Ist er nicht gesetzt, wird Turnstile komplett weggelassen: dann laedt die
// Seite auch kein Cloudflare-Script und es geht kein Request an Dritte.
const turnstileSitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY ?? "";

type Zustand = "bereit" | "sendet" | "erfolg" | "fehler";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        optionen: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          language?: string;
          theme?: string;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function AnfrageFormular() {
  const [zustand, setZustand] = useState<Zustand>("bereit");
  const [meldung, setMeldung] = useState("");
  const turnstileContainer = useRef<HTMLDivElement | null>(null);
  const turnstileToken = useRef("");
  const turnstileWidget = useRef<string | null>(null);

  // Turnstile erst nach dem Mounten laden, und nur wenn ein Sitekey da ist.
  useEffect(() => {
    if (!turnstileSitekey || !turnstileContainer.current) return;

    const container = turnstileContainer.current;

    function widgetRendern() {
      if (!window.turnstile || turnstileWidget.current !== null) return;
      turnstileWidget.current = window.turnstile.render(container, {
        sitekey: turnstileSitekey,
        language: "de",
        callback: (token: string) => {
          turnstileToken.current = token;
        },
        "expired-callback": () => {
          turnstileToken.current = "";
        },
        "error-callback": () => {
          turnstileToken.current = "";
        },
      });
    }

    if (window.turnstile) {
      widgetRendern();
      return;
    }

    // Script nur einmal einhaengen, auch wenn die Komponente neu mountet.
    const vorhanden = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    if (vorhanden) {
      vorhanden.addEventListener("load", widgetRendern);
      return () => vorhanden.removeEventListener("load", widgetRendern);
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = "true";
    script.addEventListener("load", widgetRendern);
    document.head.appendChild(script);

    return () => script.removeEventListener("load", widgetRendern);
  }, []);

  async function absenden(ereignis: React.FormEvent<HTMLFormElement>) {
    ereignis.preventDefault();
    if (zustand === "sendet") return;

    const formular = ereignis.currentTarget;
    const eingaben = new FormData(formular);

    const nutzlast: Record<string, string | boolean> = {
      datenschutz: eingaben.get("datenschutz") === "on",
      turnstileToken: turnstileToken.current,
    };
    for (const [schluessel, wert] of eingaben.entries()) {
      if (schluessel === "datenschutz") continue;
      nutzlast[schluessel] = typeof wert === "string" ? wert : "";
    }

    setZustand("sendet");
    setMeldung("");

    try {
      const antwort = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(nutzlast),
      });
      const ergebnis = await antwort.json().catch(() => ({}));

      if (antwort.ok && ergebnis.ok) {
        setZustand("erfolg");
        formular.reset();
        return;
      }

      setZustand("fehler");
      setMeldung(
        typeof ergebnis.fehler === "string"
          ? ergebnis.fehler
          : "Die Anfrage konnte nicht gesendet werden. Bitte per Telefon oder E-Mail versuchen.",
      );
      // Ein verbrauchtes Turnstile-Token gilt nicht zweimal.
      if (window.turnstile && turnstileWidget.current !== null) {
        window.turnstile.reset(turnstileWidget.current);
        turnstileToken.current = "";
      }
    } catch {
      setZustand("fehler");
      setMeldung(
        "Keine Verbindung zum Server. Bitte Internetverbindung pruefen oder direkt anrufen.",
      );
    }
  }

  if (zustand === "erfolg") {
    return (
      <div className="card form-panel" role="status" aria-live="polite">
        <span className="eyebrow">Anfrage ist unterwegs</span>
        <h2>Danke – die Anfrage ist bei Karlson.</h2>
        <p>
          Karlson meldet sich in der Regel innerhalb von ein bis zwei Werktagen.
          Wenn es schneller gehen soll, ist ein Anruf der kürzeste Weg:{" "}
          <a href={site.phoneHref}>{site.phone}</a>.
        </p>
        <button className="button secondary" type="button" onClick={() => setZustand("bereit")}>
          Weitere Anfrage schreiben
        </button>
      </div>
    );
  }

  const sendet = zustand === "sendet";

  return (
    <form className="card form-panel" onSubmit={absenden} noValidate={false}>
      <span className="eyebrow">Anfrageformular</span>
      <h2>Auftritt anfragen</h2>
      <p className="muted">
        Felder mit <abbr title="Pflichtfeld">*</abbr> braucht Karlson für ein
        Angebot. Alles andere hilft, ist aber nicht zwingend.
      </p>

      <div className="form-grid form-grid-2">
        <label>
          Name *
          <input name="name" type="text" required maxLength={120} autoComplete="name" />
        </label>
        <label>
          E-Mail *
          <input name="email" type="email" required maxLength={200} autoComplete="email" />
        </label>
        <label>
          Telefon
          <input name="telefon" type="tel" maxLength={60} autoComplete="tel" />
        </label>
        <label>
          Datum der Veranstaltung *
          <input name="datum" type="date" required />
        </label>
        <label>
          Veranstaltungsort *
          <input name="ort" type="text" required maxLength={160} placeholder="Ort oder Adresse" />
        </label>
        <label>
          Anlass *
          <input
            name="anlass"
            type="text"
            required
            maxLength={160}
            placeholder="Stadtfest, Hochzeit, Firmenfeier …"
          />
        </label>
        <label>
          Wunschprogramm
          <select name="programm" defaultValue="">
            <option value="">Noch offen / bitte beraten</option>
            {programs.map((programm) => (
              <option key={programm.title} value={programm.title}>
                {programm.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Gewünschte Dauer
          <input name="dauer" type="text" maxLength={80} placeholder="z. B. 2 Stunden" />
        </label>
        <label>
          Erwartete Gästezahl
          <input name="gaeste" type="text" inputMode="numeric" maxLength={40} placeholder="z. B. 80" />
        </label>
        <label>
          Drinnen oder Open-Air
          <select name="draussen" defaultValue="">
            <option value="">Noch offen</option>
            <option value="Drinnen">Drinnen</option>
            <option value="Open-Air">Open-Air</option>
            <option value="Beides möglich">Beides möglich</option>
          </select>
        </label>
      </div>

      <label>
        Nachricht
        <textarea
          name="nachricht"
          maxLength={4000}
          placeholder="Was ist geplant? Gibt es Besonderheiten, Wunschlieder oder Fragen zur Technik?"
        />
      </label>

      {/*
        Honeypot. Für Menschen unsichtbar und aus dem Tab-Fluss genommen,
        für Bots ein weiteres Feld, das sie brav ausfüllen. Nicht per
        display:none versteckt — manche Bots erkennen das.
      */}
      <div className="honeypot" aria-hidden="true">
        <label>
          Webseite
          <input name="webseite" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="checkbox-zeile">
        <input name="datenschutz" type="checkbox" required />
        <span>
          Ich bin damit einverstanden, dass meine Angaben zur Bearbeitung der
          Anfrage per E-Mail an Karlson übermittelt werden. Details in der{" "}
          <a href="/datenschutz/">Datenschutzerklärung</a>. *
        </span>
      </label>

      {turnstileSitekey ? <div ref={turnstileContainer} className="turnstile-feld" /> : null}

      <div className="actions">
        <button className="button" type="submit" disabled={sendet}>
          {sendet ? "Wird gesendet …" : "Anfrage senden"}
        </button>
        <a className="button secondary" href={site.phoneHref}>
          Lieber anrufen
        </a>
      </div>

      {/* aria-live: Screenreader lesen die Meldung vor, ohne den Fokus zu ziehen. */}
      <p className="form-status" role="status" aria-live="polite">
        {zustand === "fehler" ? <strong className="form-fehler">{meldung}</strong> : null}
      </p>
    </form>
  );
}
