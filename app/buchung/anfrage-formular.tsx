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

/**
 * Zustand des Spam-Schutzes. Vorher gab es den nicht: schlug Turnstile fehl,
 * blieb an der Stelle eine leere Flaeche von 73px, und der Besucher erfuhr erst
 * beim Absenden aus einer Serverantwort, dass etwas nicht stimmt.
 */
type TurnstileZustand = "aus" | "laedt" | "bereit" | "fehler" | "abgelaufen";

type Felder = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

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

/**
 * Eigene Fehlertexte statt der Browsermeldungen. Grund: die Browsermeldung
 * haengt an Browser und Systemsprache ("Füllen Sie dieses Feld aus."), sie
 * verschwindet nach wenigen Sekunden von selbst, und sie ist fuer
 * Screenreader nicht zuverlaessig abrufbar. Diese Texte stehen dauerhaft am
 * Feld und sind per aria-describedby damit verbunden.
 */
function meldungFuer(el: Felder): string {
  const v = el.validity;
  if (v.valueMissing) {
    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      return "Bitte bestätigen, sonst darf die Anfrage nicht verschickt werden.";
    }
    if (el instanceof HTMLInputElement && el.type === "date") {
      return "Bitte ein Datum angeben — auch ein ungefähres hilft.";
    }
    return "Bitte ausfüllen.";
  }
  if (v.typeMismatch && el instanceof HTMLInputElement && el.type === "email") {
    return "Das sieht nicht wie eine E-Mail-Adresse aus. Beispiel: name@beispiel.de";
  }
  if (v.tooLong) return "Der Text ist zu lang.";
  return "Bitte die Eingabe prüfen.";
}

/**
 * Meldung unter einem Feld. Die id passt zum aria-describedby des Feldes.
 *
 * Bewusst ausserhalb von AnfrageFormular: eine im Render erzeugte Komponente
 * ist bei jedem Render eine neue und wird deshalb aus- und wieder eingehaengt,
 * statt aktualisiert zu werden. Bei einer Fehlermeldung heisst das, dass der
 * Screenreader sie erneut vorliest, obwohl sich nichts geaendert hat. Der
 * Linter besteht zu Recht darauf (react-hooks/static-components).
 */
function Fehler({ fehler, name }: { fehler: Record<string, string>; name: string }) {
  if (!fehler[name]) return null;
  return (
    <span className="feld-fehler" id={`${name}-fehler`}>
      {fehler[name]}
    </span>
  );
}

export function AnfrageFormular() {
  const [zustand, setZustand] = useState<Zustand>("bereit");
  const [meldung, setMeldung] = useState("");
  const [feldFehler, setFeldFehler] = useState<Record<string, string>>({});
  const [turnstileZustand, setTurnstileZustand] = useState<TurnstileZustand>(
    turnstileSitekey ? "laedt" : "aus",
  );
  const turnstileContainer = useRef<HTMLDivElement | null>(null);
  const turnstileToken = useRef("");
  const turnstileWidget = useRef<string | null>(null);
  const erfolgPanel = useRef<HTMLDivElement | null>(null);

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
          setTurnstileZustand("bereit");
        },
        "expired-callback": () => {
          turnstileToken.current = "";
          setTurnstileZustand("abgelaufen");
        },
        "error-callback": () => {
          turnstileToken.current = "";
          setTurnstileZustand("fehler");
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
      vorhanden.addEventListener("error", () => setTurnstileZustand("fehler"));
      return () => vorhanden.removeEventListener("load", widgetRendern);
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = "true";
    script.addEventListener("load", widgetRendern);
    // Blocker, Netzwerkfehler oder eine gesperrte Domain landen hier. Ohne das
    // bliebe die Flaeche stumm leer.
    script.addEventListener("error", () => setTurnstileZustand("fehler"));
    document.head.appendChild(script);

    return () => script.removeEventListener("load", widgetRendern);
  }, []);

  /**
   * Nach dem Absenden verschwindet das Formular und der Erfolgstext erscheint.
   * Der Fokus lag auf dem Absendeknopf, der damit aus dem Dokument fliegt —
   * er faellt dann auf <body>, und wer mit Tastatur oder Screenreader
   * arbeitet, steht ohne Anhaltspunkt am Seitenanfang. Deshalb wandert er
   * hierher. Das loest zugleich das zweite Problem: eine aria-live-Region, die
   * gemeinsam mit ihrem Inhalt neu ins Dokument kommt, wird von
   * Screenreadern oft nicht vorgelesen — ein fokussierter Bereich schon.
   */
  useEffect(() => {
    if (zustand === "erfolg") erfolgPanel.current?.focus();
  }, [zustand]);

  /** Fehler eines Feldes verwerfen, sobald daran gearbeitet wird. */
  function fehlerLoeschen(name: string) {
    setFeldFehler((alt) => {
      if (!alt[name]) return alt;
      const neu = { ...alt };
      delete neu[name];
      return neu;
    });
  }

  async function absenden(ereignis: React.FormEvent<HTMLFormElement>) {
    ereignis.preventDefault();
    if (zustand === "sendet") return;

    const formular = ereignis.currentTarget;

    // Eigene Pruefung, weil das Formular noValidate ist: sonst blockt der
    // Browser das submit-Ereignis und zeigt seine eigene Sprechblase, die
    // dieser Code nie zu sehen bekaeme.
    const gefunden: Record<string, string> = {};
    let ersteUngueltige: Felder | null = null;
    for (const el of formular.querySelectorAll<Felder>("input[name], select[name], textarea[name]")) {
      if (el.name === "webseite") continue; // Honeypot, absichtlich unvalidiert
      if (!el.checkValidity()) {
        gefunden[el.name] = meldungFuer(el);
        if (!ersteUngueltige) ersteUngueltige = el;
      }
    }
    if (ersteUngueltige) {
      setFeldFehler(gefunden);
      setZustand("bereit");
      setMeldung("");
      ersteUngueltige.focus();
      return;
    }
    setFeldFehler({});

    // Ohne Token wuerde der Worker mit 400 antworten. Der Hinweis hier ist
    // konkreter als eine Serverantwort und kommt vor dem Absenden.
    if (turnstileSitekey && !turnstileToken.current) {
      setTurnstileZustand((alt) => (alt === "fehler" ? "fehler" : "abgelaufen"));
      setZustand("fehler");
      setMeldung("Der Spam-Schutz ist noch nicht abgeschlossen. Bitte kurz warten und erneut senden.");
      return;
    }

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
        setTurnstileZustand("laedt");
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
      <div
        className="card form-panel"
        role="status"
        aria-live="polite"
        ref={erfolgPanel}
        tabIndex={-1}
      >
        <span className="eyebrow">Anfrage ist unterwegs</span>
        <h2>Danke – die Anfrage ist bei Karlson.</h2>
        <p>
          Karlson meldet sich in der Regel innerhalb von ein bis zwei Werktagen.
          Wenn es schneller gehen soll, ist ein Anruf der kürzeste Weg:{" "}
          <a href={site.phoneHref}>{site.phone}</a>.
        </p>
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            setZustand("bereit");
            setMeldung("");
            setFeldFehler({});
          }}
        >
          Weitere Anfrage schreiben
        </button>
      </div>
    );
  }

  const sendet = zustand === "sendet";

  /** aria-Attribute, die ein Feld mit seiner Fehlermeldung verbinden. */
  const fehlerAttr = (name: string) =>
    feldFehler[name] ? ({ "aria-invalid": true, "aria-describedby": `${name}-fehler` } as const) : {};

  return (
    <form
      className="card form-panel"
      onSubmit={absenden}
      onInput={(e) => {
        const ziel = e.target as Felder;
        if (ziel?.name) fehlerLoeschen(ziel.name);
      }}
      /* noValidate, weil dieses Formular eigene Fehlermeldungen zeigt: mit der
         Browservalidierung kaeme das submit-Ereignis bei einem leeren
         Pflichtfeld nie an, und der Besucher saehe nur die fluechtige
         Sprechblase des Browsers. Die required-Attribute bleiben stehen —
         checkValidity() im Handler wertet sie aus. */
      noValidate
    >
      <span className="eyebrow">Anfrageformular</span>
      <h2>Auftritt anfragen</h2>
      <p className="muted">
        Felder mit <abbr title="Pflichtfeld">*</abbr> braucht Karlson für ein
        Angebot. Alles andere hilft, ist aber nicht zwingend.
      </p>

      <div className="form-grid form-grid-2">
        <label>
          Name *
          <input name="name" type="text" required maxLength={120} autoComplete="name" {...fehlerAttr("name")} />
          <Fehler fehler={feldFehler} name="name" />
        </label>
        <label>
          E-Mail *
          <input name="email" type="email" required maxLength={200} autoComplete="email" {...fehlerAttr("email")} />
          <Fehler fehler={feldFehler} name="email" />
        </label>
        <label>
          Telefon
          <input name="telefon" type="tel" maxLength={60} autoComplete="tel" {...fehlerAttr("telefon")} />
          <Fehler fehler={feldFehler} name="telefon" />
        </label>
        <label>
          Datum der Veranstaltung *
          <input name="datum" type="date" required {...fehlerAttr("datum")} />
          <Fehler fehler={feldFehler} name="datum" />
        </label>
        <label>
          Veranstaltungsort *
          <input name="ort" type="text" required maxLength={160} placeholder="Ort oder Adresse" {...fehlerAttr("ort")} />
          <Fehler fehler={feldFehler} name="ort" />
        </label>
        <label>
          Anlass *
          <input
            name="anlass"
            type="text"
            required
            maxLength={160}
            placeholder="Stadtfest, Hochzeit, Firmenfeier …"
            {...fehlerAttr("anlass")}
          />
          <Fehler fehler={feldFehler} name="anlass" />
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
        <input name="datenschutz" type="checkbox" required {...fehlerAttr("datenschutz")} />
        <span>
          Ich bin damit einverstanden, dass meine Angaben zur Bearbeitung der
          Anfrage per E-Mail an Karlson übermittelt werden. Details in der{" "}
          <a href="/datenschutz/">Datenschutzerklärung</a>. *
          <Fehler fehler={feldFehler} name="datenschutz" />
        </span>
      </label>

      {turnstileSitekey ? (
        <div className="turnstile-feld">
          <div ref={turnstileContainer} />
          {turnstileZustand === "fehler" ? (
            <p className="feld-fehler" role="alert">
              Der Spam-Schutz konnte nicht geladen werden. Das liegt meist an
              einem Werbeblocker oder einer unterbrochenen Verbindung. Bitte die
              Seite neu laden — oder einfach anrufen:{" "}
              <a href={site.phoneHref}>{site.phone}</a>.
            </p>
          ) : null}
          {turnstileZustand === "abgelaufen" ? (
            <p className="feld-fehler" role="alert">
              Die Prüfung des Spam-Schutzes ist abgelaufen. Sie läuft von selbst
              erneut — bitte einen Moment warten und dann noch einmal senden.
            </p>
          ) : null}
        </div>
      ) : null}

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
