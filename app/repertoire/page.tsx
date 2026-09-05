import { repertoireGroups } from "../data";

export const metadata = {
  title: "Repertoire",
  description:
    "Karlsons Repertoire reicht von Singer-Songwriter und Deutschpop über Rockklassiker, Oldies und Schlager bis zu eigenen Havelland-Liedern.",
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
          <h1>Vielseitig – und immer passend zum Anlass.</h1>
          <p>
            Karlsons Repertoire deckt rund vier bis sechs Stunden Live-Musik
            ohne Wiederholung ab. Statt einer langen Titelliste zeigt diese
            Seite die Stilrichtungen, in denen Karlson zu Hause ist.
          </p>
        </div>
      </section>

      <section className="section">
        <span className="eyebrow">Stilrichtungen</span>
        {/* tag-raster statt der freien Wolke: gleich breite Spalten, damit die
            acht Stilrichtungen in zwei gleich langen Zeilen stehen. */}
        <div className="tag-list tag-raster">
          {repertoireGroups.map((group) => (
            <span key={group}>{group}</span>
          ))}
        </div>
      </section>

      <section className="split-band">
        <div className="section grid-2">
          <article className="card">
            <h2>Eigene Havelland-Lieder</h2>
            <p>
              Rund 30 Lieder hat Karlson selbst geschrieben – über Orte, Menschen
              und Geschichten aus der Region. Diese Lieder sind kein Beiwerk,
              sondern der ehrlichste Unterschied zu reinen Cover-Acts.
            </p>
            {/* karte-fuss: schliesst die Karte ab und sitzt deshalb am
                Kartenboden — auf derselben Hoehe wie der Abschluss der
                Nachbarkarte. */}
            <p className="muted karte-fuss">
              Karlson ist nicht GEMA-Mitglied; die eigenen Lieder sind nicht
              GEMA-pflichtig.
            </p>
          </article>
          <article className="card">
            <h2>Beispielauswahl eigener Lieder</h2>
            <ul>
              {examples.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="notice card">
          <h2>Wunschlied?</h2>
          <p>
            Gibt es einen Song, der unbedingt zur Feier gehört? Einfach bei der
            Anfrage mit angeben – wenn Karlson ihn schon im Repertoire hat,
            kommt er auf die Set-Liste; und ansonsten lernt er ihn gegen
            entsprechenden Vorlauf gern dazu.
          </p>
        </div>
      </section>
    </main>
  );
}
