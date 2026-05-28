import Link from "next/link";
import { highlightAppearances, site } from "../data";

export const metadata = {
  title: "Für Veranstalter",
  description:
    "Technik, Pressetext, Pressebilder, Referenzen und Kontakt für Gemeinden, Vereine und Firmen, die Karlson buchen möchten.",
};

export default function VeranstalterPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Für Veranstalter</span>
          <h1>Alles Wichtige für Planung, Presse und Bühne.</h1>
          <p>
            Gemeinden, Vereine und Firmen finden hier kompakt die Informationen,
            die für die Planung einer Veranstaltung mit Karlson nötig sind.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Referenzen</span>
            <h2>Drei Bühnen, die für sich sprechen.</h2>
          </div>
          <p>
            Vom Traditionsfest im Havelland über die Landesbühne
            Brandenburgs bis zur internationalen Messe in Berlin.
          </p>
        </div>
        <div className="grid-3">
          {highlightAppearances.map((item) => (
            <article className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p className="muted">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section grid-2">
        <article className="card">
          <h2>Technik</h2>
          <p>
            Karlson bringt eine kompakte Grundausstattung mit. Benötigt werden:
            ein funktionstüchtiger Stromanschluss, ausreichend Bühnenfläche
            für Gitarre, Mikrofon, Fußpercussion und Technik – sowie bei
            Open-Air ein trockener, sicherer Wetterschutz.
          </p>
        </article>
        <article className="card">
          <h2>Pressetext</h2>
          <p>
            Karlson – bürgerlich Frank Haupt-Tschachtschal – ist Liedermacher,
            Singer-Songwriter und One-Man-Band aus Ketzin im Havelland.
            Gitarre, Mundharmonika, Fußpercussion und Gesang spielt er
            gleichzeitig – das klingt wie eine kleine Band, ist aber ein
            Mann. Sein Repertoire reicht von eigenen Havelland-Liedern bis zu
            Pop-, Rock- und Schlagerklassikern.
          </p>
        </article>
        <article className="card">
          <h2>Pressebilder</h2>
          <p>
            Pressefotos können auf Anfrage zur Verfügung gestellt werden. Eine
            aktuelle Pressefoto-Session ist in Vorbereitung.
          </p>
        </article>
        <article className="card">
          <h2>Logo</h2>
          <p>
            Das Karlson-Logo kann auf Anfrage in druckfähiger Form bereitgestellt
            werden.
          </p>
        </article>
      </section>

      <section className="section">
        <div className="notice card">
          <h2>Direkter Draht</h2>
          <p>
            Für Veranstalter ist der schnellste Weg ein kurzer Anruf oder eine
            E-Mail mit Datum, Ort und Anlass.
          </p>
          <div className="actions">
            <a className="button" href={site.phoneHref}>{site.phone}</a>
            <a className="button secondary" href={`mailto:${site.email}`}>{site.email}</a>
          </div>
          <Link className="text-link" href="/buchung">Mehr zur Buchung</Link>
        </div>
      </section>
    </main>
  );
}
