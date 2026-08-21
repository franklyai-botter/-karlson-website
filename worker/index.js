/**
 * Cloudflare Worker neben den statischen Assets.
 *
 * Die Website selbst ist ein statischer Export (`next build` -> ./out) und wird
 * von Cloudflare direkt als Asset ausgeliefert. Dieser Worker laeuft laut
 * `wrangler.jsonc` nur fuer `/api/*` (run_worker_first). Alles andere kommt
 * hier gar nicht an; der ASSETS-Fallback unten ist reine Absicherung, falls
 * die Routing-Regel einmal veraendert wird.
 *
 * Bewusst JavaScript und nicht TypeScript: `tsconfig.json` zieht mit
 * `**\/*.ts` das ganze Projekt in die Next-Typpruefung. Ein Worker-TS dort
 * braucht Cloudflare-Typen, sonst bricht `next build` — und damit Karlsons
 * Auto-Deploy. Eine .js-Datei laesst Next unberuehrt. Typen stehen als JSDoc.
 *
 * Der Worker speichert nichts. Die Formulardaten gehen einmal durch den
 * Speicher und per HTTPS an Mailjet, danach sind sie weg.
 *
 * @typedef {object} Env
 * @property {Fetcher} ASSETS               Binding auf die statischen Assets.
 * @property {string} [MAILJET_API_KEY]     Mailjet API Key (Secret).
 * @property {string} [MAILJET_SECRET_KEY]  Mailjet Secret Key (Secret).
 * @property {string} [MAIL_FROM]           Absender, muss bei Mailjet verifiziert sein.
 * @property {string} [MAIL_TO]             Empfaenger (Karlsons Postfach).
 * @property {string} [TURNSTILE_SECRET_KEY] Turnstile Secret (Secret).
 * @property {string} [MAIL_DRY_RUN]        "1" = nicht senden, nur ins Log schreiben.
 * @property {string} [ERLAUBTE_HOSTS]      Kommaliste zusaetzlicher Hosts fuer den Origin-Check.
 */

const MAILJET_ENDPOINT = "https://api.mailjet.com/v3.1/send";
const TURNSTILE_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Groesster akzeptierter Request-Body. Eine Anfrage mit Nachricht liegt bei
// wenigen KB; alles darueber ist entweder ein Fehler oder ein Angriff.
const MAX_BODY_BYTES = 16 * 1024;

/**
 * Felder des Anfrageformulars.
 *
 * `pflicht` steuert die serverseitige Pruefung — auf die Browser-Validierung
 * ist kein Verlass, die laesst sich mit zwei Zeilen Devtools umgehen.
 * `max` begrenzt die Laenge, damit niemand die Mail als Datentransport nutzt.
 */
const FELDER = [
  { name: "name", label: "Name", pflicht: true, max: 120 },
  { name: "email", label: "E-Mail", pflicht: true, max: 200 },
  { name: "telefon", label: "Telefon", pflicht: false, max: 60 },
  { name: "datum", label: "Datum", pflicht: true, max: 40 },
  { name: "ort", label: "Veranstaltungsort", pflicht: true, max: 160 },
  { name: "anlass", label: "Anlass", pflicht: true, max: 160 },
  { name: "programm", label: "Wunschprogramm", pflicht: false, max: 160 },
  { name: "dauer", label: "Gewuenschte Dauer", pflicht: false, max: 80 },
  { name: "gaeste", label: "Erwartete Gaestezahl", pflicht: false, max: 40 },
  { name: "draussen", label: "Drinnen oder Open-Air", pflicht: false, max: 40 },
  { name: "nachricht", label: "Nachricht", pflicht: false, max: 4000 },
];

/** Feldname des Honeypots. Echte Menschen sehen das Feld nicht. */
const HONEYPOT = "webseite";

const worker = {
  /**
   * @param {Request} request
   * @param {Env} env
   * @returns {Promise<Response>}
   */
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method === "OPTIONS") {
        // Kein CORS-Preflight erwartet (gleiche Origin), aber eine saubere
        // Antwort ist besser als ein 405 im Browser-Log.
        return new Response(null, { status: 204, headers: { Allow: "POST" } });
      }
      if (request.method !== "POST") {
        return jsonAntwort({ ok: false, fehler: "Nur POST." }, 405, { Allow: "POST" });
      }
      return anfrageVerarbeiten(request, env);
    }

    // Absicherung: normalerweise erreicht kein anderer Pfad diesen Worker.
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  },
};

export default worker;

/**
 * @param {Request} request
 * @param {Env} env
 * @returns {Promise<Response>}
 */
async function anfrageVerarbeiten(request, env) {
  // 1. Nur Anfragen von der eigenen Seite. Haelt fremde Formulare ab, die
  //    diesen Endpunkt als Gratis-Mailversand missbrauchen wollen.
  if (!originErlaubt(request, env)) {
    return jsonAntwort({ ok: false, fehler: "Anfrage kommt nicht von dieser Website." }, 403);
  }

  // 2. Body lesen, mit Deckel. `Content-Length` kann luegen, deshalb wird die
  //    tatsaechlich gelesene Laenge unten noch einmal geprueft.
  const laengeHeader = Number(request.headers.get("content-length") ?? "0");
  if (laengeHeader > MAX_BODY_BYTES) {
    return jsonAntwort({ ok: false, fehler: "Anfrage zu gross." }, 413);
  }

  let rohtext;
  try {
    rohtext = await request.text();
  } catch {
    return jsonAntwort({ ok: false, fehler: "Anfrage konnte nicht gelesen werden." }, 400);
  }
  if (rohtext.length > MAX_BODY_BYTES) {
    return jsonAntwort({ ok: false, fehler: "Anfrage zu gross." }, 413);
  }

  let daten;
  try {
    daten = JSON.parse(rohtext);
  } catch {
    return jsonAntwort({ ok: false, fehler: "Anfrage war kein gueltiges JSON." }, 400);
  }
  if (typeof daten !== "object" || daten === null) {
    return jsonAntwort({ ok: false, fehler: "Anfrage war kein gueltiges JSON." }, 400);
  }

  // 3. Honeypot. Bots fuellen jedes Feld aus, das sie finden. Antwort ist
  //    bewusst ein Erfolg: wer merkt, dass er erkannt wurde, versucht es anders.
  if (typeof daten[HONEYPOT] === "string" && daten[HONEYPOT].trim() !== "") {
    return jsonAntwort({ ok: true }, 200);
  }

  // 4. Turnstile. Nur pruefen, wenn ein Secret hinterlegt ist — so laesst sich
  //    das Formular auch ohne Turnstile betreiben und spaeter scharfstellen,
  //    ohne den Code anzufassen.
  if (env.TURNSTILE_SECRET_KEY) {
    const token = typeof daten.turnstileToken === "string" ? daten.turnstileToken : "";
    if (!token) {
      return jsonAntwort({ ok: false, fehler: "Spam-Schutz nicht bestaetigt. Bitte Seite neu laden." }, 400);
    }
    const bestanden = await turnstilePruefen(token, env.TURNSTILE_SECRET_KEY, request);
    if (!bestanden) {
      return jsonAntwort({ ok: false, fehler: "Spam-Schutz fehlgeschlagen. Bitte Seite neu laden." }, 403);
    }
  }

  // 5. Datenschutz-Zustimmung. Ohne sie gibt es keine Rechtsgrundlage.
  if (daten.datenschutz !== true) {
    return jsonAntwort({ ok: false, fehler: "Bitte den Datenschutzhinweis bestaetigen." }, 400);
  }

  // 6. Felder pruefen und normalisieren.
  const { werte, fehlend } = felderPruefen(daten);
  if (fehlend.length > 0) {
    return jsonAntwort(
      { ok: false, fehler: `Bitte ausfuellen: ${fehlend.join(", ")}.`, felder: fehlend },
      400,
    );
  }
  if (!istEmail(werte.email)) {
    return jsonAntwort({ ok: false, fehler: "Bitte eine gueltige E-Mail-Adresse angeben.", felder: ["email"] }, 400);
  }

  // 7. Versandkonfiguration. Fehlt sie, ist das ein Konfigurationsfehler und
  //    kein Nutzerfehler — deshalb 503 und eine Meldung, die auf Telefon und
  //    E-Mail verweist statt den Absender im Dunkeln zu lassen.
  const absender = env.MAIL_FROM;
  const empfaenger = env.MAIL_TO;
  const trockenlauf = env.MAIL_DRY_RUN === "1";

  if (!absender || !empfaenger || (!trockenlauf && (!env.MAILJET_API_KEY || !env.MAILJET_SECRET_KEY))) {
    console.error("Versand nicht konfiguriert: MAIL_FROM/MAIL_TO/MAILJET_* pruefen.");
    return jsonAntwort(
      {
        ok: false,
        fehler: "Der Formularversand ist gerade nicht verfuegbar. Bitte per Telefon oder E-Mail anfragen.",
      },
      503,
    );
  }

  const mail = mailBauen(werte, absender, empfaenger);

  if (trockenlauf) {
    // Trockenlauf fuer lokale Tests: die ganze Kette laeuft, nur der letzte
    // HTTP-Hop zu Mailjet entfaellt. Aktiviert ueber MAIL_DRY_RUN=1.
    console.log("[TROCKENLAUF] Mail waere gesendet:", JSON.stringify(mail, null, 2));
    return jsonAntwort({ ok: true, trockenlauf: true }, 200);
  }

  try {
    const antwort = await fetch(MAILJET_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // Mailjet Send API v3.1: HTTP Basic Auth, API Key als Benutzername,
        // Secret Key als Passwort.
        authorization: "Basic " + btoa(`${env.MAILJET_API_KEY}:${env.MAILJET_SECRET_KEY}`),
      },
      body: JSON.stringify(mail),
    });

    if (!antwort.ok) {
      // Mailjets Fehlertext gehoert ins Log, nicht in die Antwort an den
      // Besucher — er kann Kontodetails enthalten.
      const text = await antwort.text();
      console.error(`Mailjet antwortete ${antwort.status}: ${text.slice(0, 500)}`);
      return jsonAntwort(
        {
          ok: false,
          fehler: "Die Anfrage konnte nicht versendet werden. Bitte per Telefon oder E-Mail anfragen.",
        },
        502,
      );
    }

    return jsonAntwort({ ok: true }, 200);
  } catch (fehler) {
    console.error("Mailjet nicht erreichbar:", fehler instanceof Error ? fehler.message : fehler);
    return jsonAntwort(
      {
        ok: false,
        fehler: "Die Anfrage konnte nicht versendet werden. Bitte per Telefon oder E-Mail anfragen.",
      },
      502,
    );
  }
}

/**
 * Prueft, ob die Anfrage von der eigenen Website kommt.
 *
 * Gewertet wird der Origin-Header, ersatzweise der Referer. Erlaubt sind der
 * Host der Anfrage selbst (deckt die echte Domain und die workers.dev-Adresse
 * ab), localhost fuer die Entwicklung und alles aus ERLAUBTE_HOSTS.
 *
 * @param {Request} request
 * @param {Env} env
 * @returns {boolean}
 */
function originErlaubt(request, env) {
  const eigenerHost = new URL(request.url).host;
  const erlaubt = new Set([eigenerHost]);

  for (const eintrag of (env.ERLAUBTE_HOSTS ?? "").split(",")) {
    const host = eintrag.trim();
    if (host) erlaubt.add(host);
  }

  const herkunft = request.headers.get("origin") ?? request.headers.get("referer");
  if (!herkunft) {
    // Browser senden bei same-origin POST mit JSON-Body immer einen Origin.
    // Fehlt er, ist es kein normaler Formularabsender.
    return false;
  }

  let host;
  try {
    host = new URL(herkunft).host;
  } catch {
    return false;
  }

  if (erlaubt.has(host)) return true;
  // `wrangler dev` laeuft auf einem wechselnden Port.
  return host === "localhost" || host.startsWith("localhost:") || host.startsWith("127.0.0.1");
}

/**
 * @param {string} token
 * @param {string} secret
 * @param {Request} request
 * @returns {Promise<boolean>}
 */
async function turnstilePruefen(token, secret, request) {
  const formular = new FormData();
  formular.append("secret", secret);
  formular.append("response", token);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) formular.append("remoteip", ip);

  try {
    const antwort = await fetch(TURNSTILE_ENDPOINT, { method: "POST", body: formular });
    if (!antwort.ok) {
      console.error(`Turnstile antwortete ${antwort.status}`);
      return false;
    }
    const ergebnis = await antwort.json();
    if (!ergebnis.success) {
      console.error("Turnstile abgelehnt:", JSON.stringify(ergebnis["error-codes"] ?? []));
    }
    return ergebnis.success === true;
  } catch (fehler) {
    console.error("Turnstile nicht erreichbar:", fehler instanceof Error ? fehler.message : fehler);
    return false;
  }
}

/**
 * Liest die bekannten Felder aus dem Body, kuerzt sie auf ihre Maximallaenge
 * und meldet fehlende Pflichtfelder zurueck.
 *
 * @param {Record<string, unknown>} daten
 * @returns {{ werte: Record<string, string>, fehlend: string[] }}
 */
function felderPruefen(daten) {
  /** @type {Record<string, string>} */
  const werte = {};
  /** @type {string[]} */
  const fehlend = [];

  for (const feld of FELDER) {
    const roh = daten[feld.name];
    const wert = typeof roh === "string" ? roh.trim().slice(0, feld.max) : "";
    werte[feld.name] = wert;
    if (feld.pflicht && wert === "") {
      fehlend.push(feld.label);
    }
  }

  return { werte, fehlend };
}

/**
 * Absichtlich zurueckhaltend: eine E-Mail-Adresse laesst sich per Regex nicht
 * vollstaendig validieren, und zu strenge Muster weisen echte Adressen ab.
 * Geprueft wird nur, was sicher falsch ist.
 *
 * @param {string} wert
 * @returns {boolean}
 */
function istEmail(wert) {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(wert);
}

/**
 * Baut den Mailjet-Body. `ReplyTo` steht auf dem Absender der Anfrage, damit
 * Karlson im Postfach direkt antworten kann.
 *
 * @param {Record<string, string>} werte
 * @param {string} absender
 * @param {string} empfaenger
 */
function mailBauen(werte, absender, empfaenger) {
  const zeilen = FELDER.filter((feld) => werte[feld.name] !== "").map(
    (feld) => `${feld.label}: ${werte[feld.name]}`,
  );

  const text = [
    "Neue Auftrittsanfrage ueber die Website.",
    "",
    ...zeilen,
    "",
    "---",
    "Gesendet ueber das Anfrageformular auf karlson-solo-orchester.de.",
    "Antworten geht direkt an den Absender.",
  ].join("\n");

  return {
    Messages: [
      {
        From: { Email: absender, Name: "Karlson Website" },
        To: [{ Email: empfaenger, Name: "Karlson" }],
        ReplyTo: { Email: werte.email, Name: werte.name },
        // Der Anlass im Betreff macht die Mail im Postfach sofort einordbar.
        Subject: `Auftrittsanfrage: ${werte.anlass} am ${werte.datum}`,
        TextPart: text,
      },
    ],
  };
}

/**
 * @param {unknown} nutzlast
 * @param {number} status
 * @param {Record<string, string>} [zusatzHeader]
 * @returns {Response}
 */
function jsonAntwort(nutzlast, status, zusatzHeader = {}) {
  return new Response(JSON.stringify(nutzlast), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Antworten auf Formularabsendungen darf niemand zwischenspeichern.
      "cache-control": "no-store",
      ...zusatzHeader,
    },
  });
}
