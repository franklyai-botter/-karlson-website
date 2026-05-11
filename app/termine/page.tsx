import Link from "next/link";

export const metadata = {
  title: "Termine",
  description: "Öffentliche Termine und Auftritte von Karlson im Havelland, in Brandenburg und Berlin.",
};

export default function TerminePage() {
  return (
    <main>
      <section className="page-hero">
        <div className="section">
          <span className="eyebrow">Termine</span>
          <h1>Öffentliche Auftritte folgen.</h1>
          <p>
            Hier werden künftig öffentliche Termine gepflegt. Jeder bestätigte
            Termin kann zusätzlich mit Event-Strukturdaten für Suchmaschinen
            ausgezeichnet werden.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="notice card">
          <h2>Noch keine öffentlichen Termine eingetragen.</h2>
          <p>
            Für private Feiern, Firmenveranstaltungen, Vereinsfeste oder kommunale
            Veranstaltungen kann Karlson direkt angefragt werden.
          </p>
          <Link className="button" href="/buchung">Auftritt anfragen</Link>
        </div>
      </section>
    </main>
  );
}
