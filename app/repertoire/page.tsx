import { repertoireGroups } from "../data";

export const metadata = {
  title: "Repertoire",
  description: "Karlsons Repertoire umfasst rund 320 Titel aus Singer-Songwriter, Deutschpop, Rock, Oldies, Schlager und Volksliedern.",
};

const examples = [
  "Hier gehör ich hin",
  "Im Havelland",
  "Mein Etzin",
  "Wenn Karneval in Retzow ist",
  "Wenn ich an Tremmen denk",
  "Tannenhofsong",
];

export default function RepertoirePage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Repertoire</span>
          <h1>320 Titel, aber kein Abend von der Stange.</h1>
          <p>
            Die vollständige Liste wird erst veröffentlicht, wenn Rechte,
            GEMA-Status und die gewünschte Auswahl geklärt sind. Für den Start
            zeigen wir Stilrichtungen und eigene Lieder.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="tag-list">
          {repertoireGroups.map((group) => <span key={group}>{group}</span>)}
        </div>
      </section>
      <section className="split-band">
        <div className="section grid-2">
          <article className="card">
            <h2>Eigene Havelland-Lieder</h2>
            <p>
              Karlson schreibt über Orte, Menschen und Geschichten aus der Region.
              Diese Lieder sind ein wichtiger Unterschied zu reinen Cover-Acts.
            </p>
          </article>
          <article className="card">
            <h2>Beispielauswahl</h2>
            <ul>
              {examples.map((title) => <li key={title}>{title}</li>)}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
