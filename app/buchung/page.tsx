import { site } from "../data";
import { AnfrageFormular } from "./anfrage-formular";

export const metadata = {
  title: "Kontakt & Buchung",
  description:
    "Karlson für einen Auftritt anfragen – per Formular, E-Mail oder Telefon. Für Stadtfeste, Firmenfeiern, Hochzeiten, private Feiern, Kulturabende und Kinderprogramme.",
};

// Das Formular wird erst ausgeliefert, wenn der Versand eingerichtet ist
// (Mailjet-Konto, verifizierter Absender, Secrets im Cloudflare-Projekt).
// Solange die Variable fehlt, zeigt die Seite wie bisher nur Telefon und
// E-Mail — besser als ein Formular, das beim Absenden scheitert. Umschalten:
// NEXT_PUBLIC_FORMULAR_AKTIV=1 im Cloudflare-Projekt setzen, siehe DEPLOY.md.
const formularAktiv = process.env.NEXT_PUBLIC_FORMULAR_AKTIV === "1";

const checklist = [
  "Datum und Uhrzeit",
  "Veranstaltungsort und Anlass",
  "Drinnen oder Open-Air",
  "Erwartete Gästezahl",
  "Gewünschte Auftrittsdauer",
  "Wunschprogramm (Solo, One-Man-Band, Kinder, Duo mit Klavier)",
];

// Frueher stand hier "karlson-musik.de" — das ist die Domain einer fremden
// Band. Beim Domain-Wechsel am 20.08.2026 wurde diese Stelle uebersehen.
const mailSubject = encodeURIComponent("Auftrittsanfrage über karlson-solo-orchester.de");
const mailBody = encodeURIComponent(
  [
    "Hallo Karlson,",
    "",
    "ich möchte Sie gerne für einen Auftritt anfragen.",
    "",
    "Datum / Uhrzeit:",
    "Veranstaltungsort:",
    "Anlass:",
    "Drinnen oder Open-Air:",
    "Erwartete Gästezahl:",
    "Gewünschte Auftrittsdauer:",
    "Wunschprogramm:",
    "",
    "Weitere Informationen:",
    "",
    "Viele Grüße",
  ].join("\n"),
);

export default function KontaktPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Kontakt &amp; Buchung</span>
          <h1>Auftritt anfragen – direkt und persönlich.</h1>
          <p>
            {formularAktiv
              ? "Formular ausfüllen, anrufen oder eine E-Mail schreiben – alle drei Wege landen direkt bei Karlson."
              : "Anfragen kommen am liebsten per E-Mail oder Telefon. So bleibt der Kontakt persönlich und Karlson kann gleich konkret antworten."}
          </p>
        </div>
      </section>

      {formularAktiv ? (
        <section className="section">
          <AnfrageFormular />
        </section>
      ) : null}

      <section className="section grid-2">
        <article className="card">
          <h2>Direktkontakt</h2>
          <p>
            <strong>Telefon:</strong>{" "}
            <a href={site.phoneHref}>{site.phone}</a>
          </p>
          <p>
            <strong>E-Mail:</strong>{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          <p className="muted">
            Auf E-Mails antwortet Karlson in der Regel innerhalb von ein bis
            zwei Werktagen.
          </p>
          <div className="actions">
            <a className="button" href={`tel:${site.phone.replace(/\s+/g, "")}`}>
              Jetzt anrufen
            </a>
            <a
              className="button secondary"
              href={`mailto:${site.email}?subject=${mailSubject}&body=${mailBody}`}
            >
              E-Mail vorbereiten
            </a>
          </div>
        </article>

        <article className="card">
          {/* Ohne Formular ist diese Liste die Anleitung fuer die Anfrage.
              Mit Formular fragt das Formular dasselbe schon ab — dann ist die
              Liste nur noch fuer den Anruf da und wird entsprechend betitelt. */}
          <h2>{formularAktiv ? "Für den Anruf: das hilft" : "Damit ein gutes Angebot rauskommt"}</h2>
          <p>
            {formularAktiv
              ? "Wer lieber telefoniert, hat diese Angaben am besten gleich parat:"
              : "Diese Angaben helfen, schnell ein passendes Angebot zu machen:"}
          </p>
          <ul>
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {/* karte-fuss: sitzt am Kartenboden, damit dieser Abschluss auf
              derselben Hoehe liegt wie die Knopfreihe der Karte daneben. */}
          <p className="muted karte-fuss">
            Wenn etwas davon noch offen ist: einfach mit anrufen, das klären wir
            gemeinsam.
          </p>
        </article>
      </section>

      <section className="section">
        <div className="notice card">
          <span className="eyebrow">Kurz vorab</span>
          <h2>Spielgebiet und Konditionen auf einen Blick.</h2>
          <ul>
            <li>
              Spielgebiet: Havelland, ganz Brandenburg und Berlin – im Umkreis
              von 10 km um Ketzin ohne Fahrtkostenaufschlag.
            </li>
            <li>Honorar nach Programm, Dauer und Anlass – auf Anfrage.</li>
            <li>
              Kleinunternehmer gemäß § 19 UStG – Rechnungen ohne
              Umsatzsteuer.
            </li>
            <li>
              Bei Open-Air sorgt der Veranstalter für Wetterschutz; bei
              wetterbedingter Absage 50 % Ausfallhonorar.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
