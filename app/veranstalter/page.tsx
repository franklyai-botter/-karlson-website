import Link from "next/link";

export const metadata = {
  title: "Für Veranstalter",
  description: "Technik, Pressetext, Pressebilder und Buchungsinformationen für Veranstalter, die Karlson buchen möchten.",
};

export default function VeranstalterPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Für Veranstalter</span>
          <h1>Alles Wichtige für Planung, Presse und Bühne.</h1>
          <p>
            Dieser Bereich übernimmt die beste Idee der Referenzseite: Veranstalter
            finden schnell Technikdaten, Kurzvita, Pressebilder und Kontakt.
          </p>
        </div>
      </section>
      <section className="section grid-2">
        <article className="card">
          <h2>Technik</h2>
          <p>
            Trocken, sicher, gut hörbar: Karlson braucht je nach Veranstaltungsgröße
            Strom, Wetterschutz bei Open-Air und ausreichend Platz für Gitarre,
            Mikrofon und Technik.
          </p>
        </article>
        <article className="card">
          <h2>Pressetext</h2>
          <p>
            Karlson ist Liedermacher, Singer-Songwriter und Alleinunterhalter aus
            Ketzin im Havelland. Er spielt eigene Havelland-Lieder und bekannte
            Songs in persönlicher Interpretation.
          </p>
        </article>
        <article className="card">
          <h2>Pressebilder</h2>
          <p>
            Downloadfähige Pressebilder werden erst bereitgestellt, wenn
            Fotografen- und Nutzungsrechte schriftlich geklärt sind.
          </p>
        </article>
        <article className="card">
          <h2>Logo</h2>
          <p>
            Das Logo liegt derzeit als JPG vor. Für Downloads sollte noch eine
            transparente PNG- oder SVG-Datei bereitgestellt werden.
          </p>
        </article>
      </section>
      <section className="split-band">
        <div className="section">
          <div className="notice card">
            <h2>Planung anstoßen</h2>
            <p>
              Datum, Ort, Anlass, erwartete Gästezahl und gewünschte Auftrittsdauer
              reichen für eine erste Einschätzung.
            </p>
            <Link className="button" href="/buchung">Buchung anfragen</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
